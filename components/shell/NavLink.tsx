'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/Icon';

export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export default function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
        isActive
          ? 'bg-brand-blue text-white'
          : 'text-gray-600 hover:bg-brand-yellow-light/60 hover:text-brand-blue'
      }`}
    >
      <Icon name={icon} size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
      <span>{label}</span>
    </Link>
  );
}

