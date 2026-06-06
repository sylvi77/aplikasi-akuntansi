import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { SettingsProvider } from "@/lib/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aplikasi Akuntansi Sederhana",
  description: "Catat uang masuk dan keluar dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} antialiased flex flex-col md:flex-row h-screen overflow-hidden transition-colors duration-300`}>
        <SettingsProvider>
          <Sidebar />
          <MobileNavbar />
          <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  );
}
