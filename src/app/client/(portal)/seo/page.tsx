'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  Activity,
  Loader2,
  AlertTriangle,
  Eye,
  ExternalLink,
  Laptop,
  HelpCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface Project {
  id: string;
  name: string;
  website_url: string;
  ga_property_id: string;
  status: string;
  client_id: string;
}

export default function SEOOverviewPage() {
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
  const [aggregatedGA, setAggregatedGA] = useState({
    activeUsers: 0,
    sessions: 0,
    pageViews: 0,
    users: 0,
    bounceRate: 0,
    loading: false
  });

  useEffect(() => {
    document.title = "SEO Performance | Client Portal";
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
    }
  }, [clientId, page]);

  useEffect(() => {
    async function loadAggregatedGA() {
      if (!clientId) return;
      setAggregatedGA(prev => ({ ...prev, loading: true }));
      try {
        const res = await fetch(`/api/seo/aggregated-ga4?client_id=${clientId}`);
        const result = await res.json();
        
        if (res.ok) {
          setAggregatedGA({
            activeUsers: result.activeUsers || 0,
            sessions: result.sessions || 0,
            pageViews: result.pageViews || 0,
            users: result.users || 0,
            bounceRate: result.bounceRate || 0,
            loading: false
          });
        } else {
          throw new Error(result.error || 'Failed to fetch aggregated metrics');
        }
      } catch (err) {
        console.error('Error fetching aggregated GA4 metrics:', err);
        setAggregatedGA(prev => ({ ...prev, loading: false }));
      }
    }

    loadAggregatedGA();
  }, [projects, clientId]);

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
        .eq('services.name', 'SEO')
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
        website_url: p.website_url || '',
        ga_property_id: p.ga_property_id || '',
        status: p.status,
        client_id: p.client_id,
      }));

      setProjects(formatted);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load SEO projects');
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

  const totalProjects = totalCount;
  const withGaCount = projects.filter(p => p.ga_property_id).length;
  const withUrlCount = projects.filter(p => p.website_url).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SEO Projects Overview
          </h1>
          <p className="text-slate-400 mt-1">View your active SEO projects and property details.</p>
        </div>
      </div>

      {/* Section 1: Aggregated Metrics */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-8">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <span className="w-1.5 h-3 bg-cyan-400 rounded-xs"></span>
          Data Riil Gabungan SEO (Global)
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total SEO Projects</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalProjects}</h3>
          <p className="text-[10px] text-slate-500 mt-1">All registered client websites</p>
        </div>

        <div className="high-tech-card p-6 border-cyan-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected GA4</p>
          <h3 className="text-3xl font-extrabold text-cyan-400 mt-3 font-mono">{withGaCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Projects configured with API tracking</p>
        </div>

        <div className="high-tech-card p-6 border-emerald-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Users</p>
            {aggregatedGA.loading ? (
              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">
            {aggregatedGA.loading ? '...' : aggregatedGA.activeUsers}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total live visitors right now</p>
        </div>

        <div className="high-tech-card p-6 border-purple-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organic Sessions</p>
            {aggregatedGA.loading && <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-purple-400 mt-3 font-mono">
            {aggregatedGA.loading ? '...' : aggregatedGA.sessions.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total sessions (30 days)</p>
        </div>

        <div className="high-tech-card p-6 border-amber-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Bounce Rate</p>
            {aggregatedGA.loading && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
          </div>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-3 font-mono">
            {aggregatedGA.loading ? '...' : `${aggregatedGA.bounceRate.toFixed(1)}%`}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Average bounce index</p>
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
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading SEO projects...</p>
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">RETRY</button>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Website URL</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">GA4 Property ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No SEO projects found.
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
                            {proj.website_url ? (
                              <a href={proj.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors max-w-[200px] truncate" title={proj.website_url}>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{proj.website_url.replace(/^https?:\/\//, '')}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-600 italic">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {proj.ga_property_id ? (
                              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{proj.ga_property_id}</span>
                            ) : (
                              <span className="text-xs text-slate-600 italic">Not configured</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                              proj.status === 'active' 
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                                : "bg-slate-800 text-slate-400 border-white/10"
                            )}>
                              {proj.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/client/seo/detail/${proj.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all group"
                              title="View Report Details"
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
                            ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
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
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-cyan-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Panduan Metrik GA4 (SEO)
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
                <p className="font-bold text-cyan-400">1. Total SEO Projects & Connected GA4</p>
                <p className="text-slate-400">Jumlah situs/proyek SEO Anda. Connected GA4 menunjukkan berapa proyek yang sudah terhubung sukses dengan API Google Analytics 4.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">2. Active Users (Realtime)</p>
                <p className="text-slate-400">Jumlah pengunjung organik (di luar iklan) yang sedang aktif membuka website Anda saat ini (realtime data). *Membutuhkan Connected GA4*.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">3. Organic Sessions (30 Hari Terakhir)</p>
                <p className="text-slate-400">Total interaksi kunjungan pengguna dari pencarian organik selama 30 hari terakhir. Metrik ini krusial untuk mengukur keberhasilan SEO.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">4. Avg Bounce Rate</p>
                <p className="text-slate-400">Persentase rata-rata pengunjung yang meninggalkan situs Anda tanpa berinteraksi lebih jauh. Angka yang terlalu tinggi (misal di atas 70%) mengindikasikan konten/halaman tidak relevan dengan pencarian.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
