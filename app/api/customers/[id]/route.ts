import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerSchema } from '@/lib/validations/customer';

// GET /api/customers/[id] - 查詢單一客戶
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const customer = await prisma.customer.findFirst({
      where: {
        id: parseInt(idParam),
        userId: parseInt(session.user.id),
      },
      include: {
        category: true,
        contacts: true,
        logs: {
          orderBy: { logDate: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('查詢客戶錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

const updateCustomerPayloadSchema = z
  .object({
    company: customerSchema.shape.company.optional(),
    category: customerSchema.shape.category.optional(),
    phone: customerSchema.shape.phone.optional(),
    address: customerSchema.shape.address.optional(),
    level: customerSchema.shape.level.optional(),
    otherSales: customerSchema.shape.otherSales.optional(),
    nextTime: customerSchema.shape.nextTime.optional(),
  })
  .strict();

// PATCH /api/customers/[id] - 更新客戶資料
export async function PATCH(
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
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: parseInt(idParam),
        userId: parseInt(session.user.id),
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCustomerPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { company, category, phone, address, level, otherSales, nextTime } = parsed.data;

    let categoryId = existingCustomer.categoryId;

    // 如果類別有變更
    if (category) {
      let categoryRecord = await prisma.category.findUnique({
        where: { name: category },
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: category },
        });
      }

      categoryId = categoryRecord.id;
    }

    // 準備更新資料（只更新提供的欄位）
    const updateData: any = {};
    if (company !== undefined) updateData.company = company;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address;
    if (level !== undefined) updateData.level = level;
    if (otherSales !== undefined) updateData.otherSales = otherSales || null;
    if (nextTime !== undefined) updateData.nextTime = nextTime ? new Date(nextTime) : null;

    const customer = await prisma.customer.update({
      where: { id: parseInt(idParam) },
      data: updateData,
      include: {
        category: true,
        contacts: true,
        logs: {
          orderBy: { logDate: 'desc' },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('更新客戶錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - 刪除客戶
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

    // 驗證客戶是否屬於當前使用者
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: parseInt(idParam),
        userId: parseInt(session.user.id),
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除客戶錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
