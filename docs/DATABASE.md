# 資料庫架構文件

本文件詳細說明小新開發筆記本的資料庫架構設計。

## 資料庫技術

- **資料庫**: PostgreSQL 16
- **ORM**: Prisma
- **連線池**: Prisma Connection Pool

## 實體關係圖 (ERD)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │   Category   │       │   Customer  │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)     │
│ username    │◄─────┐│ name (UK)    │◄─────┐│ user_id(FK) │
│ password_hash│      ││              │      ││ category_id │
│ created_at  │      │└──────────────┘      ││ company     │
└─────────────┘      │                      ││ phone       │
                     │                      ││ address     │
                     │  ┌───────────────────┤│ level       │
                     │  │                   ││ other_sales │
                     │  │                   ││ next_time   │
                     └──┼───────────────────┤│ created_at  │
                        │                   ││ updated_at  │
                        │                   │└─────────────┘
                        │                   │      ▲
                        │                   │      │
                        │                   │      │
                        │             ┌─────┴───┬──┴────────┐
                        │             │         │           │
                        │      ┌──────┴─────┐   │   ┌───────┴──────────┐
                        │      │  Contact   │   │   │ DevelopmentLog   │
                        │      ├────────────┤   │   ├──────────────────┤
                        │      │ id (PK)    │   │   │ id (PK)          │
                        └──────┤customer_id │   └───┤ customer_id (FK) │
                               │ name       │       │ log_date         │
                               │ title      │       │ method           │
                               └────────────┘       │ notes            │
                                                    │ created_at       │
                                                    └──────────────────┘
```

## 資料表說明

### users（使用者）

儲存系統使用者的登入資訊。

| 欄位名 | 類型 | 約束 | 說明 |
|--------|------|------|------|
| `id` | INTEGER | PK, AUTO_INCREMENT | 使用者 ID |
| `username` | VARCHAR | UNIQUE, NOT NULL | 登入帳號 |
| `password_hash` | VARCHAR | NOT NULL | 加密後的密碼 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |

**索引**
- PRIMARY KEY: `id`
- UNIQUE: `username`

**關聯**
- 一對多: `Customer` (一個使用者可以有多個客戶)

---

### categories（產業類別）

儲存客戶的產業分類。

| 欄位名 | 類型 | 約束 | 說明 |
|--------|------|------|------|
| `id` | INTEGER | PK, AUTO_INCREMENT | 類別 ID |
| `name` | VARCHAR | UNIQUE, NOT NULL | 類別名稱 |

**索引**
- PRIMARY KEY: `id`
- UNIQUE: `name`

**預設資料**
- 製造
- 醫療
- 服務
- 政府
- 學校
- 醫院
- 其他

**關聯**
- 一對多: `Customer` (一個類別可以有多個客戶)

---

### customers（客戶）

儲存客戶的基本資料與開發狀態。

| 欄位名 | 類型 | 約束 | 說明 |
|--------|------|------|------|
| `id` | INTEGER | PK, AUTO_INCREMENT | 客戶 ID |
| `user_id` | INTEGER | FK → users.id, NOT NULL | 負責的業務 ID |
| `category_id` | INTEGER | FK → categories.id, NOT NULL | 產業類別 ID |
| `company` | VARCHAR | NOT NULL | 公司名稱 |
| `phone` | VARCHAR | NULLABLE | 聯絡電話 |
| `address` | VARCHAR | NOT NULL | 公司地址 |
| `level` | VARCHAR | DEFAULT 'L1' | 開發等級 (L1-L5) |
| `other_sales` | VARCHAR | NULLABLE | 其他負責業務代號 |
| `next_time` | TIMESTAMP | NULLABLE | 下次聯繫時間 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), AUTO UPDATE | 更新時間 |

**索引**
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `category_id`
- INDEX: `level`
- INDEX: `address` (用於地址排序)

**等級說明**
- `L1`: 無聯繫窗口
- `L2`: 有窗口但冷漠
- `L3`: 有窗口但婉轉拒絕
- `L4`: 約訪成功
- `L5`: 熱烈

**關聯**
- 多對一: `User` (多個客戶屬於一個使用者)
- 多對一: `Category` (多個客戶屬於一個類別)
- 一對多: `Contact` (一個客戶可以有多個聯絡人)
- 一對多: `DevelopmentLog` (一個客戶可以有多筆開發紀錄)

**刪除策略**
- 刪除使用者時：CASCADE 刪除所有相關客戶
- 刪除客戶時：CASCADE 刪除所有聯絡人和開發紀錄

---

### contacts（聯絡人）

儲存客戶的窗口聯絡人資訊。

| 欄位名 | 類型 | 約束 | 說明 |
|--------|------|------|------|
| `id` | INTEGER | PK, AUTO_INCREMENT | 聯絡人 ID |
| `customer_id` | INTEGER | FK → customers.id, NOT NULL | 客戶 ID |
| `name` | VARCHAR | NOT NULL | 聯絡人姓名 |
| `title` | VARCHAR | NULLABLE | 職稱 |

**索引**
- PRIMARY KEY: `id`
- INDEX: `customer_id`

**關聯**
- 多對一: `Customer` (多個聯絡人屬於一個客戶)

**刪除策略**
- 刪除客戶時：CASCADE 刪除所有聯絡人

---

### development_logs（開發紀錄）

儲存業務開發的追蹤紀錄。

| 欄位名 | 類型 | 約束 | 說明 |
|--------|------|------|------|
| `id` | INTEGER | PK, AUTO_INCREMENT | 紀錄 ID |
| `customer_id` | INTEGER | FK → customers.id, NOT NULL | 客戶 ID |
| `log_date` | DATE | NOT NULL | 紀錄日期 |
| `method` | VARCHAR | NOT NULL | 聯繫方式 |
| `notes` | TEXT | NOT NULL | 紀錄內容 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |

**索引**
- PRIMARY KEY: `id`
- INDEX: `customer_id`
- INDEX: `log_date` (用於日期篩選與月曆顯示)

**聯繫方式範例**
- 電話
- LINE
- Email
- 實體拜訪
- 視訊會議

**關聯**
- 多對一: `Customer` (多筆紀錄屬於一個客戶)

**刪除策略**
- 刪除客戶時：CASCADE 刪除所有開發紀錄

---

## Prisma Schema

完整的 Prisma schema 定義請參閱 `prisma/schema.prisma` 檔案。

```prisma
model User {
  id            Int        @id @default(autoincrement())
  username      String     @unique
  passwordHash  String     @map("password_hash")
  createdAt     DateTime   @default(now()) @map("created_at")
  customers     Customer[]

  @@map("users")
}

