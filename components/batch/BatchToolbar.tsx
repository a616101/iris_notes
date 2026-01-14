'use client';

import { useState } from 'react';
import Icon from '../Icon';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

interface BatchToolbarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: Set<number>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExit: () => void;
  onSuccess: () => void;
}

const levels = ['L1', 'L2', 'L3', 'L4', 'L5'];

export default function BatchToolbar({
  selectedCount,
  totalCount,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onExit,
  onSuccess,
}: BatchToolbarProps) {
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  const { showToast } = useToast();

  const handleBatchUpdateLevel = async (level: string) => {
    setIsOperating(true);

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/customers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level }),
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === selectedIds.size) {
        showToast(`成功更新 ${successCount} 個客戶的等級`, 'success');
      } else {
        showToast(`更新了 ${successCount}/${selectedIds.size} 個客戶`, 'warning');
      }

      onSuccess();
      onClearSelection();
      setIsLevelMenuOpen(false);
    } catch (error) {
      showToast('批量更新失敗', 'error');
    } finally {
      setIsOperating(false);
    }
  };

  const handleBatchDelete = async () => {
    setIsOperating(true);

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === selectedIds.size) {
        showToast(`成功刪除 ${successCount} 個客戶`, 'success');
      } else {
        showToast(`刪除了 ${successCount}/${selectedIds.size} 個客戶`, 'warning');
      }

      onSuccess();
      setIsDeleteDialogOpen(false);
      onExit();
    } catch (error) {
      showToast('批量刪除失敗', 'error');
    } finally {
      setIsOperating(false);
    }
  };

  const handleBatchExport = () => {
    setIsExportMenuOpen((v) => !v);
  };

  const downloadExport = async (format: 'csv' | 'xlsx') => {
    if (selectedIds.size === 0) return;

    setIsOperating(true);
    try {
      const ids = Array.from(selectedIds).join(',');
      const res = await fetch(`/api/customers/export?ids=${encodeURIComponent(ids)}&format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data?.error || '匯出失敗', 'error');
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `customers.${format}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast(format === 'csv' ? '已下載 CSV' : '已下載 Excel', 'success');
      setIsExportMenuOpen(false);
    } catch {
      showToast('匯出失敗', 'error');
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-gradient-to-r from-brand-blue to-blue-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon name="check-circle" size={24} />
            <div>
              <h3 className="font-black text-lg">批量操作模式</h3>
              <p className="text-sm opacity-90">
                已選擇 {selectedCount} / {totalCount} 家公司
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 全選/取消全選 */}
            {selectedCount === totalCount ? (
              <button
                onClick={onClearSelection}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors"
              >
                取消全選
              </button>
            ) : (
              <button
                onClick={onSelectAll}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors"
              >
                ✓ 全選
              </button>
            )}

            {/* 更新等級 */}
            <div className="relative">
              <button
                onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                disabled={selectedCount === 0 || isOperating}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                更新等級 <Icon name="chevron-down" size={14} />
              </button>

              {isLevelMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-10">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleBatchUpdateLevel(level)}
                      disabled={isOperating}
                      className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 刪除 */}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={selectedCount === 0 || isOperating}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon name="trash-2" size={16} />
              刪除
            </button>

            {/* 匯出 */}
            <div className="relative">
              <button
                onClick={handleBatchExport}
                disabled={selectedCount === 0 || isOperating}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="button"
              >
                <Icon name="download" size={16} />
                匯出 <Icon name="chevron-down" size={14} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-10">
                  <button
                    type="button"
                    onClick={() => downloadExport('csv')}
                    disabled={isOperating}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    下載 CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadExport('xlsx')}
                    disabled={isOperating}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    下載 Excel
                  </button>
                </div>
              )}
            </div>

            {/* 退出 */}
            <button
              onClick={onExit}
              disabled={isOperating}
              className="px-4 py-2 rounded-xl bg-white text-brand-blue font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              ✕ 退出
            </button>
          </div>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleBatchDelete}
        title="批量刪除客戶"
        message={`確定要刪除選中的 ${selectedCount} 個客戶嗎？這將同時刪除這些客戶的所有聯絡人和開發紀錄。此操作無法復原。`}
        confirmText="確認刪除"
        type="danger"
        isLoading={isOperating}
      />
    </>
  );
}
