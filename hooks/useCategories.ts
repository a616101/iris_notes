'use client';

import { useCallback, useEffect, useState } from 'react';

export type Category = { id: number; name: string };

export function useCategories(enabled = true) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || '載入類別失敗');
        setItems([]);
        return;
      }
      setItems((data?.items || []) as Category[]);
    } catch {
      setError('載入類別失敗');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return { items, loading, error, refresh };
}

