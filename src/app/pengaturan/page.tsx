"use client";

import { useState, useEffect } from 'react';
import { useBudgets, Budget } from '@/hooks/useBudgets';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function Pengaturan() {
  const { data, loading, error, saveBudgets } = useBudgets();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const KATEGORI = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Gaji', 'Lainnya'];
  
  const [budgets, setBudgets] = useState<Record<string, string>>(
    KATEGORI.reduce((acc, kat) => ({ ...acc, [kat]: '' }), {})
  );

  useEffect(() => {
    if (data && data.length > 0) {
      const newBudgets: Record<string, string> = { ...budgets };
      data.forEach(b => {
        newBudgets[b.kategori] = b.jumlah > 0 ? b.jumlah.toString() : '';
      });
      setBudgets(newBudgets);
    }
  }, [data]);

  const handleChange = (kategori: string, value: string) => {
    setBudgets(prev => ({ ...prev, [kategori]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSuccess(false);

    try {
      const budgetData: Budget[] = Object.keys(budgets).map(kategori => ({
        kategori,
        jumlah: budgets[kategori] ? parseFloat(budgets[kategori]) : 0
      }));

      await saveBudgets(budgetData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Pengaturan Budget</h1>
      <p className="text-slate-600">Tetapkan batas pengeluaran (budget) bulanan untuk setiap kategori.</p>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        {saveError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {saveError}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-100 flex items-center gap-2">
            <CheckCircle2 size={20} />
            <span>Budget berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {KATEGORI.map(kat => (
            <div key={kat} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{kat}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">Rp</span>
                <input 
                  type="number" 
                  value={budgets[kat]}
                  onChange={(e) => handleChange(kat, e.target.value)}
                  placeholder="0 (kosongkan jika tidak ada budget)"
                  min="0"
                  step="1000"
                  className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>Simpan Budget</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
