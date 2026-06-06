"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, Menu, X, FileText, PiggyBank } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { translations } from "@/lib/translations";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useSettings();
  const t = translations[language];

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
        <nav className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2 transition-colors">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <LayoutDashboard size={20} />
            {t.dashboard}
          </Link>
          <Link href="/tambah" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <PlusCircle size={20} />
            {t.add_transaction}
          </Link>
          <Link href="/transaksi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <List size={20} />
            {t.all_transactions}
          </Link>
          <Link href="/assistant" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <MessageSquare size={20} />
            {t.ai_assistant}
          </Link>
          <Link href="/budget" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <PiggyBank size={20} />
            {t.budget}
          </Link>
          <Link href="/laporan" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <FileText size={20} />
            {t.financial_report}
          </Link>
          <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <Settings size={20} />
            {t.app_settings}
          </Link>
        </nav>
      )}
    </div>
  );
}
