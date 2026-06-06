"use client";

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import DashboardCharts from '@/components/DashboardCharts';
import { ArrowUpRight, ArrowDownRight, Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';

export default function Dashboard() {
  const { data: transactions, loading, error } = useTransactions();
  const { data: budgets, loading: budgetsLoading } = useBudgets();
  const { language } = useSettings();
  const t = translations[language];

  const [analyzing, setAnalyzing] = useState(false);
  const [saran, setSaran] = useState<string[]>([]);

  const [predicting, setPredicting] = useState(false);
  const [prediksi, setPrediksi] = useState<string>('');

  // ── Memoised derivations — only recompute when transactions/budgets change ──
  // Hook definitions MUST be above any early returns to avoid React hook order violations!
  const safeTransactions = transactions || [];
  
  const totalPemasukan = useMemo(
    () => safeTransactions.filter((t: any) => t.tipe === 'Pemasukan').reduce((sum: number, t: any) => sum + t.jumlah, 0),
    [safeTransactions]
  );
  
  const totalPengeluaran = useMemo(
    () => safeTransactions.filter((t: any) => t.tipe === 'Pengeluaran').reduce((sum: number, t: any) => sum + t.jumlah, 0),
    [safeTransactions]
  );
  
  const saldoAkhir = useMemo(() => totalPemasukan - totalPengeluaran, [totalPemasukan, totalPengeluaran]);

  const categoryExpenses = useMemo<Record<string, number>>(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const result: Record<string, number> = {};
    safeTransactions.forEach((t: any) => {
      const d = new Date(t.tanggal);
      if (t.tipe === 'Pengeluaran' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        result[t.kategori] = (result[t.kategori] || 0) + t.jumlah;
      }
    });
    return result;
  }, [safeTransactions]);

  if (loading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p className="font-bold">Gagal memuat data:</p>
        <p>{error}</p>
        <p className="text-sm mt-2">Pastikan kredensial Google Sheets sudah diisi di .env.local</p>
      </div>
    );
  }

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTransactions = transactions.filter(t => new Date(t.tanggal) >= thirtyDaysAgo);

      const res = await fetch('/api/analyze-savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: recentTransactions }),
      });
      const json = await res.json();
      if (json.success) setSaran(json.saran);
      else alert(json.message);
    } catch {
      alert('Gagal menghubungi AI');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const recentTransactions = transactions.filter(t => new Date(t.tanggal) >= ninetyDaysAgo);

      const res = await fetch('/api/predict-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: recentTransactions, saldoSekarang: saldoAkhir }),
      });
      const json = await res.json();
      if (json.success) setPrediksi(json.prediksi);
      else alert(json.message);
    } catch {
      alert('Gagal menghubungi AI');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-colors">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.sidebar.dashboard}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.dashboard.total_income}</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{formatRupiah(totalPemasukan)}</h3>
          </div>
          <div className="h-12 w-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 dark:text-green-400">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.dashboard.total_expense}</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{formatRupiah(totalPengeluaran)}</h3>
          </div>
          <div className="h-12 w-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 dark:text-red-400">
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.dashboard.remaining_balance}</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(saldoAkhir)}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors" onClick={handlePredict} title={t.dashboard.prediction}>
              {predicting ? <Loader2 className="animate-spin" size={24} /> : <TrendingUp size={24} />}
            </div>
          </div>

          {prediksi && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl z-10">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p>{prediksi}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fitur Analisis & Saran Penghematan */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={20} /> {t.dashboard.ai_analysis}
            </h3>
            <p className="text-blue-100 text-sm mt-1">Dapatkan saran spesifik berdasarkan pengeluaran Anda 30 hari terakhir.</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 font-medium px-5 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-80"
          >
            {analyzing ? <Loader2 className="animate-spin" size={18} /> : <BotIcon />}
            {analyzing ? t.dashboard.loading_ai : t.dashboard.ai_analysis}
          </button>
        </div>

        {saran.length > 0 && (
          <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <ul className="space-y-3">
              {saran.map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="bg-blue-500/30 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i + 1}</div>
                  <p className="text-sm leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.dashboard.summary}</h3>
          <DashboardCharts data={transactions} />
        </div>

        {/* Budget Progress & Recent Transactions Column */}
        <div className="space-y-6">

          {/* Budget Progress */}
          {budgets && budgets.length > 0 && budgets.some(b => b.jumlah > 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                {t.budget.title}
              </h3>
              <div className="space-y-5">
                {budgets.filter(b => b.jumlah > 0).map(b => {
                  const spent = categoryExpenses[b.kategori] || 0;
                  const percentage = Math.min(100, Math.round((spent / b.jumlah) * 100));
                  const isExceeded = spent > b.jumlah;
                  const isWarning = percentage >= 80 && !isExceeded;

                  return (
                    <div key={b.kategori}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{b.kategori}</span>
                        <span className={`font-semibold ${isExceeded ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-slate-500'}`}>
                          {formatRupiah(spent)} / {formatRupiah(b.jumlah)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {isExceeded ? (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Melebihi budget!</p>
                      ) : isWarning ? (
                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Mendekati batas budget.</p>
                      ) : (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Budget aman.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t.dashboard.recent_transactions}</h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((txn, index) => (
                <div key={txn.id || index} className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${txn.tipe === 'Pemasukan' ? 'bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                      {txn.tipe === 'Pemasukan' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{txn.deskripsi}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{txn.tanggal} • {txn.kategori}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${txn.tipe === 'Pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {txn.tipe === 'Pemasukan' ? '+' : '-'}{formatRupiah(txn.jumlah)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">{t.dashboard.no_transactions}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Bot Icon for the button
function BotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  );
}
