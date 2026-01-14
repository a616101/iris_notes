'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Icon from '../Icon';
import QuickDatePicker from '../quick/QuickDatePicker';

interface PendingCustomer {
  id: number;
  company: string;
  nextTime: string;
  category: { id: number; name: string };
  contacts: Array<{ id: number; name: string; title: string | null }>;
}

interface GroupedCustomers {
  overdue: PendingCustomer[];
  today: PendingCustomer[];
  tomorrow: PendingCustomer[];
  thisWeek: PendingCustomer[];
  later: PendingCustomer[];
}

function getDateGroup(nextTime: string): keyof GroupedCustomers {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(nextTime);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 7) return 'thisWeek';
  return 'later';
}

function CustomerItem({ customer, onUpdate }: { customer: PendingCustomer; onUpdate: () => void }) {
  const dateGroup = getDateGroup(customer.nextTime);
  const formattedDate = new Date(customer.nextTime).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            dateGroup === 'overdue'
              ? 'bg-red-500'
              : dateGroup === 'today'
              ? 'bg-brand-yellow'
              : 'bg-brand-blue'
          }`}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/customers/${customer.id}`}
            className="font-bold text-gray-900 hover:text-brand-blue transition-colors truncate block"
          >
            {customer.company}
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded font-bold">
              {customer.category.name}
            </span>
            {customer.contacts[0] && (
              <span className="truncate">{customer.contacts[0].name}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs font-black px-2 py-1 rounded-lg ${
            dateGroup === 'overdue'
              ? 'bg-red-50 text-red-600'
              : dateGroup === 'today'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {formattedDate}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <QuickDatePicker
            customerId={customer.id}
            currentDate={customer.nextTime}
            onSuccess={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, variant }: { title: string; count: number; variant: 'danger' | 'warning' | 'default' }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 mt-2 first:mt-0">
      <span
        className={`text-xs font-black uppercase ${
          variant === 'danger'
            ? 'text-red-500'
            : variant === 'warning'
            ? 'text-yellow-600'
            : 'text-gray-400'
        }`}
      >
        {title}
      </span>
      <span
        className={`text-xs font-black px-1.5 py-0.5 rounded ${
          variant === 'danger'
            ? 'bg-red-100 text-red-600'
            : variant === 'warning'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </div>
  );
}

export default function PendingCustomerList() {
  const [customers, setCustomers] = useState<PendingCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers?onlyPending=true&limit=50');
      if (!res.ok) throw new Error('載入失敗');
      const data = await res.json();
      setCustomers(data.items);
      setError(null);
    } catch (err) {
      setError('無法載入待回覆客戶');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="loader" size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
        {error}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center">
        <Icon name="check-circle" size={32} className="text-green-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-600">目前沒有待回覆的客戶</p>
        <p className="text-xs text-gray-400 mt-1">設定下次聯繫時間後，客戶會顯示在這裡</p>
      </div>
    );
  }

  const grouped: GroupedCustomers = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  customers.forEach((customer) => {
    const group = getDateGroup(customer.nextTime);
    grouped[group].push(customer);
  });

  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader title="已逾期" count={grouped.overdue.length} variant="danger" />
      {grouped.overdue.map((c) => (
        <CustomerItem key={c.id} customer={c} onUpdate={fetchCustomers} />
      ))}

      <SectionHeader title="今天" count={grouped.today.length} variant="warning" />
      {grouped.today.map((c) => (
        <CustomerItem key={c.id} customer={c} onUpdate={fetchCustomers} />
      ))}

      <SectionHeader title="明天" count={grouped.tomorrow.length} variant="default" />
      {grouped.tomorrow.map((c) => (
        <CustomerItem key={c.id} customer={c} onUpdate={fetchCustomers} />
      ))}

      <SectionHeader title="本週內" count={grouped.thisWeek.length} variant="default" />
      {grouped.thisWeek.map((c) => (
        <CustomerItem key={c.id} customer={c} onUpdate={fetchCustomers} />
      ))}

      <SectionHeader title="更晚" count={grouped.later.length} variant="default" />
      {grouped.later.map((c) => (
        <CustomerItem key={c.id} customer={c} onUpdate={fetchCustomers} />
      ))}

      <div className="pt-4 px-4">
        <Link
          href="/customers?onlyPending=true"
          className="text-xs font-black text-brand-blue hover:underline"
        >
          查看全部待回覆客戶 →
        </Link>
      </div>
    </div>
  );
}
