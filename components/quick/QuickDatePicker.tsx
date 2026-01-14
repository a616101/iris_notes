'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon';
import { useToast } from '../ui/Toast';

interface QuickDatePickerProps {
  customerId: number;
  currentDate: string | null;
  onSuccess: () => void;
}

export default function QuickDatePicker({
  customerId,
  currentDate,
  onSuccess,
}: QuickDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224, // 224 = w-56 (14rem)
      });
    }
  }, [isOpen]);

  const handleDateChange = async (date: string) => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextTime: date }),
      });

      if (res.ok) {
        showToast('下次聯繫時間已更新', 'success');
        onSuccess();
        setIsOpen(false);
      } else {
        showToast('更新失敗', 'error');
      }
    } catch (error) {
      showToast('更新失敗，請稍後再試', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  const quickOptions = [
    { label: '今天', days: 0 },
    { label: '明天', days: 1 },
    { label: '3天後', days: 3 },
    { label: '一週後', days: 7 },
    { label: '兩週後', days: 14 },
    { label: '一個月後', days: 30 },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        title="快速更新下次聯繫時間"
      >
        <Icon name="calendar" size={18} />
      </button>
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
          }}
          className="w-56 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-2 text-xs font-black text-gray-500 uppercase">
            快速選擇
          </div>

          {quickOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleDateChange(getQuickDate(option.days))}
              disabled={isUpdating}
              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {option.label}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-2">
            <div className="text-xs font-black text-gray-500 uppercase mb-2">
              自訂日期
            </div>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 text-sm font-medium focus:border-brand-yellow outline-none"
            />
            {customDate && (
              <button
                onClick={() => handleDateChange(customDate)}
                disabled={isUpdating}
                className="w-full mt-2 px-4 py-2 rounded-xl bg-brand-blue text-white font-black text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                確認
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
