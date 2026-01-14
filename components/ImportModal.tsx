'use client';

import { useState, useRef } from 'react';
import Icon from './Icon';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        if (data.imported > 0) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: '上傳失敗，請稍後再試' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border-4 border-brand-blue p-8">
        <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="file-spreadsheet" size={32} />
        </div>
        <h2 className="text-2xl font-black mb-4 text-brand-blue text-center">Excel 匯入功能</h2>

        {!result ? (
          <>
            <p className="font-bold text-gray-500 mb-6 text-sm text-center">
              上傳 Excel 檔案批量匯入客戶資料
              <br />
              <span className="text-xs text-gray-400">支援格式：.xlsx, .xls</span>
            </p>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-blue text-gray-600 font-bold transition-all flex items-center justify-center gap-2"
              >
                <Icon name="upload" size={20} />
                {file ? file.name : '選擇檔案'}
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-xs text-blue-600 font-bold">
              <p className="mb-2 font-black">📋 Excel 欄位格式：</p>
              <ul className="space-y-1 text-[10px]">
                <li>• 公司名稱（必填）</li>
                <li>• 地址（必填）</li>
                <li>• 產業類別</li>
                <li>• 電話</li>
                <li>• 等級（L1-L5）</li>
                <li>• 聯絡人</li>
                <li>• 職稱</li>
                <li>• 其他業務</li>
                <li>• 下次聯繫時間</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-black transition-all hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-brand-blue text-white px-6 py-3 rounded-2xl font-black transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '上傳中...' : '開始匯入'}
              </button>
            </div>
          </>
        ) : (
          <>
            {result.success ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="check-circle" size={32} />
                  </div>
                  <p className="text-lg font-black text-green-600 mb-2">匯入成功！</p>
                  <p className="text-sm text-gray-600">
                    成功匯入 <span className="font-black text-brand-blue">{result.imported}</span> 筆資料
                  </p>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-black text-yellow-700 mb-2">⚠️ 部分資料匯入失敗：</p>
                    <div className="max-h-32 overflow-y-auto text-[10px] text-yellow-600 space-y-1">
                      {result.errors.map((err: string, i: number) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="x-circle" size={32} />
                  </div>
                  <p className="text-lg font-black text-red-600 mb-2">匯入失敗</p>
                  <p className="text-sm text-gray-600">{result.error}</p>
                </div>
              </>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-brand-blue text-white px-6 py-3 rounded-2xl font-black transition-all hover:bg-blue-700"
            >
              關閉
            </button>
          </>
        )}
      </div>
    </div>
  );
}
