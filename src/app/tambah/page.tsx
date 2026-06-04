"use client";

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function TambahTransaksi() {
  const { addTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: '',
    tipe: 'Pengeluaran',
    jumlah: '',
    kategori: 'Makanan'
  });

  const KATEGORI = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Gaji', 'Lainnya'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      await addTransaction({
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        tipe: formData.tipe as 'Pemasukan' | 'Pengeluaran',
        jumlah: parseFloat(formData.jumlah),
        kategori: formData.kategori
      });

      setSuccess(true);
      setFormData(prev => ({ ...prev, deskripsi: '', jumlah: '' })); // Reset some fields
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Tambah Transaksi</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-100 flex items-center gap-2">
            <CheckCircle2 size={20} />
            <span>Transaksi berhasil ditambahkan!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Tanggal</label>
              <input 
                type="date" 
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Tipe Transaksi</label>
              <select 
                name="tipe"
                value={formData.tipe}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <input 
              type="text" 
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Contoh: Beli makan siang"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
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
                  className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <select 
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {KATEGORI.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
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
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
