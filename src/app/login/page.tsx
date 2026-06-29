'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <div className="w-full max-w-md space-y-8 high-tech-card p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="text-center relative">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Marketbiz System</h2>
          <p className="mt-2 text-sm text-slate-400">Digital Agency Command Center</p>
        </div>

        <form className="mt-8 space-y-6 relative" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Username / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="admin@marketbiz.id"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'INITIALIZE ACCESS'
            )}
          </button>
          
          <div className="text-center mt-4">
            <span className="text-xs text-slate-500 uppercase tracking-tighter">System Version 1.0.0-PROTOTYPE</span>
          </div>
        </form>
      </div>
    </div>
  );
}
