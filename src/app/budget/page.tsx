"use client";

import { useState, useEffect } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';

export default function Pengaturan() {
  const { data, loading, error, saveBudgets } = useBudgets();
  const { language } = useSettings();
  const t = translations[language];
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [budget, setBudget] = useState<string>('');

  useEffect(() => {
    if (data && data.jumlah > 0) {
      setBudget(data.jumlah.toString());
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSuccess(false);

    try {
      await saveBudgets({
        jumlah: budget ? parseFloat(budget) : 0
      });
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
    <div className="max-w-2xl transition-colors">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.budget.title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {t.budget.desc}
      </p>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}
        
        {saveError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800">
            {saveError}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-100 dark:border-green-800 flex items-center gap-2">
            <CheckCircle2 size={20} />
            <span>{t.budget.success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Anggaran Bulanan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 dark:text-slate-400">Rp</span>
              <input 
                type="number" 
                value={budget}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                className="w-full pl-12 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{isSaving ? '...' : t.budget.save_button}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
