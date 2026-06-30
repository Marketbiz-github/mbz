'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Loader2,
  AlertTriangle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface Project {
  id: string;
  name: string;
  website_url: string;
  status: string;
  client_id: string;
  sosmed_platforms: string[];
}

// Real Social SVG Logos
function InstagramLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <radialGradient id="ig-grad-list-client" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad-list-client)" />
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="white" />
    </svg>
  );
}

function TikTokLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.53 2c.07.1.15.2.22.3a6.83 6.83 0 0 0 5.16 3.1c.14.01.28.02.42.02v3.74a10.6 10.6 0 0 1-5.7-1.83v7.35a5.55 5.55 0 0 1-5.55 5.56A5.55 5.55 0 0 1 1.52 14.7a5.55 5.55 0 0 1 5.34-5.54c.26 0 .52.02.77.06v3.73c-.25-.06-.5-.09-.77-.09a1.81 1.81 0 0 0-1.81 1.82 1.81 1.81 0 0 0 1.81 1.82 1.81 1.81 0 0 0 1.81-1.82V2.01h3.86Z" fill="#00F2EA" />
      <path d="M12.5 2.03c.07.1.15.2.22.3a6.83 6.83 0 0 0 5.16 3.1c.14.01.28.02.42.02v3.74a10.6 10.6 0 0 1-5.7-1.83v7.35a5.55 5.55 0 0 1-5.55 5.56A5.55 5.55 0 0 1 1.49 14.7a5.55 5.55 0 0 1 5.34-5.54c.26 0 .52.02.77.06v3.73c-.25-.06-.5-.09-.77-.09a1.81 1.81 0 0 0-1.81 1.82 1.81 1.81 0 0 0 1.81 1.82 1.81 1.81 0 0 0 1.81-1.82V2.04h3.86Z" fill="#FF007F" className="mix-blend-lighten opacity-80" />
    </svg>
  );
}

function LinkedInLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M6.5 6.5h3v10h-3zM8 5a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 5zM11 9.5h2.8v1.36h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47v5.69h-3.13v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58v4.99H11v-10z" fill="white" />
    </svg>
  );
}

function FacebookLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path d="M14 12h-2v7H9v-7H7.5V9.5H9V8.1c0-1.6 1-2.6 2.6-2.6.8 0 1.5.06 1.7.08v2h-1.2c-.8 0-1 .4-1 1v1.4h2.2L14 12Z" fill="white" />
    </svg>
  );
}

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: InstagramLogo, color: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', icon: TikTokLogo, color: '#00F2EA' },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInLogo, color: '#0A66C2' },
  { id: 'facebook', label: 'Facebook', icon: FacebookLogo, color: '#1877F2' }
];

export default function ClientSosmedPage() {
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

  useEffect(() => {
    document.title = "Sosmed Performance | Client Portal";
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_id', user!.id)
        .single();
        
      if (!clientInfo) {
        setLoading(false);
        return;
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('projects')
        .select('*, services!inner(name)', { count: 'exact' })
        .eq('services.name', 'Sosmed')
        .eq('client_id', clientInfo.id)
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
        status: p.status,
        client_id: p.client_id,
        sosmed_platforms: p.sosmed_platforms || ['instagram', 'tiktok', 'linkedin', 'facebook']
      }));

      setProjects(formatted);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load Sosmed projects');
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
  const activeProjects = projects.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Sosmed Campaigns Overview
          </h1>
          <p className="text-slate-400 mt-1">View your Social Media management projects and performance.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="high-tech-card p-6 border-indigo-500/20 bg-linear-to-br from-indigo-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalProjects}</h3>
          <p className="text-[10px] text-slate-500 mt-1">All your registered social media campaigns</p>
        </div>

        <div className="high-tech-card p-6 border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Campaigns</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">{activeProjects}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Currently running campaigns</p>
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
          <p className="text-sm text-slate-500">Loading Social Media campaigns...</p>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Campaign Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Target URL</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platforms</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No social media campaigns found.
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
                            <div className="flex items-center gap-2">
                              {platforms.map(platform => {
                                const isActive = proj.sosmed_platforms?.includes(platform.id);
                                if (!isActive) return null;
                                return (
                                  <div key={platform.id} title={platform.label} className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <platform.icon />
                                  </div>
                                );
                              })}
                            </div>
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
                              href={`/client/sosmed/detail/${proj.id}`}
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
    </div>
  );
}
