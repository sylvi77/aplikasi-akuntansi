import Link from 'next/link';
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shadow-sm hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-blue-600">KeuanganKu</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link href="/tambah" className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
          <PlusCircle size={20} />
          Tambah Transaksi
        </Link>
        <Link href="/transaksi" className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
          <List size={20} />
          Semua Transaksi
        </Link>
        <Link href="/assistant" className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
          <MessageSquare size={20} />
          AI Assistant
        </Link>
        <Link href="/pengaturan" className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
          <Settings size={20} />
          Pengaturan
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-100 text-xs text-center text-slate-400">
        &copy; 2026 KeuanganKu App
      </div>
    </div>
  );
}
