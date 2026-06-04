"use client";

import { useState } from 'react';
import { useTransactions, Transaksi } from '@/hooks/useTransactions';
import { Loader2, Trash2, Edit2, Download, X } from 'lucide-react';
// xlsx (~2MB) is intentionally NOT imported at the top.
// It is dynamically loaded only when the user clicks "Export Excel".

export default function SemuaTransaksi() {
  const { data, loading, error, deleteTransaction, updateTransaction } = useTransactions();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Modal State
  const [editingData, setEditingData] = useState<Transaksi | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      setDeletingId(id);
      try {
        await deleteTransaction(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return alert('Tidak ada data untuk diexport');

    // Dynamically import xlsx only when actually needed (saves ~2MB on initial load)
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
      alert(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Semua Transaksi</h1>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{t.tanggal}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{t.deskripsi}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">{t.kategori}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${t.tipe === 'Pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.tipe}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${t.tipe === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setEditingData(t)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === t.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data transaksi
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <button 
              onClick={() => setEditingData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Edit Transaksi</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  value={editingData.tanggal}
                  onChange={(e) => setEditingData({...editingData, tanggal: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <input 
                  type="text" 
                  value={editingData.deskripsi}
                  onChange={(e) => setEditingData({...editingData, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <select 
                    value={editingData.tipe}
                    onChange={(e) => setEditingData({...editingData, tipe: e.target.value as 'Pemasukan' | 'Pengeluaran'})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pemasukan">Pemasukan</option>
                    <option value="Pengeluaran">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select 
                    value={editingData.kategori}
                    onChange={(e) => setEditingData({...editingData, kategori: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Gaji', 'Lainnya'].map(kat => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input 
                  type="number" 
                  value={editingData.jumlah}
                  onChange={(e) => setEditingData({...editingData, jumlah: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingData(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={16} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
