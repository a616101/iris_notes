# API 文件

本文件描述小新開發筆記本的所有 API 端點。

## 基礎資訊

- **Base URL**: `http://localhost:3000/api`
- **認證方式**: NextAuth.js Session (Cookie-based)
- **內容格式**: JSON

## 認證

所有 API 端點（除了 `/api/auth/*`）都需要登入後才能訪問。

### 登入

```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## 客戶管理

### 查詢客戶列表

查詢當前使用者的所有客戶，支援多種篩選條件。

```http
GET /api/customers?search=&category=&level=&date=&onlyPending=
```

**查詢參數**

| 參數 | 類型 | 說明 |
|------|------|------|
| `search` | string | 搜尋公司名稱、地址、聯絡人、筆記內容 |
| `category` | string | 產業類別篩選（全部/製造/醫療等） |
| `level` | string | 等級篩選（全部/L1/L2/L3/L4/L5） |
| `date` | string | 日期篩選（YYYY-MM-DD），篩選該日有紀錄的客戶 |
| `onlyPending` | boolean | 僅顯示有下次聯繫時間的客戶 |

**回應範例**

```json
[
  {
    "id": 1,
    "company": "動感幼稚園",
    "category": {
      "id": 1,
      "name": "學校"
    },
    "phone": "02-1234-5678",
    "address": "春日部市雙葉町 1-1",
    "level": "L5",
    "otherSales": "A",
    "nextTime": "2023-12-15T00:00:00.000Z",
    "contacts": [
      {
        "id": 101,
        "name": "吉永老師",
        "title": "主任"
      }
    ],
    "logs": [
      {
        "id": 1001,
        "logDate": "2023-11-03T00:00:00.000Z",
        "method": "電話",
        "notes": "承辦不在位子上，請下午再撥。"
      }
    ]
  }
]
```

---

### 新增客戶

建立新的客戶資料。

```http
POST /api/customers
Content-Type: application/json

{
  "company": "測試公司",
  "category": "製造",
  "phone": "02-1234-5678",
  "address": "台北市信義區",
  "level": "L1",
  "otherSales": "B",
  "nextTime": "2024-01-15",
  "contacts": [
    {
      "name": "王小明",
      "title": "經理"
    }
  ],
  "initialLog": {
    "date": "2024-01-01",
    "method": "電話",
    "notes": "初次聯繫"
  }
}
```

**欄位說明**

| 欄位 | 必填 | 類型 | 說明 |
|------|------|------|------|
| `company` | ✅ | string | 公司名稱 |
| `category` | ✅ | string | 產業類別 |
| `phone` | ❌ | string | 電話號碼 |
| `address` | ✅ | string | 地址 |
| `level` | ❌ | string | 等級（預設 L1） |
| `otherSales` | ❌ | string | 其他業務代號 |
| `nextTime` | ❌ | string | 下次聯繫時間 (ISO 8601) |
| `contacts` | ❌ | array | 聯絡人清單 |
| `initialLog` | ❌ | object | 初始開發紀錄 |

**回應**

```json
{
  "id": 2,
  "company": "測試公司",
  "category": {
    "id": 2,
    "name": "製造"
  },
  ...
}
```

---

### 查詢單一客戶

取得特定客戶的詳細資料。

```http
GET /api/customers/:id
```

**回應範例**

```json
{
  "id": 1,
  "company": "動感幼稚園",
  "category": { "id": 1, "name": "學校" },
  "phone": "02-1234-5678",
  "address": "春日部市雙葉町 1-1",
  "level": "L5",
  "otherSales": "A",
  "nextTime": "2023-12-15T00:00:00.000Z",
  "contacts": [...],
  "logs": [...]
}
```

---

### 更新客戶

更新客戶資料（部分更新）。

```http
PATCH /api/customers/:id
Content-Type: application/json

