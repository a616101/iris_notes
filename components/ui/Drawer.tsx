'use client';

import { useEffect } from 'react';
import Icon from '../Icon';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
}: DrawerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const slideClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${side}-0 h-full w-full ${sizeClasses[size]} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${slideClasses[side]}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          {title && <h2 className="text-2xl font-black text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
            aria-label="關閉"
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
