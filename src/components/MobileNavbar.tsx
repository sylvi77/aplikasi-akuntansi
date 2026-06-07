"use client";

import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, FileText, PiggyBank, LogOut, X, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { translations } from "@/lib/translations";
import { createClient } from '@/lib/supabase-client';

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/tambah', icon: PlusCircle, label: t.sidebar.add_transaction },
    { href: '/transaksi', icon: List, label: t.sidebar.all_transactions },
    { href: '/assistant', icon: MessageSquare, label: t.sidebar.ai_assistant },
    { href: '/budget', icon: PiggyBank, label: t.sidebar.budget },
    { href: '/laporan', icon: FileText, label: t.sidebar.financial_report },
    { href: '/settings', icon: Settings, label: t.sidebar.app_settings },
  ];

  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Wallet size={14} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-500">KeuanganKu</h1>
        </div>

        {/* Avatar + Menu toggle */}
        <div className="flex items-center gap-2">
          {userEmail && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">{avatarLetter}</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isOpen
              ? <X size={22} />
              : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              )
            }
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="px-4 pb-4 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 max-h-[80vh] overflow-y-auto">
          {/* User identity */}
          {userEmail && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">{avatarLetter}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{userEmail}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Akun aktif</p>
              </div>
            </div>
          )}

          {navLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                {label}
              </Link>
            );
          })}

          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
