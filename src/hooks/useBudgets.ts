import { useState, useEffect, useCallback } from 'react';

export type Budget = {
  user_id?: string;
  jumlah: number;
  updatedAt?: string;
};

export function useBudgets() {
  const [data, setData] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/budgets');
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const saveBudgets = async (budget: { jumlah: number }) => {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    const json = await res.json();
    if (json.success) {
      await fetchBudgets(); // refresh data
      return true;
    }
    throw new Error(json.message);
  };

  return {
    data,
    loading,
    error,
    refetch: fetchBudgets,
    saveBudgets
  };
}
