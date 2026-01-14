'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/components/ui/Toast';

export default function CategoriesManager() {
  const { items, loading, error, refresh } = useCategories(true);
  const { showToast } = useToast();

  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sorted = useMemo(() => items.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')), [items]);

  useEffect(() => {
    if (!editingId) return;
    const cat = items.find((c) => c.id === editingId);
    if (!cat) return;
    setEditingName(cat.name);
  }, [editingId, items]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || '新增失敗', 'error');
        return;
      }
      showToast('類別已新增', 'success');
      setNewName('');
      refresh();
    } catch {
      showToast('新增失敗', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || '更新失敗', 'error');
        return;
      }
      showToast('類別已更新', 'success');
      setEditingId(null);
      refresh();
    } catch {
      showToast('更新失敗', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || '刪除失敗', 'error');
        return;
      }
      showToast('類別已刪除', 'success');
      setDeletingId(null);
      refresh();
    } catch {
      showToast('刪除失敗', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">類別清單</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            建議維持精簡，避免使用者在新增/篩選時難以選擇。
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
        >
          <Icon name="history" size={18} /> 重新載入
        </button>
      </div>

      <div className="rounded-2xl border-2 border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-500 mb-2">新增類別</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：製造、醫療、服務..."
              className="w-full rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-brand-yellow"
              disabled={isCreating}
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon name="plus" size={18} />
            {isCreating ? '新增中...' : '新增'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="rounded-2xl bg-gray-50 p-5 text-sm font-bold text-gray-400">載入中...</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-5 text-sm font-bold text-gray-400">尚無類別</div>
        ) : (
          sorted.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-2xl border-2 border-gray-100 bg-white p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
                  <Icon name="tag" size={18} />
                </div>

                {editingId === c.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-100 px-3 py-2 text-sm font-black outline-none focus:border-brand-yellow md:w-64"
                    disabled={isSaving}
                  />
                ) : (
                  <div className="text-sm font-black text-gray-900">{c.name}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {editingId === c.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={isSaving}
                      className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-black text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving || !editingName.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Icon name="save" size={16} />
                      {isSaving ? '儲存中...' : '儲存'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingId(c.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                    >
                      <Icon name="edit" size={16} />
                      更名
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(c.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100"
                    >
                      <Icon name="trash-2" size={16} />
                      刪除
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirm (lightweight) */}
      {deletingId && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-black text-red-700">
              確定要刪除這個類別嗎？（若已被客戶使用，系統會拒絕刪除）
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Icon name="trash-2" size={16} />
                {isDeleting ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

