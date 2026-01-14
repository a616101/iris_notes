'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';
import { useToast } from '../ui/Toast';

interface QuickLevelSelectProps {
  customerId: number;
  currentLevel: string;
  onSuccess: () => void;
}

const levels = [
  { value: 'L5', label: 'L5: 熱烈', color: 'bg-red-500' },
  { value: 'L4', label: 'L4: 約訪成功', color: 'bg-orange-500' },
  { value: 'L3', label: 'L3: 婉轉拒絕', color: 'bg-yellow-500' },
  { value: 'L2', label: 'L2: 冷漠', color: 'bg-blue-400' },
  { value: 'L1', label: 'L1: 無窗口', color: 'bg-gray-400' },
];

export default function QuickLevelSelect({
  customerId,
  currentLevel,
  onSuccess,
}: QuickLevelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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

  const handleLevelChange = async (newLevel: string) => {
    if (newLevel === currentLevel) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel }),
      });

      if (res.ok) {
        showToast('等級已更新', 'success');
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

  const currentLevelData = levels.find((l) => l.value === currentLevel);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-gray-100 hover:border-brand-yellow text-xs font-black transition-all disabled:opacity-50"
      >
        <span className={`w-2 h-2 rounded-full ${currentLevelData?.color}`} />
        {currentLevelData?.label}
        <Icon name="chevron-down" size={14} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleLevelChange(level.value)}
              className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors flex items-center gap-3 ${
                level.value === currentLevel
                  ? 'bg-blue-50 text-brand-blue'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${level.color}`} />
              {level.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
