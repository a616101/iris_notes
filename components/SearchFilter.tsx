'use client';

import Icon from './Icon';
import { useCategories } from '@/hooks/useCategories';

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterLevel: string;
  setFilterLevel: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
  onlyPending: boolean;
  setOnlyPending: (value: boolean) => void;
}

const levelOptions = ['L1', 'L2', 'L3', 'L4', 'L5'];

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterLevel,
  setFilterLevel,
  filterDate,
  setFilterDate,
  onlyPending,
  setOnlyPending,
}: SearchFilterProps) {
  const { items: categoryItems } = useCategories(true);
  const categories = categoryItems.length > 0 ? categoryItems.map((c) => c.name) : ['其他'];

  return (
    <div className="max-w-6xl mx-auto mb-6 bg-white p-6 rounded-[32px] shadow-sm border-2 border-brand-yellow-light flex flex-col gap-5">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋公司、聯絡人、筆記內容..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-yellow outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 min-w-[150px]">
          <Icon name="filter" className="text-gray-400 shrink-0" size={20} />
          <select
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 outline-none focus:border-brand-yellow text-sm font-bold bg-white cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="全部">所有產業</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[200px] relative">
          <Icon name="calendar" className="text-gray-400 shrink-0" size={20} />
          <div className="relative w-full">
            <input
              type="date"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 outline-none focus:border-brand-yellow text-sm font-bold bg-white"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 等級篩選 */}
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-50 pt-4">
        <span className="text-xs font-black text-gray-400 flex items-center gap-1 shrink-0">
          <Icon name="tag" size={14} /> 等級篩選：
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLevel('全部')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterLevel === '全部' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {levelOptions.map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterLevel === level ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-gray-50 pt-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-blue transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
          </div>
          <span className={`text-sm font-black ${onlyPending ? 'text-brand-blue' : 'text-gray-500'}`}>
            僅顯示待回覆
          </span>
        </label>
      </div>
    </div>
  );
}
