import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contactSchema, customerSchema, developmentLogSchema } from '@/lib/validations/customer';

// GET /api/customers - 查詢客戶列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const date = searchParams.get('date') || '';
    const onlyPending = searchParams.get('onlyPending') === 'true';
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10) || 30, 1), 100);

    const where: any = {
      userId: parseInt(session.user.id),
    };

    // 搜尋條件
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { contacts: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { logs: { some: { notes: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // 類別篩選
    if (category && category !== '全部') {
      where.category = { name: category };
    }

    // 等級篩選
    if (level && level !== '全部') {
      where.level = level;
    }

    // 待回覆篩選
    if (onlyPending) {
      where.nextTime = { not: null };
    }

    // 日期篩選
    if (date) {
      where.logs = {
        some: {
          logDate: new Date(date),
        },
      };
    }

    const shouldSortByNextTime = onlyPending && !cursor;
    const customers: Array<{
      id: number;
      company: string;
      phone: string | null;
      address: string;
      level: string;
      otherSales: string | null;
      nextTime: Date | null;
      category: { id: number; name: string };
      contacts: Array<{ id: number; name: string; title: string | null }>;
      logs: Array<{ id: number; logDate: Date; method: string; notes: string }>;
      _count: { contacts: number; logs: number };
    }> = await prisma.customer.findMany({
      where,
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: parseInt(cursor, 10) },
          }
        : {}),
      orderBy: shouldSortByNextTime ? [{ nextTime: 'asc' }, { id: 'desc' }] : { id: 'desc' },
      select: {
        id: true,
        company: true,
        phone: true,
        address: true,
        level: true,
        otherSales: true,
        nextTime: true,
        category: { select: { id: true, name: true } },
        contacts: {
          select: { id: true, name: true, title: true },
          orderBy: { id: 'asc' },
          take: 3,
        },
        logs: {
          select: { id: true, logDate: true, method: true, notes: true },
          orderBy: { logDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            contacts: true,
            logs: true,
          },
        },
      },
    });

    const hasMore = customers.length > limit;
    const items = hasMore ? customers.slice(0, limit) : customers;
    // 若依 nextTime 排序（待回覆）則先不提供游標，避免順序不穩
    const nextCursor = shouldSortByNextTime ? null : hasMore ? items[items.length - 1]?.id ?? null : null;

    return NextResponse.json({
      items: items.map((c) => ({
        id: c.id,
        company: c.company,
        phone: c.phone,
        address: c.address,
        level: c.level,
        otherSales: c.otherSales,
        nextTime: c.nextTime?.toISOString() ?? null,
        category: c.category,
        contacts: c.contacts,
        logs: c.logs.map((l) => ({
          ...l,
          logDate: l.logDate.toISOString(),
        })),
        contactCount: c._count.contacts,
        logCount: c._count.logs,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error('查詢客戶列表錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

const createCustomerPayloadSchema = z.object({
  company: customerSchema.shape.company,
  category: customerSchema.shape.category,
  phone: customerSchema.shape.phone.optional(),
  address: customerSchema.shape.address,
  level: customerSchema.shape.level,
  otherSales: customerSchema.shape.otherSales.optional(),
  nextTime: customerSchema.shape.nextTime.optional(),
  contacts: z.array(contactSchema).min(1, '至少需要一個聯絡人'),
  initialLog: developmentLogSchema.optional(),
});

// POST /api/customers - 新增客戶
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCustomerPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { company, category, phone, address, level, otherSales, nextTime, contacts, initialLog } =
      parsed.data;

    // 查找或建立類別
    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category },
      });
    }

    // 建立客戶
    const customer = await prisma.customer.create({
      data: {
        company,
        userId: parseInt(session.user.id),
        categoryId: categoryRecord.id,
        phone: phone || null,
        address,
        level,
        otherSales: otherSales || null,
        nextTime: nextTime ? new Date(nextTime) : null,
        contacts: {
          create: contacts.map((c) => ({
            name: c.name,
            title: c.title || null,
          })),
        },
        logs: initialLog
          ? {
              create: {
                logDate: new Date(initialLog.logDate),
                method: initialLog.method,
                notes: initialLog.notes,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        contacts: true,
        logs: true,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('新增客戶錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
