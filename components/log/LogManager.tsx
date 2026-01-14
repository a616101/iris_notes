'use client';

import { useState } from 'react';
import Icon from '../Icon';
import FormField, { Input, TextArea } from '../ui/FormField';
import { useFormState } from '@/hooks/useFormState';
import { useFormValidation } from '@/hooks/useFormValidation';
import { developmentLogSchema } from '@/lib/validations/customer';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

interface DevelopmentLog {
  id: number;
  logDate: string;
  method: string;
  notes: string;
}

interface LogManagerProps {
  customerId: number;
  logs: DevelopmentLog[];
  onUpdate: () => void;
}

const contactMethods = ['電話', 'LINE', 'Email', '實體', '視訊'];

export default function LogManager({ customerId, logs, onUpdate }: LogManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { formData, updateField, reset } = useFormState({
    logDate: '',
    method: '電話',
    notes: '',
  });

  const { errors, validateField, validate, clearAllErrors } = useFormValidation(developmentLogSchema);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );

  const handleEdit = (log: DevelopmentLog) => {
    setEditingId(log.id);
    reset({
      logDate: log.logDate.split('T')[0],
      method: log.method,
      notes: log.notes,
    });
    clearAllErrors();
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
    clearAllErrors();
  };

  const handleSubmit = async () => {
    if (!editingId || !validate(formData)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/logs/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('開發紀錄已更新', 'success');
        handleCancel();
        onUpdate();
      } else {
        const error = await res.json();
        showToast(error.error || '更新失敗', 'error');
      }
    } catch (error) {
      showToast('更新失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/logs/${deletingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('開發紀錄已刪除', 'success');
        setDeletingId(null);
        onUpdate();
      } else {
        const error = await res.json();
        showToast(error.error || '刪除失敗', 'error');
      }
    } catch (error) {
      showToast('刪除失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 font-medium">尚無開發紀錄</p>
        <p className="text-sm text-gray-400 mt-2">請使用「快速記錄」按鈕新增首筆紀錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedLogs.map((log) => (
        <div
          key={log.id}
          className="p-4 bg-white border-2 border-gray-100 rounded-2xl"
        >
          {editingId === log.id ? (
            // 編輯模式
            <div className="space-y-3">
              <FormField label="日期" error={errors.logDate}>
                <Input
                  type="date"
                  value={formData.logDate}
                  onChange={(e) => {
                    updateField('logDate', e.target.value);
                    validateField('logDate', e.target.value);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  error={!!errors.logDate}
                />
              </FormField>

              <FormField label="聯繫方式" error={errors.method}>
                <div className="flex gap-2 flex-wrap">
                  {contactMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => updateField('method', method)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.method === method
                          ? 'bg-brand-blue text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField
                label="紀錄內容"
                error={errors.notes}
                hint={`${formData.notes.length}/500 字`}
              >
                <TextArea
                  value={formData.notes}
                  onChange={(e) => {
                    updateField('notes', e.target.value);
                    validateField('notes', e.target.value);
                  }}
                  rows={4}
                  maxLength={500}
                  error={!!errors.notes}
                />
              </FormField>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          ) : (
            // 顯示模式
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-brand-blue">
                    {new Date(log.logDate).toLocaleDateString('zh-TW')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    {log.method}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(log)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingId(log.id)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Icon name="trash-2" size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">{log.notes}</p>
            </>
          )}
        </div>
      ))}

      {/* 刪除確認對話框 */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="刪除開發紀錄"
        message="確定要刪除此開發紀錄嗎？此操作無法復原。"
        confirmText="確認刪除"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
