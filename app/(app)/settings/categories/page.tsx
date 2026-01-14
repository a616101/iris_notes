import CategoriesManager from '@/components/settings/CategoriesManager';
import Icon from '@/components/Icon';

export default function CategoriesSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
            <Icon name="tag" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-blue">類別管理</h1>
            <p className="mt-1 text-sm font-bold text-gray-400">
              類別會影響搜尋篩選與新增/編輯客戶的下拉選單。
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-[28px] border-2 border-gray-100 bg-white p-6 shadow-sm">
        <CategoriesManager />
      </div>
    </div>
  );
}

