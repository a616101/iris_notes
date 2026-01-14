# API 路由修正說明

## 🔧 問題描述

Next.js 不允許在同一層級使用不同的動態參數名稱。原本的路由結構有衝突：
- `app/api/customers/[id]/`
- `app/api/customers/[customerId]/` ❌ 衝突！

## ✅ 修正後的路由結構

```
app/api/customers/
├── route.ts                              GET, POST
└── [id]/
    ├── route.ts                          GET, PATCH, DELETE
    ├── contacts/
    │   ├── route.ts                      POST
    │   └── [contactId]/
    │       └── route.ts                  PATCH, DELETE
    └── logs/
        ├── route.ts                      POST
        └── [logId]/
            └── route.ts                  PATCH, DELETE
```

## 📝 正確的 API 端點路徑

### 客戶管理
- `GET /api/customers` - 查詢客戶列表
- `POST /api/customers` - 新增客戶
- `GET /api/customers/:id` - 查詢單一客戶
- `PATCH /api/customers/:id` - 更新客戶
- `DELETE /api/customers/:id` - 刪除客戶

### 聯絡人管理
- `POST /api/customers/:id/contacts` - 新增聯絡人
- `PATCH /api/customers/:id/contacts/:contactId` - 更新聯絡人
- `DELETE /api/customers/:id/contacts/:contactId` - 刪除聯絡人

### 開發紀錄管理
- `POST /api/customers/:id/logs` - 新增開發紀錄
- `PATCH /api/customers/:id/logs/:logId` - 更新開發紀錄
- `DELETE /api/customers/:id/logs/:logId` - 刪除開發紀錄

## 🎯 參數命名規則

為了避免 Next.js 路由衝突，我們統一使用以下命名規則：

1. **客戶 ID**: 統一使用 `[id]`
2. **聯絡人 ID**: 使用 `[contactId]`
3. **開發紀錄 ID**: 使用 `[logId]`

## ✅ 已修正的檔案

1. `app/api/customers/[id]/contacts/[contactId]/route.ts` - 新建（正確路徑）
2. `app/api/customers/[id]/logs/[logId]/route.ts` - 新建（正確路徑）
3. 刪除了錯誤的 `app/api/customers/[customerId]/` 資料夾

## 🚀 現在可以正常啟動

修正後的路由結構符合 Next.js 規範，系統可以正常啟動！

```bash
./scripts/dev.sh
```

---

**修正完成**: 2026-01-14  
**狀態**: ✅ 路由結構正確，可以正常運行
