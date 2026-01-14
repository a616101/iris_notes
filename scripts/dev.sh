#!/bin/bash

# 開發環境快速啟動腳本

set -e

echo "🐘 啟動 PostgreSQL..."
docker-compose up -d postgres

echo "⏳ 等待資料庫準備就緒..."
sleep 3

echo "📦 檢查 Prisma 狀態..."
if [ ! -d "prisma/migrations" ]; then
  echo "🔧 執行首次 migration..."
  npx prisma migrate dev --name init
  echo "🌱 載入種子數據..."
  npx prisma db seed
else
  echo "✅ Prisma 已初始化"
fi

echo "🚀 啟動開發伺服器..."
npm run dev
