import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row h-screen overflow-hidden`}>
        <Sidebar />
        <MobileNavbar />
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
