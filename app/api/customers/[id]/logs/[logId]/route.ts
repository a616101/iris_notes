import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { developmentLogSchema } from '@/lib/validations/customer';

// PATCH /api/customers/[id]/logs/[logId] - 更新開發紀錄
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; logId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam, logId: logIdParam } = await context.params;

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

    // 驗證開發紀錄是否屬於該客戶
    const existingLog = await prisma.developmentLog.findFirst({
      where: {
        id: parseInt(logIdParam),
        customerId: parseInt(idParam),
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: '開發紀錄不存在' }, { status: 404 });
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

    const log = await prisma.developmentLog.update({
      where: { id: parseInt(logIdParam) },
      data: {
        logDate: new Date(logDate),
        method,
        notes,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('更新開發紀錄錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE /api/customers/[id]/logs/[logId] - 刪除開發紀錄
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; logId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam, logId: logIdParam } = await context.params;
    const customerId = parseInt(idParam);
    const logId = parseInt(logIdParam);

    // 驗證客戶是否屬於當前使用者
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: parseInt(session.user.id),
      },
    });

    if (!customer) {
      return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
    }

    // 驗證開發紀錄是否屬於該客戶
    const existingLog = await prisma.developmentLog.findFirst({
      where: {
        id: logId,
        customerId,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: '開發紀錄不存在' }, { status: 404 });
    }

    await prisma.developmentLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除開發紀錄錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
