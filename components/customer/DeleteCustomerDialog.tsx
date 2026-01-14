'use client';

import { useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: number;
    company: string;
    contacts: any[];
    logs: any[];
  } | null;
  onSuccess: () => void;
}

export default function DeleteCustomerDialog({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!customer) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('客戶已刪除', 'success');
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        showToast(error.error || '刪除失敗', 'error');
      }
    } catch (error) {
      showToast('刪除失敗，請稍後再試', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!customer) return null;

  const message = `確定要刪除「${customer.company}」嗎？這將會同時刪除 ${customer.contacts.length} 個聯絡人和 ${customer.logs.length} 筆開發紀錄。此操作無法復原。`;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="刪除客戶"
      message={message}
      confirmText="確認刪除"
      cancelText="取消"
      type="danger"
      isLoading={isDeleting}
    />
  );
}
