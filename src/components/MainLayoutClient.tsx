"use client";

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { SettingsProvider } from "@/lib/SettingsContext";

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (isAuthPage) {
    return (
      <SettingsProvider>
        <main className="flex-1 h-full overflow-y-auto relative bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <Sidebar />
      <MobileNavbar />
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        {children}
      </main>
    </SettingsProvider>
  );
}
