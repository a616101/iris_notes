import NavLink, { NavItem } from '@/components/shell/NavLink';
import SignOutButton from '@/components/shell/SignOutButton';

const navItems: NavItem[] = [
  { href: '/dashboard', label: '總覽', icon: 'bar-chart-3' },
  { href: '/customers', label: '客戶', icon: 'search' },
  { href: '/analytics', label: '分析', icon: 'trending-up' },
  { href: '/import', label: '匯入', icon: 'file-up' },
  { href: '/settings/categories', label: '類別', icon: 'tag' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-[28px] border-2 border-brand-yellow-light bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-yellow-light" />
                <div>
                  <div className="text-sm font-black text-brand-blue">小新開發筆記本</div>
                  <div className="text-[11px] font-bold text-gray-400">App Shell</div>
                </div>
              </div>
              <div className="md:hidden">
                <SignOutButton />
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>

            <div className="mt-6 hidden md:block">
              <SignOutButton />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            {children}
            <footer className="mt-10 pb-6 text-center text-sm font-medium text-gray-400">
              © 2024 小新開發筆記本
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

