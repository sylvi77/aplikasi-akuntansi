import { useState, useEffect, useCallback } from 'react';

export type Transaksi = {
  id: string;
  tanggal: string;
  deskripsi: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  jumlah: number;
  kategori: string;
  createdAt: string;
};

export function useTransactions() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
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
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Mutations use optimistic updates — no full re-fetch needed ───────────

  const addTransaction = async (transactionData: Omit<Transaksi, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    const json = await res.json();
    if (json.success) {
      // Prepend the new row so it appears at the top immediately.
      setData((prev) => [json.data, ...prev]);
      return true;
    }
    throw new Error(json.message);
  };

  const updateTransaction = async (
    id: string,
    transactionData: Partial<Omit<Transaksi, 'id' | 'createdAt'>>
  ) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    const json = await res.json();
    if (json.success) {
      // Patch the matching row in local state — no round-trip needed.
      setData((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...transactionData } : t))
      );
      return true;
    }
    throw new Error(json.message);
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (json.success) {
      // Remove the row from local state immediately.
      setData((prev) => prev.filter((t) => t.id !== id));
      return true;
    }
    throw new Error(json.message);
  };

  return {
    data,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