model Category {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  customers Customer[]

  @@map("categories")
}

model Customer {
  id         Int              @id @default(autoincrement())
  userId     Int              @map("user_id")
  company    String
  categoryId Int              @map("category_id")
  phone      String?
  address    String
  level      String           @default("L1")
  otherSales String?          @map("other_sales")
  nextTime   DateTime?        @map("next_time")
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category         @relation(fields: [categoryId], references: [id])
  contacts   Contact[]
  logs       DevelopmentLog[]

  @@index([userId])
  @@index([categoryId])
  @@index([level])
  @@index([address])
  @@map("customers")
}

// ... 其他模型定義
```

## 資料庫操作

### 常用查詢範例

**查詢使用者的所有客戶（含關聯資料）**

```typescript
const customers = await prisma.customer.findMany({
  where: { userId: 1 },
  include: {
    category: true,
    contacts: true,
    logs: {
      orderBy: { logDate: 'desc' },
    },
  },
});
```

**新增客戶（含聯絡人與初始紀錄）**

```typescript
const customer = await prisma.customer.create({
  data: {
    company: '測試公司',
    userId: 1,
    categoryId: 1,
    address: '台北市',
    contacts: {
      create: [{ name: '王小明', title: '經理' }],
    },
    logs: {
      create: {
        logDate: new Date(),
        method: '電話',
        notes: '初次聯繫',
      },
    },
  },
});
```

**統計各等級客戶數量**

```typescript
const levelStats = await prisma.customer.groupBy({
  by: ['level'],
  where: { userId: 1 },
  _count: { level: true },
});
```

---

## 資料庫維護

### Migration

```bash
# 建立新的 migration
npx prisma migrate dev --name migration_name

# 在生產環境執行 migration
npx prisma migrate deploy

# 重置資料庫（開發環境）
npx prisma migrate reset
```

### 備份與還原

```bash
# 備份資料庫
pg_dump -U postgres -d iris_notes > backup.sql

# 還原資料庫
psql -U postgres -d iris_notes < backup.sql
```

### Prisma Studio

使用 Prisma Studio 視覺化管理資料：

```bash
npx prisma studio
```

---

## 效能優化

### 索引策略

所有外鍵欄位都已建立索引以優化查詢效能：
- `customers.user_id`
- `customers.category_id`
- `customers.level`
- `customers.address`
- `contacts.customer_id`
- `development_logs.customer_id`
- `development_logs.log_date`

### 查詢優化建議

1. **使用 select 限制欄位**: 只取得需要的欄位
2. **適當使用 include**: 避免 N+1 查詢問題
3. **分頁處理大量資料**: 使用 `take` 和 `skip`
4. **使用 transaction**: 批量操作時使用事務

---

## 安全性

### 密碼加密

使用 bcryptjs 進行密碼加密，鹽值輪次設定為 10。

```typescript
import * as bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### SQL 注入防護

Prisma 自動處理參數化查詢，防止 SQL 注入攻擊。

### 資料隔離

所有查詢都必須包含 `userId` 條件，確保使用者只能存取自己的資料。

---

如有任何資料庫相關問題，請參閱 Prisma 官方文件或聯繫開發團隊。
