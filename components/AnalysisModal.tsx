'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import { levels } from './LevelBadge';

interface AnalyticsData {
  levelCounts: Record<string, number>;
  totalCount: number;
  logDates: Record<string, number>;
  convertedClients: Array<{
    id: number;
    company: string;
    category: string;
    level: string;
  }>;
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalysisModal({ isOpen, onClose }: AnalysisModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const analytics = await res.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('載入分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    if (!data) return null;

    // 生成當月日曆（假設12月有31天，從週五開始）
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const monthPrefix = '2023-12-';

    return (
      <div className="grid grid-cols-7 gap-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 pb-1">
            {d}
          </div>
        ))}
        {/* 假設 12/1 是週五 (補 5 個空位) */}
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {days.map((day) => {
          const dateStr = `${monthPrefix}${day.toString().padStart(2, '0')}`;
          const count = data.logDates[dateStr] || 0;
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all ${
                count > 0 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100/30' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <span className={`text-[9px] font-bold ${count > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{day}</span>
              {count > 0 && <span className="text-[11px] font-black text-blue-700 leading-none">{count}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-900/95 backdrop-blur-md z-[60] p-4 md:p-8 overflow-y-auto no-scrollbar">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Icon name="bar-chart-3" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black">開發成效數據庫</h2>
              <p className="opacity-70 font-bold italic">Dynamic Performance Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all">
            <Icon name="x" size={32} />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">
            <p className="text-xl font-bold">載入中...</p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. 等級家數統計 */}
            <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                <Icon name="tag" className="text-blue-600" size={20} /> 等級分佈
              </h3>
              <div className="space-y-4">
                {Object.entries(levels).map(([key, value]) => {
                  const count = data.levelCounts[key] || 0;
                  const percent = ((count / (data.totalCount || 1)) * 100).toFixed(0);
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${value.activeColor}`}>
                        {key}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{value.label.split(': ')[1]}</span>
                          <span className="text-blue-600">{count} 家</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${value.activeColor.split(' ')[0]}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="text-4xl font-black text-blue-600">{data.totalCount}</div>
                <div className="text-sm font-bold text-gray-400 mt-1">目前開發總家數</div>
              </div>
            </div>

            {/* 2. 開發節奏月曆 */}
            <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                <Icon name="calendar" className="text-red-500" size={20} /> 12月開發節奏
              </h3>
              {renderCalendar()}
              <p className="mt-5 text-[10px] text-gray-400 font-bold text-center leading-relaxed">
                網格內的數字代表該日產出的「開發筆數」
                <br />
                顏色深淺反映開發動能
              </p>
            </div>

            {/* 3. 轉化成效名單 */}
            <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                <Icon name="trending-up" className="text-orange-500" size={20} /> 轉化成功名單
              </h3>
              <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-700 font-black text-sm mb-1">
                  <Icon name="target" size={16} /> 關鍵轉換指標
                </div>
                <p className="text-[10px] text-orange-600 font-bold">成功由陌生接觸轉化為有溫度的 L4、L5 客戶。</p>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {data.convertedClients.length > 0 ? (
                  data.convertedClients.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800">{c.company}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{c.category}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${levels[c.level as keyof typeof levels].activeColor}`}>
                        {c.level}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-300 font-bold">尚無轉化紀錄</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
