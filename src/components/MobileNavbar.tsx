"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, Menu, X, FileText, PiggyBank, LogOut } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { translations } from "@/lib/translations";
import { createClient } from '@/lib/supabase-client';

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">KeuanganKu</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <nav className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2 transition-colors max-h-[80vh] overflow-y-auto">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <LayoutDashboard size={20} />
            {t.sidebar.dashboard}
          </Link>
          <Link href="/tambah" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <PlusCircle size={20} />
            {t.sidebar.add_transaction}
          </Link>
          <Link href="/transaksi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <List size={20} />
            {t.sidebar.all_transactions}
          </Link>
          <Link href="/assistant" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <MessageSquare size={20} />
            {t.sidebar.ai_assistant}
          </Link>
          <Link href="/budget" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <PiggyBank size={20} />
            {t.sidebar.budget}
          </Link>
          <Link href="/laporan" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <FileText size={20} />
            {t.sidebar.financial_report}
          </Link>
          <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <Settings size={20} />
            {t.sidebar.app_settings}
          </Link>
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
