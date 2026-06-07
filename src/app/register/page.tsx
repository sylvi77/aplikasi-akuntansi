"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, Wallet, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // If session is immediately available (email confirmation disabled), go to dashboard
      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        // Email confirmation required — show success message
        setRegistered(true);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Gradient header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-10 pb-12 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <Wallet size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">KeuanganKu</h1>
            <p className="text-blue-100 text-sm mt-1">Kelola keuangan Anda dengan mudah</p>
            <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden">
              <svg viewBox="0 0 1200 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,48 C300,0 900,0 1200,48 L1200,48 L0,48 Z" className="fill-white dark:fill-slate-900" />
              </svg>
            </div>
          </div>

          <div className="px-8 pt-6 pb-8">

            {/* Success state */}
            {registered ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Akun Berhasil Dibuat!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                  Kami telah mengirim link verifikasi ke:
                </p>
                <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-6 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                  {email}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">
                  Buka email Anda, klik link verifikasi, lalu login.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-center text-sm"
                >
                  Pergi ke Halaman Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Buat Akun Baru</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Mulai kelola keuangan Anda secara gratis</p>

                {error && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 mb-5 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="nama@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 6 && (
                      <p className="text-xs text-amber-500">Password terlalu pendek (min. 6 karakter)</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Ulangi password"
                        required
                        autoComplete="new-password"
                      />
                      {confirmPassword.length > 0 && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {password === confirmPassword
                            ? <CheckCircle2 size={16} className="text-green-500" />
                            : <AlertCircle size={16} className="text-red-400" />
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm shadow-blue-200 dark:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Membuat Akun...
                      </>
                    ) : 'Daftar Sekarang'}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Masuk di sini
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          © 2026 KeuanganKu App · Data Anda aman & terenkripsi
        </p>
      </div>
    </div>
  );
}
