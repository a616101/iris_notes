'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { levels } from '@/components/LevelBadge';

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

function toMonthValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(() => toMonthValue(new Date()));

  useEffect(() => {
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

    fetchAnalytics();
  }, []);

  const calendar = useMemo(() => {
    if (!data) return null;
    const [yStr, mStr] = month.split('-');
    const year = parseInt(yStr, 10);
    const monthIndex0 = parseInt(mStr, 10) - 1;

    const first = new Date(year, monthIndex0, 1);
    const offset = first.getDay(); // 0=Sun
    const totalDays = daysInMonth(year, monthIndex0);
    const prefix = `${month}-`;

    const cells: Array<{ day: number | null; count: number }> = [];
    for (let i = 0; i < offset; i++) cells.push({ day: null, count: 0 });
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${prefix}${String(day).padStart(2, '0')}`;
      const count = data.logDates[dateStr] || 0;
      cells.push({ day, count });
    }
    return { year, monthIndex0, cells };
  }, [data, month]);

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
              <Icon name="bar-chart-3" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-blue">分析</h1>
              <p className="mt-1 text-sm font-bold text-gray-400">改為頁面後，可做月份/區間分析。</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-black text-gray-500">月份</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-black outline-none focus:border-brand-yellow"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="rounded-[28px] border-2 border-gray-100 bg-white p-8 shadow-sm text-center text-gray-400 font-bold">
          載入中...
        </div>
      ) : !data ? (
        <div className="rounded-[28px] border-2 border-gray-100 bg-white p-8 shadow-sm text-center text-gray-400 font-bold">
          尚無資料
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 等級分佈 */}
          <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Icon name="tag" size={18} className="text-brand-blue" /> 等級分佈
            </h2>
            <div className="mt-5 space-y-4">
              {Object.entries(levels).map(([key, value]) => {
                const count = data.levelCounts[key] || 0;
                const percent = ((count / (data.totalCount || 1)) * 100).toFixed(0);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${value.activeColor}`}>
                      {key}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold mb-1 text-gray-600">
                        <span>{value.label.split(': ')[1]}</span>
                        <span className="text-brand-blue">{count} 家</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${value.activeColor.split(' ')[0]}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-center">
              <div className="text-3xl font-black text-brand-blue">{data.totalCount}</div>
              <div className="mt-1 text-sm font-bold text-gray-400">目前開發總家數</div>
            </div>
          </section>

          {/* 月曆 */}
          <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Icon name="calendar" size={18} className="text-brand-red" /> 開發節奏
            </h2>

            {calendar && (
              <div className="mt-5">
                <div className="grid grid-cols-7 gap-2">
                  {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 pb-1">
                      {d}
                    </div>
                  ))}
                  {calendar.cells.map((cell, idx) => {
                    if (!cell.day) return <div key={`empty-${idx}`} />;
                    const count = cell.count;
                    return (
                      <div
                        key={cell.day}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all ${
                          count > 0 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100/30' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className={`text-[9px] font-bold ${count > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                          {cell.day}
                        </span>
                        {count > 0 && <span className="text-[11px] font-black text-blue-700 leading-none">{count}</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[10px] text-gray-400 font-bold text-center leading-relaxed">
                  格子內數字代表該日產出的「開發筆數」。
                </p>
              </div>
            )}
          </section>

          {/* 轉化名單 */}
          <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Icon name="trending-up" size={18} className="text-orange-500" /> 轉化成功名單
            </h2>
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 border border-orange-100">
              <div className="flex items-center gap-2 text-orange-700 font-black text-sm mb-1">
                <Icon name="target" size={16} /> 指標
              </div>
              <p className="text-[10px] text-orange-600 font-bold">成功由陌生接觸轉化為有溫度的 L4、L5 客戶。</p>
            </div>

            <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {data.convertedClients.length > 0 ? (
                data.convertedClients.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white p-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-black text-gray-900 truncate">{c.company}</div>
                      <div className="text-[10px] font-bold text-gray-400">{c.category}</div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${levels[c.level as keyof typeof levels].activeColor}`}>
                      {c.level}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-gray-50 p-5 text-sm font-bold text-gray-400 text-center">
                  尚無轉化紀錄
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

