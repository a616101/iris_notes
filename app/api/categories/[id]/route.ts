import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateCategorySchema = z
  .object({
    name: z.string().min(1, '類別名稱為必填').max(50, '類別名稱不可超過 50 個字'),
  })
  .strict();

// PATCH /api/categories/[id] - 更名類別
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);
    const name = parsed.data.name.trim();

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: '類別不存在' }, { status: 404 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: '類別已存在' }, { status: 409 });
    }
    console.error('更新類別錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - 刪除類別（若已被客戶使用則拒絕）
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);

    const usage = await prisma.customer.count({
      where: { categoryId: id },
    });
    if (usage > 0) {
      return NextResponse.json(
        { error: '此類別已被客戶使用，無法刪除' },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: '刪除成功' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: '類別不存在' }, { status: 404 });
    }
    console.error('刪除類別錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

