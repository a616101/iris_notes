# 小新開發筆記本 - Next.js 全端版

一個充滿動感的客戶關係管理系統（CRM），使用 Next.js 14 + Prisma + PostgreSQL 構建。

## 功能特色

- 🎨 **動感 UI**：保留原始 HTML 版本的「小新」風格設計
- 🔐 **身份驗證**：基於 NextAuth.js 的安全登入系統
- 📊 **客戶管理**：完整的 CRUD 操作
- 🔍 **智能搜尋**：多維度篩選與搜尋
- 📈 **數據分析**：等級分佈、開發節奏月曆、轉化追蹤
- 📥 **Excel 匯入**：批量匯入客戶資料
- 🐳 **Docker 支援**：一鍵部署開發與生產環境

## 技術架構

- **前端**: Next.js 14 (App Router), React 18, Tailwind CSS
- **後端**: Next.js API Routes, Server Actions
- **資料庫**: PostgreSQL 16
- **ORM**: Prisma
- **身份驗證**: NextAuth.js
- **部署**: Docker Compose

## 快速開始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- npm 或 yarn

### 本地開發

1. **克隆專案**

```bash
git clone <repository-url>
cd iris_notes
```

2. **安裝依賴**

```bash
npm install
```

3. **環境變數設定**

複製 `.env.example` 為 `.env` 並調整配置：

```bash
cp .env.example .env
```

4. **啟動資料庫**

```bash
docker-compose up -d postgres
```

5. **執行資料庫遷移**

```bash
npx prisma migrate dev
```

6. **載入種子數據**

```bash
npm run prisma:seed
```

7. **啟動開發伺服器**

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

### 快速啟動腳本

使用提供的腳本一鍵啟動開發環境：

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### 預設登入資訊

- **帳號**: `admin`
- **密碼**: `admin123`

## Docker 部署

### 開發環境

```bash
# 僅啟動資料庫
docker-compose up -d postgres

# 本地運行 Next.js
npm run dev
```

### 生產環境

```bash
# 構建並啟動所有服務
docker-compose up -d

# 執行資料庫遷移
docker-compose exec app npx prisma migrate deploy
```

## 專案結構

```
iris_notes/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # 儀表板頁面（需登入）
│   │   ├── page.tsx         # 主頁面
│   │   └── layout.tsx       # 佈局
│   ├── api/                 # API 路由
│   │   ├── auth/           # NextAuth.js
│   │   ├── customers/      # 客戶管理 API
│   │   ├── analytics/      # 分析統計 API
│   │   └── import/         # Excel 匯入 API
│   ├── login/              # 登入頁面
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 根頁面
│   └── globals.css         # 全域樣式
├── components/              # React 元件
│   ├── Icon.tsx            # 圖標元件
│   ├── LevelBadge.tsx      # 等級標籤
│   ├── SearchFilter.tsx    # 搜尋篩選
│   ├── CustomerCard.tsx    # 客戶卡片
│   ├── AnalysisModal.tsx   # 分析彈窗
│   └── ImportModal.tsx     # 匯入彈窗
├── lib/                     # 工具函數
│   ├── prisma.ts           # Prisma 客戶端
│   └── auth.ts             # Auth 配置
├── prisma/                  # Prisma 配置
│   ├── schema.prisma       # 資料庫模型
│   └── seed.ts             # 種子數據
├── scripts/                 # 腳本
│   ├── dev.sh              # 開發環境啟動
│   └── init-db.sh          # 資料庫初始化
├── types/                   # TypeScript 類型
├── docker-compose.yml       # Docker Compose 配置
├── Dockerfile              # Docker 映像
├── next.config.js          # Next.js 配置
├── tailwind.config.ts      # Tailwind CSS 配置
└── package.json            # 依賴管理
```

## API 端點

詳細 API 文件請參閱 [docs/API.md](docs/API.md)

### 客戶管理

- `GET /api/customers` - 查詢客戶列表
- `POST /api/customers` - 新增客戶
- `GET /api/customers/:id` - 查詢單一客戶
- `PATCH /api/customers/:id` - 更新客戶
- `DELETE /api/customers/:id` - 刪除客戶
- `POST /api/customers/:id/logs` - 新增開發紀錄

### 分析統計

- `GET /api/analytics` - 取得統計數據

### Excel 匯入

- `POST /api/import` - 上傳 Excel 檔案

## 資料庫架構

詳細資料庫文件請參閱 [docs/DATABASE.md](docs/DATABASE.md)

### 主要模型

- **User**: 使用者
- **Customer**: 客戶
- **Contact**: 聯絡人
- **DevelopmentLog**: 開發紀錄
- **Category**: 產業類別

## 開發指令

```bash
# 開發伺服器
npm run dev

# 構建生產版本
npm run build

# 啟動生產伺服器
npm run start

# Prisma 操作
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 執行 migration
npm run prisma:seed        # 載入種子數據
npm run prisma:studio      # 打開 Prisma Studio

# 程式碼檢查
npm run lint
```

## Excel 匯入格式

匯入 Excel 檔案時，請使用以下欄位格式：

| 欄位名稱 | 必填 | 說明 |
|---------|------|------|
| 公司名稱 | ✅ | 客戶公司名稱 |
| 地址 | ✅ | 公司地址 |
| 產業類別 | ❌ | 製造/醫療/服務等 |
| 電話 | ❌ | 聯絡電話 |
| 等級 | ❌ | L1-L5 |
| 聯絡人 | ❌ | 窗口姓名 |
| 職稱 | ❌ | 窗口職稱 |
| 其他業務 | ❌ | 其他業務代號 |
| 下次聯繫時間 | ❌ | 日期格式 |

## 環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | 應用網址 | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session 加密金鑰 | 隨機字串 |
| `NODE_ENV` | 環境模式 | `development` / `production` |

## 疑難排解

### Prisma 錯誤

```bash
# 重新生成 Prisma Client
npx prisma generate

# 重置資料庫
npx prisma migrate reset
```

### Docker 問題

```bash
# 查看日誌
docker-compose logs -f

# 重新構建
docker-compose build --no-cache

# 清理並重新啟動
docker-compose down -v
docker-compose up -d
```

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

---

**充滿動感的開發筆記本，讓客戶管理也能如此有趣！** 👦✨
