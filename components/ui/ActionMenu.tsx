'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';

export interface ActionMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
}

export default function ActionMenu({ items, trigger }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="操作選單"
      >
        {trigger || <Icon name="more-vertical" size={20} />}
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`w-full px-4 py-3 text-left text-sm font-bold transition-colors flex items-center gap-3 ${
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {item.icon && <Icon name={item.icon as any} size={18} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
