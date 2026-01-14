import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations/customer';

// POST /api/customers/[id]/contacts - 新增聯絡人
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
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '資料格式錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, title } = parsed.data;

    const contact = await prisma.contact.create({
      data: {
        name,
        title: title ? title : null,
        customerId: parseInt(idParam),
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('新增聯絡人錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
