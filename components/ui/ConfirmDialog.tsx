'use client';

import Icon from '../Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  type = 'info',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'alert-triangle' as const,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'alert-circle' as const,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'info' as const,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-[32px] shadow-2xl border-4 border-brand-yellow w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className={`w-16 h-16 ${style.bgColor} ${style.borderColor} border-2 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon name={style.icon} size={32} className={style.iconColor} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 font-medium">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-2xl font-black text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style.buttonColor}`}
          >
            {isLoading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
