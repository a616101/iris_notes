import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  ids: z
    .string()
    .min(1)
    .transform((v) =>
      v
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => Number.isFinite(n))
    )
    .refine((arr) => arr.length > 0, 'ids 不可為空')
    .transform((arr) => Array.from(new Set(arr)).slice(0, 500)),
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

function csvEscape(value: unknown) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const parsed = querySchema.safeParse({
      ids: request.nextUrl.searchParams.get('ids') || '',
      format: request.nextUrl.searchParams.get('format') || 'csv',
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: '參數錯誤', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const { ids, format } = parsed.data;

    const customers: Array<{
      id: number;
      company: string;
      address: string;
      phone: string | null;
      level: string;
      otherSales: string | null;
      nextTime: Date | null;
      category: { name: string };
      contacts: Array<{ name: string; title: string | null }>;
      logs: Array<{ logDate: Date; method: string; notes: string }>;
    }> = await prisma.customer.findMany({
      where: {
        userId,
        id: { in: ids },
      },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        company: true,
        address: true,
        phone: true,
        level: true,
        otherSales: true,
        nextTime: true,
        category: { select: { name: true } },
        contacts: { select: { name: true, title: true }, orderBy: { id: 'asc' } },
        logs: {
          select: { logDate: true, method: true, notes: true },
          orderBy: { logDate: 'desc' },
          take: 1,
        },
      },
    });

    const rows = customers.map((c) => {
      const contacts = c.contacts
        .map((x) => (x.title ? `${x.name}(${x.title})` : x.name))
        .join('、');
      const latest = c.logs[0];

      return {
        客戶ID: c.id,
        公司名稱: c.company,
        產業類別: c.category.name,
        等級: c.level,
        地址: c.address,
        電話: c.phone ?? '',
        其他業務: c.otherSales ?? '',
        下次聯繫時間: c.nextTime ? c.nextTime.toISOString().split('T')[0] : '',
        聯絡人: contacts,
        最新聯繫日期: latest ? latest.logDate.toISOString().split('T')[0] : '',
        最新聯繫方式: latest ? latest.method : '',
        最新紀錄: latest ? latest.notes : '',
      };
    });

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-').split('Z')[0];

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'customers');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
      const bytes = new Uint8Array(buffer);

      return new NextResponse(bytes, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="customers-${stamp}.xlsx"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const headers = Object.keys(rows[0] || {
      客戶ID: '',
      公司名稱: '',
      產業類別: '',
      等級: '',
      地址: '',
      電話: '',
      其他業務: '',
      下次聯繫時間: '',
      聯絡人: '',
      最新聯繫日期: '',
      最新聯繫方式: '',
      最新紀錄: '',
    });
    const lines = [headers.map(csvEscape).join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => csvEscape((row as any)[h])).join(','));
    }

    // UTF-8 BOM for Excel compatibility
    const csv = '\uFEFF' + lines.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('匯出客戶錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

