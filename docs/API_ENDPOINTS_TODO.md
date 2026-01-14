# API 端點實作待辦清單

## 需要實作的 API 端點

### 1. 客戶更新端點

**路徑**: `app/api/customers/[id]/route.ts`

需要新增 `PATCH` 方法：

```typescript
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const id = parseInt(params.id);
  const body = await req.json();
  
  // 允許的更新欄位
  const { company, category, phone, address, level, otherSales, nextTime } = body;
  
  const data: any = {};
  if (company !== undefined) data.company = company;
  if (category !== undefined) {
    // 找到或創建類別
    const cat = await prisma.category.findFirst({ where: { name: category } });
    if (cat) data.categoryId = cat.id;
  }
  if (phone !== undefined) data.phone = phone || null;
  if (address !== undefined) data.address = address;
  if (level !== undefined) data.level = level;
  if (otherSales !== undefined) data.otherSales = otherSales || null;
  if (nextTime !== undefined) data.nextTime = nextTime ? new Date(nextTime) : null;

  const customer = await prisma.customer.update({
    where: { id },
    data,
    include: {
      category: true,
      contacts: true,
      logs: true,
    },
  });

  return NextResponse.json(customer);
}
```

### 2. 聯絡人 CRUD 端點

**路徑**: `app/api/customers/[id]/contacts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 新增聯絡人
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const customerId = parseInt(params.id);
  const { name, title } = await req.json();

  const contact = await prisma.contact.create({
    data: {
      name,
      title: title || null,
      customerId,
    },
  });

  return NextResponse.json(contact);
}
```

**路徑**: `app/api/customers/[customerId]/contacts/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 更新聯絡人
export async function PATCH(
  req: Request,
  { params }: { params: { customerId: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const id = parseInt(params.id);
  const { name, title } = await req.json();

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      name,
      title: title || null,
    },
  });

  return NextResponse.json(contact);
}

// 刪除聯絡人
export async function DELETE(
  req: Request,
  { params }: { params: { customerId: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const customerId = parseInt(params.customerId);
  const id = parseInt(params.id);

  // 檢查是否為最後一個聯絡人
  const contactCount = await prisma.contact.count({
    where: { customerId },
  });

  if (contactCount <= 1) {
    return NextResponse.json(
      { error: '無法刪除最後一個聯絡人' },
      { status: 400 }
    );
  }

  await prisma.contact.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
```

### 3. 開發紀錄更新與刪除端點

**路徑**: `app/api/customers/[customerId]/logs/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 更新開發紀錄
export async function PATCH(
  req: Request,
  { params }: { params: { customerId: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const id = parseInt(params.id);
  const { logDate, method, notes } = await req.json();

  const log = await prisma.developmentLog.update({
    where: { id },
    data: {
      logDate: new Date(logDate),
      method,
      notes,
    },
  });

  return NextResponse.json(log);
}

// 刪除開發紀錄
export async function DELETE(
  req: Request,
  { params }: { params: { customerId: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const id = parseInt(params.id);

  await prisma.developmentLog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
```

### 4. 客戶新增端點（需更新）

需要更新現有的 `app/api/customers/route.ts` 的 POST 方法以支援新的結構：

```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const body = await req.json();
  const { company, category, phone, address, level, otherSales, nextTime, contacts, initialLog } = body;

  // 找到或創建類別
  const cat = await prisma.category.upsert({
    where: { name: category },
    create: { name: category },
    update: {},
  });

  // 創建客戶（含聯絡人和初始紀錄）
  const customer = await prisma.customer.create({
    data: {
      company,
      categoryId: cat.id,
      phone: phone || null,
      address,
      level: level || 'L1',
      otherSales: otherSales || null,
      nextTime: nextTime ? new Date(nextTime) : null,
      contacts: {
        create: contacts.map((c: any) => ({
          name: c.name,
          title: c.title || null,
        })),
      },
      ...(initialLog && {
        logs: {
          create: {
            logDate: new Date(initialLog.logDate),
            method: initialLog.method,
            notes: initialLog.notes,
          },
        },
      }),
    },
    include: {
      category: true,
      contacts: true,
      logs: true,
    },
  });

  return NextResponse.json(customer);
}
```

## 實作優先順序

1. ✅ **高優先級**：客戶更新 (PATCH /api/customers/:id)
2. ✅ **高優先級**：客戶新增更新 (POST /api/customers)
3. ✅ **中優先級**：聯絡人 CRUD
4. ✅ **中優先級**：開發紀錄更新與刪除
5. ⏳ **低優先級**：批量匯出 API

## 測試建議

每個端點實作後，建議進行以下測試：

1. ✅ 授權驗證（未登入應返回 401）
2. ✅ 輸入驗證（必填欄位、格式檢查）
3. ✅ 成功案例（正常操作）
4. ✅ 錯誤處理（資料不存在、權限不足等）
5. ✅ 邊界條件（最後一個聯絡人刪除等）

---

**這些 API 端點實作後，整個 CRUD 系統就完全可用了！** 🚀
