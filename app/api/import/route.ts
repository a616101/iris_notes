import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// POST /api/import - Excel 匯入
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未上傳檔案' }, { status: 400 });
    }

    // 讀取 Excel 檔案
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel 檔案無資料' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const imported: any[] = [];
    const errors: string[] = [];

    // 批量處理
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // 驗證必填欄位
        const company = String(row['公司名稱'] || '').trim();
        const address = String(row['地址'] || '').trim();
        if (!company || !address) {
          errors.push(`第 ${i + 2} 行: 缺少公司名稱或地址`);
          continue;
        }

        // 重複檢查（以 同使用者 + 公司名稱 + 地址 為準）
        const dup = await prisma.customer.findFirst({
          where: {
            userId,
            company,
            address,
          },
          select: { id: true },
        });
        if (dup) {
          errors.push(`第 ${i + 2} 行: 重複資料（已存在客戶 ID: ${dup.id}）`);
          continue;
        }

        // 查找或建立類別
        const categoryName = String(row['產業類別'] || '其他').trim() || '其他';
        let category = await prisma.category.findUnique({ where: { name: categoryName } });

        if (!category) {
          category = await prisma.category.create({
            data: { name: categoryName },
          });
        }

        // 建立客戶
        const customer = await prisma.customer.create({
          data: {
            company,
            userId,
            categoryId: category.id,
            phone: row['電話'] || null,
            address,
            level: row['等級'] || 'L1',
            otherSales: row['其他業務'] || null,
            nextTime: row['下次聯繫時間'] ? new Date(row['下次聯繫時間']) : null,
            contacts: row['聯絡人']
              ? {
                  create: {
                    name: row['聯絡人'],
                    title: row['職稱'] || null,
                  },
                }
              : undefined,
          },
        });

        imported.push({
          id: customer.id,
          company: customer.company,
        });
      } catch (error: any) {
        errors.push(`第 ${i + 2} 行: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors,
      data: imported,
    });
  } catch (error) {
    console.error('匯入錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
