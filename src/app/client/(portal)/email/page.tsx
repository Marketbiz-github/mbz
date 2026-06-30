'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  BarChart3, 
  Eye,
  MousePointer2,
  Loader2,
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface EmailCampaign {
  id: string;
  client_id: string;
  name: string;
  sender: string;
  sent_at: string;
  utcid: string;
  status: string;
  recipients: number;
  opens: number;
  clicks: number;
  replies: number;
  unsubscribes: number;
  bounces: number;
  blocks: number;
  opens_excl_apple: number;
}

export default function ClientEmailPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalSent: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalBounces: 0
  });

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = "Email Blast Reports | Client Portal";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!clientInfo) {
          if (!cancelled) setLoading(false);
          return;
        }

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {}),
          client_id: clientInfo.id
        });
        const response = await fetch(`/api/email-campaigns?${queryParams.toString()}`);
        const result = await response.json();
        if (result.status === 'error') throw new Error(result.message);

        if (!cancelled) {
          setCampaigns(result.data.campaigns || []);
          setTotalPages(result.data.pagination.totalPages || 1);
          setTotalCount(result.data.pagination.total || 0);
          if (result.data.aggregates) {
            setGlobalStats(result.data.aggregates);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch data';
          console.error('Error fetching data:', err);
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, page, limit, search, supabase]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
    }
  };

  const totalSent = globalStats.totalSent;
  const avgOpenRate = totalSent > 0 ? ((globalStats.totalOpens / totalSent) * 100).toFixed(1) : '0.0';
  const avgClickRate = totalSent > 0 ? ((globalStats.totalClicks / totalSent) * 100).toFixed(1) : '0.0';
  const avgBounceRate = totalSent > 0 ? ((globalStats.totalBounces / totalSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Email Campaigns
          </h1>
          <p className="text-slate-400 mt-1">View the performance of your email blast campaigns.</p>
        </div>
      </div>

      {/* Section 1: Real-time Global Email Metrics */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <span className="w-1.5 h-3 bg-cyan-400 rounded-xs"></span>
          Data Riil Email Blast (Global)
        </div>
        <button 
          onClick={() => setIsHelpModalOpen(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Penjelasan Metrik
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Total Campaigns */}
        <div className="high-tech-card p-5 border-indigo-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</span>
          </div>
          <h3 className="text-3xl font-extrabold text-white font-mono">{totalCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">All campaign reports</p>
        </div>

        {/* Avg Open Rate */}
        <div className="high-tech-card p-5 border-cyan-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Open Rate</span>
          </div>
          <h3 className="text-3xl font-extrabold text-cyan-400 font-mono">{avgOpenRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Across all campaigns</p>
        </div>

        {/* Avg Click Rate */}
        <div className="high-tech-card p-5 border-emerald-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Click Rate</span>
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400 font-mono">{avgClickRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Across all campaigns</p>
        </div>

        {/* Total Recipients (Sent) */}
        <div className="high-tech-card p-5 border-purple-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sent</span>
          </div>
          <h3 className="text-3xl font-extrabold text-purple-400 font-mono">{totalSent.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Audience reached</p>
        </div>

        {/* Avg Bounce Rate */}
        <div className="high-tech-card p-5 border-amber-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Bounce Rate</span>
          </div>
          <h3 className="text-3xl font-extrabold text-amber-400 font-mono">{avgBounceRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Average bounce index</p>
        </div>
      </div>

      <div className="high-tech-card p-4 flex items-center gap-4 bg-slate-900/40">
        <div className="relative flex-1 max-w-md">
          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={handleSearchKeyPress}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading email campaigns...</p>
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="high-tech-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-12">No.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Campaign Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Recipients</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Opens</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Clicks</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No email campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp, index) => {
                      const rowNumber = (page - 1) * limit + index + 1;
                      return (
                      <tr key={camp.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{rowNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-white mb-1">{camp.name}</p>
                          <p className="text-xs text-slate-500 font-mono">Sent: {new Date(camp.sent_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm text-slate-300">{camp.recipients.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm text-cyan-400 font-bold">{camp.opens.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {((camp.opens / (camp.recipients || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm text-emerald-400 font-bold">{camp.clicks.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {((camp.clicks / (camp.opens || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                            camp.status === 'completed' || camp.status === 'sent'
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {camp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/client/email/detail/${camp.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all group"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 font-medium">
                  Showing page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    PREV
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-indigo-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                Penjelasan Metrik Email Blast
              </h3>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <p className="font-bold text-indigo-400">1. Total Campaigns</p>
                <p className="text-slate-400">Jumlah total seluruh kampanye/blast email yang telah dikirimkan untuk Anda.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-indigo-400">2. Avg Open Rate (Rasio Buka)</p>
                <p className="text-slate-400">Persentase rata-rata email yang dibuka oleh penerima dari seluruh kampanye yang dikirimkan.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-indigo-400">3. Avg Click Rate (Rasio Klik)</p>
                <p className="text-slate-400">Persentase rata-rata penerima yang mengklik tautan/link di dalam email dari total email yang berhasil terkirim.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-indigo-400">4. Total Sent</p>
                <p className="text-slate-400">Akumulasi jumlah total penerima/email yang dikirimkan di seluruh kampanye.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-indigo-400">5. Avg Bounce Rate (Rasio Pantulan)</p>
                <p className="text-slate-400">Persentase rata-rata email yang memantul/gagal dikirimkan (karena alamat email tidak valid, tidak aktif, atau inbox penuh) dari total email terkirim.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Pahami & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
