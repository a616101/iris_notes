#!/bin/bash

# 初始化資料庫腳本

set -e

echo "🚀 啟動 PostgreSQL..."
docker-compose up -d postgres

echo "⏳ 等待資料庫準備就緒..."
sleep 5

echo "📦 執行 Prisma migration..."
npx prisma migrate dev --name init

echo "🌱 載入種子數據..."
npx prisma db seed

echo "✅ 資料庫初始化完成！"
