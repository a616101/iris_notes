'use client';

import { signOut } from 'next-auth/react';
import Icon from '@/components/Icon';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-black text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
      title="登出"
      type="button"
    >
      <Icon name="log-out" size={18} />
      登出
    </button>
  );
}

