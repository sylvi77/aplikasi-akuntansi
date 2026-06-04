"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, List, MessageSquare, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">KeuanganKu</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <nav className="bg-white border-b border-slate-200 p-4 space-y-2 shadow-md absolute w-full z-50">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/tambah" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            <PlusCircle size={20} />
            Tambah Transaksi
          </Link>
          <Link href="/transaksi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            <List size={20} />
            Semua Transaksi
          </Link>
          <Link href="/assistant" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            <MessageSquare size={20} />
            AI Assistant
          </Link>
          <Link href="/pengaturan" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            <Settings size={20} />
            Pengaturan
          </Link>
        </nav>
      )}
    </div>
  );
}
