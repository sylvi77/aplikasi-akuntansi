"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, FileText, PiggyBank, LogOut } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
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
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col shadow-sm hidden md:flex transition-colors">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">KeuanganKu</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
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
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* User identity */}
        {userEmail && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-xs">{avatarLetter}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{userEmail}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Akun aktif</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>

      <div className="px-4 pb-4 text-xs text-center text-slate-400 dark:text-slate-600">
        © 2026 KeuanganKu App
      </div>
    </div>
  );
}
