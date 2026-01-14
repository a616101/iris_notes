'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Icon from '@/components/Icon';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ContactManager from '@/components/contact/ContactManager';
import LogManager from '@/components/log/LogManager';
import EditCustomerDrawer from '@/components/customer/EditCustomerDrawer';
import QuickAddLogModal from '@/components/quick/QuickAddLogModal';
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
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        setCustomer(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  if (loading) return <LoadingSkeleton />;

  if (!customer) {
    return (
      <div className="rounded-[28px] border-2 border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Icon name="alert-circle" size={28} />
        </div>
        <h1 className="text-xl font-black text-gray-900">找不到客戶</h1>
        <p className="mt-2 text-sm font-medium text-gray-500">可能已被刪除或你沒有權限存取。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-black text-gray-400">客戶詳情</div>
            <h1 className="mt-1 text-2xl font-black text-brand-blue">{customer.company}</h1>
            <p className="mt-1 text-sm font-bold text-gray-400">{customer.category?.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
          >
            <Icon name="edit" size={18} /> 編輯資料
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900">聯絡人</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">管理該客戶的聯絡窗口。</p>
          <div className="mt-5">
            <ContactManager customerId={customer.id} contacts={customer.contacts} onUpdate={fetchCustomer} />
          </div>
        </section>

        <section className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">開發紀錄</h2>
              <p className="mt-1 text-sm font-medium text-gray-500">管理與客戶的聯繫紀錄。</p>
            </div>
            <button
              onClick={() => setIsAddLogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              <Icon name="plus" size={16} />
              新增紀錄
            </button>
          </div>
          <div className="mt-5">
            <LogManager customerId={customer.id} logs={customer.logs} onUpdate={fetchCustomer} />
          </div>
        </section>
      </div>

      <EditCustomerDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        customer={customer}
        onSuccess={fetchCustomer}
      />

      <QuickAddLogModal
        isOpen={isAddLogOpen}
        onClose={() => setIsAddLogOpen(false)}
        customer={{ id: customer.id, company: customer.company, nextTime: customer.nextTime }}
        onSuccess={fetchCustomer}
      />
    </div>
  );
}

