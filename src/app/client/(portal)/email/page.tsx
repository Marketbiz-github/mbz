'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  BarChart3, 
  Eye,
  MousePointer2,
  Loader2,
  AlertTriangle
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

  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipients || 0), 0);
  const avgOpenRate = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + ((c.opens / (c.recipients || 1)) * 100), 0) / campaigns.length).toFixed(1) 
    : '0.0';

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="high-tech-card p-6 border-indigo-500/20 bg-linear-to-br from-indigo-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Total emails sent</p>
        </div>

        <div className="high-tech-card p-6 border-cyan-500/20 bg-linear-to-br from-cyan-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Open Rate</p>
          <h3 className="text-3xl font-extrabold text-cyan-400 mt-3 font-mono">{avgOpenRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Across all campaigns</p>
        </div>

        <div className="high-tech-card p-6 border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Recipients</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">{totalRecipients.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Audience reached</p>
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
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No email campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-white/2 transition-colors">
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
                    ))
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
    </div>
  );
}
