import Link from 'next/link';
import Icon from '@/components/Icon';
import PendingCustomerList from '@/components/dashboard/PendingCustomerList';

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-blue">總覽</h1>
            <p className="mt-1 text-sm font-bold text-gray-400">把最常用的動作集中在這裡。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-yellow px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-yellow-500"
            >
              <Icon name="search" size={18} /> 前往客戶列表
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
            >
              <Icon name="trending-up" size={18} /> 查看分析
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Icon name="clock" size={20} className="text-brand-yellow" />
              待回覆（預計）
            </h2>
          </div>
          <PendingCustomerList />
        </div>

        <div className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900">快捷入口</h2>
          <div className="mt-4 space-y-2">
            <Link
              href="/import"
              className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-brand-blue hover:bg-blue-100"
            >
              Excel 匯入 <Icon name="file-up" size={18} />
            </Link>
            <Link
              href="/settings/categories"
              className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-black text-yellow-700 hover:bg-yellow-100"
            >
              類別管理 <Icon name="tag" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

