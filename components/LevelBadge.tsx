interface LevelBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

const levels = {
  L1: { label: 'L1: 無聯繫窗口', color: 'bg-gray-200 text-gray-700', activeColor: 'bg-gray-500 text-white' },
  L2: { label: 'L2: 有窗口 但冷漠', color: 'bg-blue-100 text-blue-700', activeColor: 'bg-blue-600 text-white' },
  L3: { label: 'L3: 有窗口 但婉轉拒絕', color: 'bg-yellow-100 text-yellow-700', activeColor: 'bg-yellow-600 text-white' },
  L4: { label: 'L4: 約訪成功', color: 'bg-orange-100 text-orange-700', activeColor: 'bg-orange-600 text-white' },
  L5: { label: 'L5: 熱烈', color: 'bg-red-100 text-red-700', activeColor: 'bg-red-600 text-white' },
};

export default function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const levelConfig = levels[level as keyof typeof levels];
  
  if (!levelConfig) return null;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <div className={`inline-block rounded-full font-black shadow-sm ${levelConfig.activeColor} ${sizeClasses[size]}`}>
      {levelConfig.label}
    </div>
  );
}

export { levels };
