import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics - 開發分析統計
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // 1. 等級統計
    const levelCounts = await prisma.customer.groupBy({
      by: ['level'],
      where: { userId },
      _count: { level: true },
    });

    const levelStats = {
      L1: 0,
      L2: 0,
      L3: 0,
      L4: 0,
      L5: 0,
    };

    levelCounts.forEach((item) => {
      if (item.level in levelStats) {
        levelStats[item.level as keyof typeof levelStats] = item._count.level;
      }
    });

    // 2. 總客戶數
    const totalCount = await prisma.customer.count({
      where: { userId },
    });

    // 3. 月曆數據（每日開發紀錄數量）
    const logs = await prisma.developmentLog.findMany({
      where: {
        customer: { userId },
      },
      select: {
        logDate: true,
      },
    });

    const logDates: Record<string, number> = {};
    logs.forEach((log) => {
      const dateStr = log.logDate.toISOString().split('T')[0];
      logDates[dateStr] = (logDates[dateStr] || 0) + 1;
    });

    // 4. 轉化成功客戶（L4, L5）
    const convertedClients = await prisma.customer.findMany({
      where: {
        userId,
        level: { in: ['L4', 'L5'] },
      },
      include: {
        category: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      levelCounts: levelStats,
      totalCount,
      logDates,
      convertedClients: convertedClients.map((c) => ({
        id: c.id,
        company: c.company,
        category: c.category.name,
        level: c.level,
      })),
    });
  } catch (error) {
    console.error('查詢分析數據錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
