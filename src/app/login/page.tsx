'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, Loader2, Key } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    document.title = "Masuk ke Dashboard | MarketBiz";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email atau kata sandi Anda salah.' : error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Check if profile is active
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', data.user.id)
        .single();

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        setError('Akun Anda telah dinonaktifkan. Silakan hubungi Super Admin.');
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-black to-slate-900 overflow-hidden relative">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse duration-10000 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse duration-7000 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 bg-slate-950/65 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* Top Header Card */}
        <div className="text-center relative space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/5">
              <ShieldCheck className="w-9 h-9 text-cyan-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              MarketBiz
            </h2>
            <p className="text-xs text-slate-400">
              Sistem Manajemen & Pelaporan Kinerja Kampanye Digital
            </p>
          </div>
        </div>

        {/* Form login */}
        <form className="space-y-6 relative" onSubmit={handleLogin}>
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kata Sandi</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 bg-linear-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-black font-extrabold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              'MASUK KE DASHBOARD'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-500">
            MarketBiz Agensi Pelaporan &copy; {new Date().getFullYear()} • Hak Cipta Dilindungi
          </p>
        </div>

      </div>
    </div>
  );
}
