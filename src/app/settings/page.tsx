"use client";

import { useSettings } from "@/lib/SettingsContext";
import { Moon, Sun, Monitor, Image as ImageIcon, Languages, Palette } from "lucide-react";
import { useState } from "react";

const LANGUAGES = [
  { code: "id", name: "Indonesian (Bahasa Indonesia)" },
  { code: "en", name: "English" },
  { code: "zh", name: "Mandarin (Simplified Chinese)" },
  { code: "pt", name: "Portuguese" },
  { code: "es", name: "Spanish" },
  { code: "ar", name: "Arab" },
] as const;

export default function AppSettingsPage() {
  const { theme, language, background, setTheme, setLanguage, setBackground } = useSettings();
  const [bgInput, setBgInput] = useState(background);

  const handleBgSave = () => {
    setBackground(bgInput);
  };

  return (
    <div className="max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Monitor className="text-blue-600 dark:text-blue-400" />
          App Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Sesuaikan tampilan, bahasa, dan nuansa aplikasi KeuanganKu.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tampilan (Theme)</h2>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                theme === "light" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-slate-200 dark:border-slate-600 hover:border-blue-300 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Sun size={24} />
              <span className="font-semibold">Terang (Light)</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                theme === "dark" 
                  ? "border-blue-600 bg-slate-700 text-blue-400" 
                  : "border-slate-200 dark:border-slate-600 hover:border-blue-300 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Moon size={24} />
              <span className="font-semibold">Gelap (Dark)</span>
            </button>
          </div>
        </div>

        {/* Custom Background Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Custom Background</h2>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Ubah latar belakang halaman ini. Anda bisa memasukkan link gambar (URL) atau kode warna HEX (misal: <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">#e2e8f0</code>).
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={bgInput}
              onChange={(e) => setBgInput(e.target.value)}
              placeholder="Kosongkan untuk bawaan (default), atau isi URL gambar / kode warna"
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
            <button
              onClick={handleBgSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Palette size={18} />
              Terapkan
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              <Languages size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Pilihan Bahasa</h2>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            *(Catatan: Saat ini perubahan bahasa baru akan memengaruhi Sidebar dan sebagian kecil antarmuka untuk versi percobaan)*
          </p>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full md:w-1/2 px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
