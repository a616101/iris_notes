'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import LevelBadge from './LevelBadge';
import ActionMenu, { ActionMenuItem } from './ui/ActionMenu';
import QuickLevelSelect from './quick/QuickLevelSelect';
import QuickDatePicker from './quick/QuickDatePicker';
import EditCustomerDrawer from './customer/EditCustomerDrawer';
import DeleteCustomerDialog from './customer/DeleteCustomerDialog';
import QuickAddLogModal from './quick/QuickAddLogModal';
import type { CustomerFormData } from '@/lib/validations/customer';

interface Contact {
  id: number;
  name: string;
  title: string | null;
}

interface DevelopmentLog {
  id: number;
  logDate: string;
  method: string;
  notes: string;
}

interface Category {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  company: string;
  category: Category;
  phone: string | null;
  address: string;
  level: CustomerFormData['level'];
  otherSales: string | null;
  nextTime: string | null;
  contacts: Contact[];
  logs: DevelopmentLog[];
  contactCount?: number;
  logCount?: number;
}

interface CustomerCardProps {
  customer: Customer;
  filterDate?: string;
  onUpdate: () => void;
}

export default function CustomerCard({ customer, filterDate, onUpdate }: CustomerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const router = useRouter();

  const sortedLogs = [...customer.logs].sort(
    (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );

  const filteredLogsByDate = filterDate
    ? sortedLogs.filter((l) => l.logDate.split('T')[0] === filterDate)
    : [];

  const latestLog = filteredLogsByDate.length > 0 ? filteredLogsByDate[0] : sortedLogs[0];
  const totalLogs = customer.logCount ?? sortedLogs.length;

  const isHighlighted = filterDate && filteredLogsByDate.length > 0;

  const actionMenuItems: ActionMenuItem[] = [
    {
      label: '查看詳情',
      icon: 'search',
      onClick: () => router.push(`/customers/${customer.id}`),
    },
    {
      label: '編輯完整資料',
      icon: 'edit',
      onClick: () => setIsEditOpen(true),
    },
    {
      label: '新增開發紀錄',
      icon: 'file-up',
      onClick: () => setIsQuickLogOpen(true),
    },
    {
      label: '刪除客戶',
      icon: 'trash-2',
      onClick: () => setIsDeleteOpen(true),
      danger: true,
    },
  ];

  return (
    <>
      <div
        className={`bg-white rounded-[40px] overflow-hidden shadow-sm border-2 transition-all flex flex-col lg:flex-row ${
          isHighlighted ? 'border-brand-blue ring-2 ring-brand-blue/10' : 'border-gray-100'
        }`}
      >
        {/* 左側：客戶資訊 */}
        <div className="p-8 lg:w-1/3 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 relative">
          {/* 操作選單 */}
          <div className="absolute top-4 right-4">
            <ActionMenu items={actionMenuItems} />
          </div>

          <span className="bg-blue-50 text-brand-blue text-[10px] px-2 py-0.5 rounded-full font-bold">
            {customer.category.name}
          </span>
          <h3 className="text-2xl font-black text-gray-900 mt-2 mb-4">
            <Link href={`/customers/${customer.id}`} className="hover:text-brand-blue transition-colors">
              {customer.company}
            </Link>
          </h3>
          
          {/* 快速等級切換 */}
          <div className="mb-4">
            <QuickLevelSelect
              customerId={customer.id}
              currentLevel={customer.level}
              onSuccess={onUpdate}
            />
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Icon name="map-pin" size={16} className="text-brand-red shrink-0 mt-0.5" />
              <span className="font-bold">{customer.address}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Icon name="phone" size={16} className="text-gray-400" />
                <a href={`tel:${customer.phone}`} className="hover:text-brand-blue transition-colors">
                  {customer.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-brand-blue font-bold">
              <Icon name="user" size={16} />
              <div>
                {customer.contacts.map((c) => (
                  <div key={c.id}>
                    {c.name} {c.title && `(${c.title})`}
                  </div>
                ))}
                {customer.contactCount && customer.contactCount > customer.contacts.length && (
                  <div className="text-xs font-bold text-gray-400">
                    還有 {customer.contactCount - customer.contacts.length} 位聯絡人…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下次聯繫時間 */}
          <div
            className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${
              customer.nextTime ? 'bg-brand-cream border-brand-yellow-light' : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Icon name="clock" size={16} />
              <span className="text-xs font-black">下次聯繫</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-brand-red">
                {customer.nextTime ? new Date(customer.nextTime).toLocaleDateString('zh-TW') : '未安排'}
              </span>
              <QuickDatePicker
                customerId={customer.id}
                currentDate={customer.nextTime}
                onSuccess={onUpdate}
              />
            </div>
          </div>

          {/* 操作按鈕列 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              <Icon name="file-up" size={16} />
              快速記錄
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center justify-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center justify-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
            >
              <Icon name="trash-2" size={16} />
            </button>
          </div>
        </div>

        {/* 右側：開發歷程 */}
        <div className="p-8 flex-1 bg-gray-50/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black text-gray-700 flex items-center gap-2">
              <Icon name="history" className="text-brand-blue" size={20} /> 開發歷程
            </h4>
            <Link
              href={`/customers/${customer.id}`}
              className="text-xs font-black text-brand-blue hover:underline"
            >
              查看全部
            </Link>
          </div>
          <div className="border-l-2 border-gray-200 ml-2">
            {latestLog ? (
              <div className="relative pl-6">
                <div
                  className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    isHighlighted ? 'bg-brand-blue' : 'bg-brand-yellow'
                  }`}
                ></div>
                <div className="p-4 rounded-2xl bg-white shadow-md border border-brand-yellow-light">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-brand-blue">
                      {new Date(latestLog.logDate).toLocaleDateString('zh-TW')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      {latestLog.method}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{latestLog.notes}</p>
                </div>
              </div>
            ) : (
              <div className="pl-6 text-sm text-gray-400 italic">無紀錄</div>
            )}

            {totalLogs > 1 && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-6 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-brand-blue py-2"
                  type="button"
                >
                  <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
                  {isExpanded ? '收合' : `還有 ${Math.max(totalLogs - 1, 0)} 筆歷史紀錄`}
                </button>
                {isExpanded && (
                  <div className="space-y-3 mt-2">
                    {sortedLogs.slice(1, 5).map((log) => (
                      <div key={log.id} className="relative pl-6">
                        <div className="absolute left-[-9px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                        <div className="p-3 rounded-xl bg-white border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500">
                              {new Date(log.logDate).toLocaleDateString('zh-TW')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-gray-100 text-gray-500">
                              {log.method}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{log.notes}</p>
                        </div>
                      </div>
                    ))}
                    {totalLogs > 5 && (
                      <Link
                        href={`/customers/${customer.id}`}
                        className="ml-6 block text-xs font-bold text-brand-blue hover:underline"
                      >
                        查看全部 {totalLogs} 筆紀錄 →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals and Drawers */}
      <EditCustomerDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        customer={customer}
        onSuccess={onUpdate}
      />

      <DeleteCustomerDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        customer={customer}
        onSuccess={onUpdate}
      />

      <QuickAddLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        customer={{ id: customer.id, company: customer.company, nextTime: customer.nextTime }}
        onSuccess={onUpdate}
      />
    </>
  );
}