{
  "company": "新公司名稱",
  "level": "L3",
  "nextTime": "2024-02-01"
}
```

**可更新欄位**

- `company`: 公司名稱
- `category`: 產業類別
- `phone`: 電話
- `address`: 地址
- `level`: 等級
- `otherSales`: 其他業務
- `nextTime`: 下次聯繫時間

**回應**

```json
{
  "id": 1,
  "company": "新公司名稱",
  ...
}
```

---

### 刪除客戶

刪除特定客戶（會一併刪除聯絡人和開發紀錄）。

```http
DELETE /api/customers/:id
```

**回應**

```json
{
  "message": "刪除成功"
}
```

---

### 新增開發紀錄

為特定客戶新增開發追蹤紀錄。

```http
POST /api/customers/:id/logs
Content-Type: application/json

{
  "date": "2024-01-10",
  "method": "LINE",
  "notes": "客戶表示下週有空，可安排拜訪"
}
```

**欄位說明**

| 欄位 | 必填 | 類型 | 說明 |
|------|------|------|------|
| `date` | ✅ | string | 紀錄日期 (YYYY-MM-DD) |
| `method` | ✅ | string | 聯繫方式（電話/LINE/實體/Email等） |
| `notes` | ✅ | string | 紀錄內容 |

**回應**

```json
{
  "id": 2001,
  "customerId": 1,
  "logDate": "2024-01-10T00:00:00.000Z",
  "method": "LINE",
  "notes": "客戶表示下週有空，可安排拜訪",
  "createdAt": "2024-01-10T08:30:00.000Z"
}
```

---

## 分析統計

### 取得統計數據

取得當前使用者的客戶開發分析數據。

```http
GET /api/analytics
```

**回應範例**

```json
{
  "levelCounts": {
    "L1": 5,
    "L2": 3,
    "L3": 8,
    "L4": 12,
    "L5": 7
  },
  "totalCount": 35,
  "logDates": {
    "2023-12-01": 3,
    "2023-12-02": 5,
    "2023-12-03": 2
  },
  "convertedClients": [
    {
      "id": 1,
      "company": "動感幼稚園",
      "category": "學校",
      "level": "L5"
    }
  ]
}
```

**欄位說明**

- `levelCounts`: 各等級的客戶數量統計
- `totalCount`: 總客戶數
- `logDates`: 每日開發紀錄數量（用於月曆顯示）
- `convertedClients`: 轉化成功的客戶清單（L4、L5）

---

## Excel 匯入

### 上傳 Excel 檔案

批量匯入客戶資料。

```http
POST /api/import
Content-Type: multipart/form-data

file: [Excel 檔案]
```

**Excel 欄位格式**

| 欄位名稱 | 必填 | 說明 |
|---------|------|------|
| 公司名稱 | ✅ | 客戶公司名稱 |
| 地址 | ✅ | 公司地址 |
| 產業類別 | ❌ | 產業類別 |
| 電話 | ❌ | 聯絡電話 |
| 等級 | ❌ | L1-L5 |
| 聯絡人 | ❌ | 窗口姓名 |
| 職稱 | ❌ | 窗口職稱 |
| 其他業務 | ❌ | 其他業務代號 |
| 下次聯繫時間 | ❌ | 日期 |

**回應範例**

```json
{
  "success": true,
  "imported": 15,
  "errors": [
    "第 3 行: 缺少公司名稱或地址",
    "第 7 行: 日期格式錯誤"
  ],
  "data": [
    {
      "id": 10,
      "company": "ABC 公司"
    }
  ]
}
```

---

## 錯誤回應

所有 API 在發生錯誤時會返回以下格式：

```json
{
  "error": "錯誤訊息說明"
}
```

**常見 HTTP 狀態碼**

- `200 OK`: 請求成功
- `201 Created`: 資源建立成功
- `400 Bad Request`: 請求格式錯誤或缺少必填欄位
- `401 Unauthorized`: 未登入或 Session 過期
- `404 Not Found`: 資源不存在
- `500 Internal Server Error`: 伺服器錯誤

---

## 使用範例

### JavaScript / Fetch API

```javascript
// 查詢客戶列表
const response = await fetch('/api/customers?level=L5');
const customers = await response.json();

// 新增客戶
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company: '測試公司',
    category: '製造',
    address: '台北市',
  }),
});

// 新增開發紀錄
const response = await fetch('/api/customers/1/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-01-10',
    method: '電話',
    notes: '客戶有興趣',
  }),
});
```

---

如有任何問題，請參閱專案 README 或聯繫開發團隊。
