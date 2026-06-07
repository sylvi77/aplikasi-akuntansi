"use client";

import { useState, useMemo } from 'react';
import { useTransactions, Transaksi } from '@/hooks/useTransactions';
import { Loader2, Trash2, Edit2, Download, X, Search, Filter } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';
// xlsx (~2MB) is intentionally NOT imported at the top.
// It is dynamically loaded only when the user clicks "Export Excel".

export default function SemuaTransaksi() {
  const { data, loading, error, deleteTransaction, updateTransaction } = useTransactions();
  const { language } = useSettings();
  const tr = translations[language];
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  // Modal State
  const [editingData, setEditingData] = useState<Transaksi | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const KATEGORI = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Gaji', 'Lainnya'];

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  // Filtered + searched data
  const filteredData = useMemo(() => {
    return data.filter(t => {
      const matchesSearch =
        !search ||
        t.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        t.kategori.toLowerCase().includes(search.toLowerCase()) ||
        t.tanggal.includes(search);
      const matchesTipe = !filterTipe || t.tipe === filterTipe;
      const matchesKategori = !filterKategori || t.kategori === filterKategori;
      return matchesSearch && matchesTipe && matchesKategori;
    });
  }, [data, search, filterTipe, filterKategori]);

  const handleDelete = async (id: string) => {
    if (confirm(tr.transactions.delete_confirm)) {
      setDeletingId(id);
      try {
        await deleteTransaction(id);
      } catch (err: any) {
        alert(err.message || 'Error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return alert('Tidak ada data untuk diexport');

    const XLSX = await import('xlsx');

    const exportData = data.map(t => ({
      'ID': t.id,
      'Tanggal': t.tanggal,
      'Deskripsi': t.deskripsi,
      'Kategori': t.kategori,
      'Tipe': t.tipe,
      'Jumlah': t.jumlah,
      'Dibuat Pada': t.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');
    XLSX.writeFile(workbook, 'Laporan_KeuanganKu.xlsx');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingData) return;
    setIsSaving(true);
    try {
      await updateTransaction(editingData.id, {
        tanggal: editingData.tanggal,
        deskripsi: editingData.deskripsi,
        tipe: editingData.tipe,
        jumlah: Number(editingData.jumlah),
        kategori: editingData.kategori
      });
      setEditingData(null);
    } catch (err: any) {
      alert(err.message || 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasActiveFilters = search || filterTipe || filterKategori;

  const clearFilters = () => {
    setSearch('');
    setFilterTipe('');
    setFilterKategori('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{tr.transactions.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{tr.transactions.desc}</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tr.transactions.search}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {/* Filter by Tipe */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterTipe}
                onChange={e => setFilterTipe(e.target.value)}
                className="pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">{tr.transactions.filter_type}</option>
                <option value="Pemasukan">{tr.common.income}</option>
                <option value="Pengeluaran">{tr.common.expense}</option>
              </select>
            </div>

            {/* Filter by Kategori */}
            <div className="relative">
              <select
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">{tr.transactions.filter_category}</option>
                {KATEGORI.map(kat => (
                  <option key={kat} value={kat}>
                    {tr.common[kat.toLowerCase() as keyof typeof tr.common] || kat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                title="Reset filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Menampilkan{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredData.length}</span>
            {' '}dari{' '}
            <span className="font-semibold">{data.length}</span>
            {' '}transaksi
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">{tr.common.date}</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">{tr.common.category}</th>
                <th className="px-6 py-4">{tr.common.income}/{tr.common.expense}</th>
                <th className="px-6 py-4">{tr.common.amount}</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredData.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{t.tanggal}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{t.deskripsi}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-xs">
                      {tr.common[t.kategori.toLowerCase() as keyof typeof tr.common] || t.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${t.tipe === 'Pemasukan' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {t.tipe === 'Pemasukan' ? tr.common.income : tr.common.expense}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${t.tipe === 'Pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setEditingData(t)}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title={tr.transactions.delete}
                      >
                        {deletingId === t.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    {tr.transactions.no_match}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingData && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl relative transition-colors">
            <button 
              onClick={() => setEditingData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Edit Transaksi</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tr.common.date}</label>
                <input 
                  type="date" 
                  value={editingData.tanggal}
                  onChange={(e) => setEditingData({...editingData, tanggal: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                <input 
                  type="text" 
                  value={editingData.deskripsi}
                  onChange={(e) => setEditingData({...editingData, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tr.add.type}</label>
                  <select 
                    value={editingData.tipe}
                    onChange={(e) => setEditingData({...editingData, tipe: e.target.value as 'Pemasukan' | 'Pengeluaran'})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pemasukan">{tr.common.income}</option>
                    <option value="Pengeluaran">{tr.common.expense}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tr.common.category}</label>
                  <select 
                    value={editingData.kategori}
                    onChange={(e) => setEditingData({...editingData, kategori: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {KATEGORI.map(kat => (
                      <option key={kat} value={kat}>{tr.common[kat.toLowerCase() as keyof typeof tr.common] || kat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{tr.common.amount}</label>
                <input 
                  type="number" 
                  value={editingData.jumlah}
                  onChange={(e) => setEditingData({...editingData, jumlah: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingData(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  {tr.common.cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={16} />}
                  {tr.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
