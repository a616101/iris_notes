'use client';

import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Icon from '@/components/Icon';
import { useToast } from '@/components/ui/Toast';

type PreviewRow = Record<string, any>;

export default function ImportWorkflowPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const requiredOk = useMemo(() => {
    if (!columns.length) return false;
    return columns.includes('公司名稱') && columns.includes('地址');
  }, [columns]);

  const handlePick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setResult(null);
    setPreview([]);
    setColumns([]);
    setFile(selectedFile);

    if (!selectedFile) return;

    try {
      const bytes = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as PreviewRow[];

      const cols = rows.length > 0 ? Object.keys(rows[0] || {}) : [];
      setColumns(cols);
      setPreview(rows.slice(0, 10));

      if (rows.length === 0) {
        showToast('Excel 檔案無資料', 'warning');
      }
    } catch {
      showToast('讀取 Excel 失敗，請確認檔案格式', 'error');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!requiredOk) {
      showToast('缺少必要欄位：公司名稱、地址', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        showToast('匯入完成', 'success');
      } else {
        setResult({ success: false, error: data.error });
        showToast(data.error || '匯入失敗', 'error');
      }
    } catch {
      setResult({ success: false, error: '上傳失敗，請稍後再試' });
      showToast('上傳失敗，請稍後再試', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
              <Icon name="file-up" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-blue">匯入</h1>
              <p className="mt-1 text-sm font-bold text-gray-400">
                目前支援：上傳、預覽、必填欄位檢查、批次匯入與錯誤回報。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handlePick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
            >
              <Icon name="upload" size={18} />
              選擇檔案
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Icon name="check-circle" size={18} />
              {uploading ? '匯入中...' : '開始匯入'}
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">檔案與欄位</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-black text-gray-400">檔名</div>
            <div className="mt-1 text-sm font-black text-gray-900">{file ? file.name : '尚未選擇'}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-black text-gray-400">必要欄位</div>
            <div className={`mt-1 text-sm font-black ${requiredOk ? 'text-green-600' : 'text-red-600'}`}>
              {requiredOk ? '已符合' : '缺少：公司名稱、地址'}
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-black text-gray-400">偵測到欄位</div>
            <div className="mt-1 text-sm font-black text-gray-900">{columns.length} 個</div>
          </div>
        </div>

        {columns.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {columns.map((c) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  c === '公司名稱' || c === '地址' ? 'bg-blue-50 text-brand-blue' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">預覽（前 10 筆）</h2>
        {preview.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-sm font-bold text-gray-400">
            選擇檔案後會顯示預覽。
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-black text-gray-400">
                  {columns.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    {columns.map((c) => (
                      <td key={c} className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">
                        {row[c] == null ? '' : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">匯入結果</h2>
        {!result ? (
          <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-sm font-bold text-gray-400">
            匯入後會在此顯示成功/失敗明細。
          </div>
        ) : result.success ? (
          <div className="mt-4">
            <div className="rounded-2xl bg-green-50 p-4 text-sm font-black text-green-700">
              成功匯入 {result.imported} 筆
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-3 rounded-2xl bg-yellow-50 p-4">
                <div className="text-sm font-black text-yellow-700">部分失敗：</div>
                <div className="mt-2 max-h-40 overflow-y-auto text-xs font-bold text-yellow-700 space-y-1 no-scrollbar">
                  {result.errors.map((err: string, i: number) => (
                    <div key={i}>- {err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700">
            {result.error || '匯入失敗'}
          </div>
        )}
      </section>
    </div>
  );
}

