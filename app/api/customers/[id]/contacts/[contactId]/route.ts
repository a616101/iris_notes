import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations/customer';

// PATCH /api/customers/[id]/contacts/[contactId] - 更新聯絡人
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam, contactId: contactIdParam } = await context.params;

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

    // 驗證聯絡人是否屬於該客戶
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: parseInt(contactIdParam),
        customerId: parseInt(idParam),
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: '聯絡人不存在' }, { status: 404 });
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

    const contact = await prisma.contact.update({
      where: { id: parseInt(contactIdParam) },
      data: {
        name,
        title: title ? title : null,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('更新聯絡人錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE /api/customers/[id]/contacts/[contactId] - 刪除聯絡人
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: idParam, contactId: contactIdParam } = await context.params;
    const customerId = parseInt(idParam);
    const contactId = parseInt(contactIdParam);

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

    // 驗證聯絡人是否屬於該客戶
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        customerId,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: '聯絡人不存在' }, { status: 404 });
    }

    // 檢查是否為最後一個聯絡人
    const contactCount = await prisma.contact.count({
      where: { customerId },
    });

    if (contactCount <= 1) {
      return NextResponse.json(
        { error: '無法刪除最後一個聯絡人，每個客戶至少需要一個聯絡人' },
        { status: 400 }
      );
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除聯絡人錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
