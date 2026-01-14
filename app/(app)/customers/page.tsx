'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import SearchFilter from '@/components/SearchFilter';
import CustomerCard from '@/components/CustomerCard';
import AddCustomerModal from '@/components/customer/AddCustomerModal';
import BatchToolbar from '@/components/batch/BatchToolbar';
import BatchCustomerCard from '@/components/batch/BatchCustomerCard';
import { useBatchMode } from '@/hooks/useBatchMode';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { CustomerFormData } from '@/lib/validations/customer';

interface Customer {
  id: number;
  company: string;
  category: { id: number; name: string };
  phone: string | null;
  address: string;
  level: CustomerFormData['level'];
  otherSales: string | null;
  nextTime: string | null;
  contacts: Array<{ id: number; name: string; title: string | null }>;
  logs: Array<{ id: number; logDate: string; method: string; notes: string }>;
  contactCount: number;
  logCount: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [filterLevel, setFilterLevel] = useState('全部');
  const [filterDate, setFilterDate] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const router = useRouter();

  const {
    isBatchMode,
    selectedIds,
    selectedCount,
    enterBatchMode,
    exitBatchMode,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
  } = useBatchMode();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== '全部') params.append('category', filterCategory);
      if (filterLevel !== '全部') params.append('level', filterLevel);
      if (filterDate) params.append('date', filterDate);
      if (onlyPending) params.append('onlyPending', 'true');

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.items || []);
        setNextCursor(data.nextCursor ?? null);
      }
    } catch (error) {
      console.error('載入客戶列表失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterLevel, filterDate, onlyPending]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== '全部') params.append('category', filterCategory);
      if (filterLevel !== '全部') params.append('level', filterLevel);
      if (filterDate) params.append('date', filterDate);
      if (onlyPending) params.append('onlyPending', 'true');
      params.append('cursor', String(nextCursor));

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newItems = (data.items || []) as Customer[];
        setCustomers((prev) => [...prev, ...newItems]);
        setNextCursor(data.nextCursor ?? null);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [filterCategory, filterDate, filterLevel, loadingMore, nextCursor, onlyPending, searchTerm]);

  // 使用 debounce 優化搜尋
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(timer);
  }, [fetchCustomers, searchTerm]);

  // 鍵盤快捷鍵
  useKeyboardShortcuts(
    [
      {
        key: 'n',
        ctrl: true,
        handler: () => !isBatchMode && setIsAddCustomerOpen(true),
        description: '新增客戶',
      },
      {
        key: 'b',
        ctrl: true,
        handler: () => (isBatchMode ? exitBatchMode() : enterBatchMode()),
        description: '切換批量操作模式',
      },
      {
        key: 'a',
        ctrl: true,
        shift: true,
        handler: () => router.push('/analytics'),
        description: '前往分析頁',
      },
      {
        key: 'Escape',
        handler: () => {
          if (isBatchMode) exitBatchMode();
        },
        description: '退出批量模式',
      },
    ],
    true
  );

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-blue">客戶</h1>
            <p className="mt-1 text-sm font-bold text-gray-400">
              搜尋、篩選、批量操作與匯入都集中在這裡。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
            >
              <Icon name="bar-chart-3" size={18} /> 開發分析
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
            >
              <Icon name="file-up" size={18} /> 匯入 Excel
            </Link>
            {!isBatchMode && (
              <>
                <button
                  onClick={enterBatchMode}
                  className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                  type="button"
                >
                  <Icon name="check-circle" size={18} /> 批量操作
                </button>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="flex items-center gap-2 rounded-2xl bg-brand-yellow px-6 py-3 text-sm font-black text-white shadow-sm hover:bg-yellow-500"
                  type="button"
                >
                  <Icon name="plus" size={18} /> 新增公司
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 批量操作工具列 */}
      {isBatchMode && (
        <BatchToolbar
          selectedCount={selectedCount}
          totalCount={customers.length}
          selectedIds={selectedIds}
          onSelectAll={() => selectAll(customers.map((c) => c.id))}
          onClearSelection={clearSelection}
          onExit={exitBatchMode}
          onSuccess={fetchCustomers}
        />
      )}

      {/* 搜尋篩選區 */}
      {!isBatchMode && (
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          onlyPending={onlyPending}
          setOnlyPending={setOnlyPending}
        />
      )}

      {/* 客戶列表 */}
      <main className="flex flex-col gap-6">
        {loading ? (
          <LoadingSkeleton />
        ) : customers.length > 0 ? (
          isBatchMode ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer) => (
                <BatchCustomerCard
                  key={customer.id}
                  customer={customer}
                  isSelected={isSelected(customer.id)}
                  onToggle={() => toggleSelect(customer.id)}
                />
              ))}
            </div>
          ) : (
            customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                filterDate={filterDate}
                onUpdate={fetchCustomers}
              />
            ))
          )
        ) : (
          <EmptyState
            icon="search"
            title="哎呀～找不到符合條件的公司！"
            description={
              searchTerm || filterCategory !== '全部' || filterLevel !== '全部' || filterDate || onlyPending
                ? '試著調整篩選條件，或新增第一個客戶吧！'
                : undefined
            }
            action={
              !searchTerm && filterCategory === '全部' && filterLevel === '全部' && !filterDate && !onlyPending
                ? { label: '新增第一個客戶', onClick: () => setIsAddCustomerOpen(true) }
                : undefined
            }
          />
        )}

        {!loading && !isBatchMode && customers.length > 0 && (
          <div className="flex justify-center pt-2">
            {nextCursor ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? '載入中...' : '載入更多'}
              </button>
            ) : (
              <div className="text-xs font-bold text-gray-400">已載入全部</div>
            )}
          </div>
        )}
      </main>

      {/* 新增客戶彈窗 */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={fetchCustomers}
      />

    </div>
  );
}

