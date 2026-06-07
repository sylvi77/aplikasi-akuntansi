"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, FileText, PiggyBank, LogOut } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';
import { createClient } from '@/lib/supabase-client';

export default function Sidebar() {
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col shadow-sm hidden md:flex transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">KeuanganKu</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <LayoutDashboard size={20} />
          {t.sidebar.dashboard}
        </Link>
        <Link href="/tambah" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <PlusCircle size={20} />
          {t.sidebar.add_transaction}
        </Link>
        <Link href="/transaksi" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <List size={20} />
          {t.sidebar.all_transactions}
        </Link>
        <Link href="/assistant" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <MessageSquare size={20} />
          {t.sidebar.ai_assistant}
        </Link>
        <Link href="/budget" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <PiggyBank size={20} />
          {t.sidebar.budget}
        </Link>
        <Link href="/laporan" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <FileText size={20} />
          {t.sidebar.financial_report}
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <Settings size={20} />
          {t.sidebar.app_settings}
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
          <LogOut size={20} />
          Keluar
        </button>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-center text-slate-400 dark:text-slate-500 transition-colors">
        &copy; 2026 KeuanganKu App
      </div>
    </div>
  );
}
