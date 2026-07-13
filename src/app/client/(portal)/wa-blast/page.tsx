'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Search, 
  Loader2,
  AlertTriangle,
  Eye,
  HelpCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface Project {
  id: string;
  name: string;
  status: string;
  client_id: string;
}

export default function ClientWABlastPage() {
  const supabase = createClient();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
    loading: false
  });

  useEffect(() => {
    document.title = "WhatsApp Blast | Client Portal";
  }, []);

  useEffect(() => {
    async function initClient() {
      if (!user) return;
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (clientInfo) setClientId(clientInfo.id);
    }
    initClient();
  }, [user]);

  useEffect(() => {
    if (clientId) {
      fetchData();
      fetchStats();
    }
  }, [clientId, page]);

  async function fetchStats() {
    if (!clientId) return;
    setStats(prev => ({ ...prev, loading: true }));
    try {
      // First, get the project IDs for this client's WA Blast service
      const { data: clientProjects } = await supabase
        .from('projects')
        .select('id, services!inner(name)')
        .eq('client_id', clientId)
        .eq('services.name', 'WA Blast');

      const projectIds = clientProjects?.map(p => p.id) || [];

      if (projectIds.length > 0) {
        const { data: reportsData } = await supabase
          .from('wa_blast_reports')
          .select('total_sent, delivered, read, failed', { count: 'exact' })
          .in('project_id', projectIds);

        if (reportsData) {
          setStats({
            totalCampaigns: reportsData.length,
            totalSent: reportsData.reduce((acc, curr) => acc + (curr.total_sent || 0), 0),
            totalDelivered: reportsData.reduce((acc, curr) => acc + (curr.delivered || 0), 0),
            totalRead: reportsData.reduce((acc, curr) => acc + (curr.read || 0), 0),
            totalFailed: reportsData.reduce((acc, curr) => acc + (curr.failed || 0), 0),
            loading: false
          });
          return;
        }
      }
      
      setStats({
        totalCampaigns: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        totalFailed: 0,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching WA blast stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  async function fetchData() {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('projects')
        .select('*, services!inner(name)', { count: 'exact' })
        .eq('services.name', 'WA Blast')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error: fetchErr } = await query.range(from, to);

      if (fetchErr) throw fetchErr;

      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        client_id: p.client_id,
      }));

      setProjects(formatted);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load WA Blast projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            WhatsApp Blast Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor the performance and delivery rates of your WhatsApp campaigns.</p>
        </div>
      </div>

      {/* Section 1: Aggregated Metrics */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <span className="w-1.5 h-3 bg-emerald-400 rounded-xs"></span>
          Data Riil Gabungan (Global)
        </div>
        <button 
          onClick={() => setIsHelpModalOpen(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Penjelasan Metrik
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="high-tech-card p-6 border-indigo-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Projects</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Active WA Blast projects</p>
        </div>

        <div className="high-tech-card p-6 border-teal-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</p>
            {stats.loading && <Loader2 className="w-3 h-3 text-teal-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-teal-400 mt-3 font-mono">
            {stats.loading ? '...' : stats.totalCampaigns}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total blast campaigns</p>
        </div>

        <div className="high-tech-card p-6 border-emerald-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Messages Sent</p>
            {stats.loading && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">
            {stats.loading ? '...' : stats.totalSent.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total attempted deliveries</p>
        </div>

        <div className="high-tech-card p-6 border-cyan-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivered</p>
            {stats.loading && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-cyan-400 mt-3 font-mono">
            {stats.loading ? '...' : stats.totalDelivered.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Successfully received messages</p>
        </div>

        <div className="high-tech-card p-6 border-red-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed</p>
            {stats.loading && <Loader2 className="w-3 h-3 text-red-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-red-400 mt-3 font-mono">
            {stats.loading ? '...' : stats.totalFailed.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Failed delivery attempts</p>
        </div>
      </div>

      <div className="high-tech-card p-4 flex items-center gap-4 bg-slate-900/40">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search project name... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading WA Blast projects...</p>
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">RETRY</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="high-tech-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-12">No.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Project Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No WA Blast projects found.
                      </td>
                    </tr>
                  ) : (
                    projects.map((proj, index) => {
                      const rowNumber = (page - 1) * limit + index + 1;
                      return (
                        <tr key={proj.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{rowNumber}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-sm text-white">{proj.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                              proj.status === 'active' 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-slate-800 text-slate-400 border-white/10"
                            )}>
                              {proj.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/client/wa-blast/detail/${proj.id}`}
                              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-lg text-xs text-white hover:text-emerald-400 transition-all font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Campaigns
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <span className="text-white font-bold">{(page - 1) * limit + 1}</span> to <span className="text-white font-bold">{Math.min(page * limit, totalCount)}</span> of <span className="text-white font-bold">{totalCount}</span> projects
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    PREV
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all",
                          page === p 
                            ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                            : "bg-transparent text-slate-400 hover:bg-white/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
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
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-emerald-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                Panduan Metrik WA Blast
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
                <p className="font-bold text-emerald-400">1. Total Campaigns</p>
                <p className="text-slate-400">Jumlah total pengiriman blast (campaign) yang pernah Anda jalankan di dalam seluruh proyek WA Blast Anda.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">2. Messages Sent</p>
                <p className="text-slate-400">Total percobaan pengiriman pesan. Ini adalah jumlah kontak target yang diproses dalam seluruh blast Anda.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">3. Delivered</p>
                <p className="text-slate-400">Pesan yang sukses terkirim dan masuk ke aplikasi WhatsApp penerima, tetapi belum tentu dibaca (Centang Dua Abu-Abu).</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">4. Failed</p>
                <p className="text-slate-400">Pesan yang gagal terkirim (Centang Merah/Gagal). Hal ini bisa disebabkan oleh nomor yang tidak terdaftar di WhatsApp atau tidak aktif.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
