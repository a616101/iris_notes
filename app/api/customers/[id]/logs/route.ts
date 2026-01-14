import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { developmentLogSchema } from '@/lib/validations/customer';

// POST /api/customers/[id]/logs - 新增開發紀錄
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam } = await context.params;

    // 驗證客戶是否屬於當前使用者
    const customer = await prisma.customer.findFirst({
      where: {
        id: parseInt(idParam),
        userId: parseInt(session.user.id),
      },
    });

    if (!customer) {
      return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = developmentLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { logDate, method, notes } = parsed.data;

    const log = await prisma.developmentLog.create({
      data: {
        customerId: parseInt(idParam),
        logDate: new Date(logDate),
        method,
        notes,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('新增開發紀錄錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
