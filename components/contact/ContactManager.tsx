'use client';

import { useState } from 'react';
import Icon from '../Icon';
import FormField, { Input } from '../ui/FormField';
import { useFormState } from '@/hooks/useFormState';
import { useFormValidation } from '@/hooks/useFormValidation';
import { contactSchema } from '@/lib/validations/customer';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Contact {
  id: number;
  name: string;
  title: string | null;
}

interface ContactManagerProps {
  customerId: number;
  contacts: Contact[];
  onUpdate: () => void;
}

export default function ContactManager({
  customerId,
  contacts,
  onUpdate,
}: ContactManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeleteingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { formData, updateField, reset } = useFormState({
    name: '',
    title: '',
  });

  const { errors, validateField, validate, clearAllErrors } = useFormValidation(contactSchema);

  const handleAdd = () => {
    setIsAdding(true);
    reset();
    clearAllErrors();
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    reset({
      name: contact.name,
      title: contact.title || '',
    });
    clearAllErrors();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
    clearAllErrors();
  };

  const handleSubmit = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const url = editingId
        ? `/api/customers/${customerId}/contacts/${editingId}`
        : `/api/customers/${customerId}/contacts`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(editingId ? '聯絡人已更新' : '聯絡人已新增', 'success');
        handleCancel();
        onUpdate();
      } else {
        const error = await res.json();
        showToast(error.error || '操作失敗', 'error');
      }
    } catch (error) {
      showToast('操作失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/contacts/${deletingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('聯絡人已刪除', 'success');
        setDeleteingId(null);
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

  return (
    <div className="space-y-4">
      {/* 現有聯絡人列表 */}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="p-4 bg-white border-2 border-gray-100 rounded-2xl"
        >
          {editingId === contact.id ? (
            // 編輯模式
            <div className="space-y-3">
              <FormField label="姓名" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    updateField('name', e.target.value);
                    validateField('name', e.target.value);
                  }}
                  error={!!errors.name}
                />
              </FormField>

              <FormField label="職稱" error={errors.title}>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    updateField('title', e.target.value);
                    validateField('title', e.target.value);
                  }}
                  error={!!errors.title}
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-gray-900">{contact.name}</h4>
                {contact.title && (
                  <p className="text-sm text-gray-600 font-medium">{contact.title}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  onClick={() => setDeleteingId(contact.id)}
                  disabled={contacts.length === 1}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={contacts.length === 1 ? '至少需要保留一個聯絡人' : '刪除聯絡人'}
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 新增聯絡人表單 */}
      {isAdding && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
          <div className="space-y-3">
            <FormField label="姓名" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => {
                  updateField('name', e.target.value);
                  validateField('name', e.target.value);
                }}
                placeholder="請輸入姓名"
                error={!!errors.name}
              />
            </FormField>

            <FormField label="職稱" error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                  validateField('title', e.target.value);
                }}
                placeholder="例如：總經理、採購主任"
                error={!!errors.title}
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
                {isSubmitting ? '新增中...' : '新增聯絡人'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增按鈕 */}
      {!isAdding && !editingId && (
        <button
          onClick={handleAdd}
          className="w-full px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2"
        >
          <Icon name="plus" size={18} />
          新增聯絡人
        </button>
      )}

      {/* 刪除確認對話框 */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeleteingId(null)}
        onConfirm={handleDelete}
        title="刪除聯絡人"
        message="確定要刪除此聯絡人嗎？此操作無法復原。"
        confirmText="確認刪除"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
