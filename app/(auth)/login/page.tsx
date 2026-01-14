'use client';

import { signIn } from 'next-auth/react';
import { useState, FormEvent } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('帳號或密碼錯誤');
        setIsLoading(false);
      } else if (result?.ok) {
        window.location.href = '/dashboard';
      } else {
        setError('登入失敗，請稍後再試');
        setIsLoading(false);
      }
    } catch {
      setError('登入時發生錯誤，請稍後再試');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-brand-yellow p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center border-4 border-brand-yellow shadow-lg">
              <div className="w-16 h-16 bg-brand-yellow-light rounded-full flex items-center justify-center">
                <span className="text-3xl">👦</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-brand-blue text-center mb-2">小新開發筆記本</h1>
          <p className="text-brand-red font-bold text-center mb-8">動感登入系統！</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">帳號</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-yellow outline-none transition-all text-sm font-medium"
                placeholder="請輸入帳號"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-yellow outline-none transition-all text-sm font-medium"
                placeholder="請輸入密碼"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-sm font-bold text-red-600 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-yellow hover:bg-yellow-500 text-white px-6 py-3 rounded-full font-black shadow-md transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? '登入中...' : '動感登入！'}
            </button>
          </form>

        </div>

        <p className="text-center text-gray-400 text-sm mt-6 font-medium">© 2024 小新開發筆記本</p>
      </div>
    </div>
  );
}

