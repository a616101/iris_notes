import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createCategorySchema = z
  .object({
    name: z.string().min(1, '類別名稱為必填').max(50, '類別名稱不可超過 50 個字'),
  })
  .strict();

// GET /api/categories - 取得所有類別
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ items: categories });
  } catch (error) {
    console.error('查詢類別錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// POST /api/categories - 新增類別
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const created = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    // Prisma unique constraint
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: '類別已存在' }, { status: 409 });
    }
    console.error('新增類別錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

