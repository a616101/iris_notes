# 快速啟動指南

這份文件將幫助您在 5 分鐘內啟動「小新開發筆記本」！

## 方案一：本地開發（推薦新手）

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動資料庫

```bash
docker-compose up -d postgres
```

等待幾秒鐘讓 PostgreSQL 啟動完成。

### 3. 初始化資料庫

```bash
# 執行資料庫遷移
npx prisma migrate dev --name init

# 載入範例數據
npm run prisma:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

### 5. 開啟瀏覽器

訪問 [http://localhost:3000](http://localhost:3000)

使用預設帳號登入：
- **帳號**: `admin`
- **密碼**: `admin123`

---

## 方案二：一鍵啟動腳本

使用我們提供的腳本自動完成所有步驟：

```bash
# 給予執行權限（首次使用）
chmod +x scripts/dev.sh

# 執行啟動腳本
./scripts/dev.sh
```

這個腳本會自動：
1. 啟動 PostgreSQL
2. 執行資料庫遷移（如果需要）
3. 載入種子數據（如果是首次執行）
4. 啟動開發伺服器

---

## 方案三：完整 Docker 部署

如果您想要完整的容器化環境：

### 1. 構建並啟動所有服務

```bash
docker-compose up -d
```

### 2. 執行資料庫遷移

```bash
docker-compose exec app npx prisma migrate deploy
```

### 3. 訪問應用

訪問 [http://localhost:3000](http://localhost:3000)

---

## 驗證安裝

登入後，您應該看到：

- ✅ 三個範例客戶（動感幼稚園、妮妮兔子實業、黑磯私人保全）
- ✅ 搜尋與篩選功能正常運作
- ✅ 點擊「開發分析」可以看到統計數據
- ✅ 點擊「匯入」按鈕可以上傳 Excel

---

## 常見問題

### Q: 無法連接到資料庫？

**A**: 確認 PostgreSQL 容器正在運行：

```bash
docker-compose ps
```

如果沒有運行，啟動它：

```bash
docker-compose up -d postgres
```

### Q: Prisma 錯誤？

**A**: 重新生成 Prisma Client：

```bash
npx prisma generate
```

### Q: 端口被占用？

**A**: 修改 `.env` 文件中的端口設置，或停止占用端口的程序：

```bash
# 查看端口占用（macOS/Linux）
lsof -i :3000
lsof -i :5432

# 停止特定進程
kill -9 <PID>
```

### Q: 忘記密碼？

**A**: 重置資料庫並重新載入種子數據：

```bash
npx prisma migrate reset
```

預設密碼是 `admin123`

### Q: 想要清空所有資料重新開始？

**A**: 重置資料庫：

```bash
# 方法一：Prisma 重置（推薦）
npx prisma migrate reset

# 方法二：刪除並重建容器
docker-compose down -v
docker-compose up -d postgres
npx prisma migrate dev
npm run prisma:seed
```

---

## 下一步

現在您已經成功啟動應用，可以：

1. 📖 閱讀 [README.md](../README.md) 了解完整功能
2. 🔧 查看 [API.md](API.md) 學習 API 使用
3. 🗄️ 參考 [DATABASE.md](DATABASE.md) 了解資料結構
4. 🎨 開始自訂您的 CRM 系統！

---

## 開發工具

### Prisma Studio

視覺化資料庫管理工具：

```bash
npm run prisma:studio
```

訪問 [http://localhost:5555](http://localhost:5555)

### 查看資料庫日誌

```bash
docker-compose logs -f postgres
```

### 查看應用日誌

```bash
docker-compose logs -f app
```

---

## 停止服務

### 停止開發伺服器

在終端機按 `Ctrl + C`

### 停止資料庫

```bash
docker-compose down
```

### 完全清除（包含資料）

```bash
docker-compose down -v
```

---

**祝您開發愉快！充滿動感的 CRM 系統正等著您！** 👦✨

如有任何問題，請查閱完整文件或提交 Issue。
