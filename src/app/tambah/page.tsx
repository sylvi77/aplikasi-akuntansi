"use client";

import { useState } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import TransactionAlertModal, { AlertData } from '@/components/TransactionAlertModal';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';

// This page only needs to POST a new transaction.
// We intentionally do NOT use useTransactions() here because that hook
// fires a GET fetch of all transactions on mount — wasteful for a write-only form.

const KATEGORI = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Gaji', 'Lainnya'];

export default function TambahTransaksi() {
  const { language } = useSettings();
  const t = translations[language];

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<AlertData | null>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: '',
    tipe: 'Pengeluaran',
    jumlah: '',
    kategori: 'Makanan',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.deskripsi || !formData.jumlah) {
        throw new Error('Mohon lengkapi semua field yang diwajibkan');
      }

      const payload = {
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        tipe: formData.tipe,
        jumlah: parseFloat(formData.jumlah),
        kategori: formData.kategori,
      };

      // Direct POST — no hook, no unnecessary GET on mount.
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setSuccess(true);
      setFormData((prev) => ({ ...prev, deskripsi: '', jumlah: '' }));
      setTimeout(() => setSuccess(false), 3000);

      // --- Check for large transaction alert (fire-and-forget style) ---
      checkAlert(payload);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAlert = async (payload: {
    tanggal: string;
    deskripsi: string;
    tipe: string;
    jumlah: number;
    kategori: string;
  }) => {
    try {
      const res = await fetch('/api/alert-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.isAlert) {
        setAlert({
          severity: json.severity,
          message: json.message,
          transactionName: payload.deskripsi,
          amount: payload.jumlah,
        });
      }
    } catch {
      // Alert check failed silently — don't disrupt the UX
    }
  };

  return (
    <>
      <TransactionAlertModal alert={alert} onClose={() => setAlert(null)} />

      <div className="max-w-2xl mx-auto space-y-6 transition-colors">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.add.title}</h1>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-100 dark:border-green-800 flex items-center gap-2">
              <CheckCircle2 size={20} />
              <span>{t.add.success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.common.date}</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.add.type}</label>
                <select
                  name="tipe"
                  value={formData.tipe}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Pemasukan">{t.common.income}</option>
                  <option value="Pengeluaran">{t.common.expense}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi / {t.common.note}</label>
              <input
                type="text"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder={t.add.desc}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.common.amount}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">Rp</span>
                  <input
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                    className="w-full pl-12 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.common.category}</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  {KATEGORI.map((kat) => {
                    const translatedKat = t.common[kat.toLowerCase() as keyof typeof t.common] || kat;
                    return (
                      <option key={kat} value={kat}>{translatedKat}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{loading ? t.add.saving : t.add.save_button}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
