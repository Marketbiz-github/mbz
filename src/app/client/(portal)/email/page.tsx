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
  X,
  Tag,
  Database,
  FileSpreadsheet
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
  program_id?: string | null;
  database_type?: string | null;
  audience_category?: string | null;
  program?: { id: string; name: string } | null;
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
  const [dateRange, setDateRange] = useState('30daysAgo');

  // Classification Filter States
  const [filterDbType, setFilterDbType] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [filterProgramId, setFilterProgramId] = useState('');
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

  // Fetch client programs for filtering
  useEffect(() => {
    const fetchClientPrograms = async () => {
      if (!user) return;
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (!clientInfo) return;

      const { data: projData } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', clientInfo.id);
      
      if (projData && projData.length > 0) {
        const pIds = projData.map(p => p.id);
        const { data: progData } = await supabase
          .from('email_programs')
          .select('id, name')
          .in('project_id', pIds)
          .order('name');
        setPrograms(progData || []);
      }
    };
    fetchClientPrograms();
  }, [user, supabase]);

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
          range: dateRange,
          ...(search ? { search } : {}),
          ...(filterDbType ? { database_type: filterDbType } : {}),
          ...(filterAudience ? { audience_category: filterAudience } : {}),
          ...(filterProgramId ? { program_id: filterProgramId } : {}),
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
  }, [user, page, limit, search, dateRange, filterDbType, filterAudience, filterProgramId, supabase]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
    }
  };

  const handleExportCSV = () => {
    if (campaigns.length === 0) {
      alert('Tidak ada data untuk di-export.');
      return;
    }
    const headers = [
      "Campaign Name",
      "Program",
      "Database Type",
      "Audience Category",
      "Sender",
      "UTCID",
      "Sent Date",
      "Status",
      "Recipients",
      "Opens",
      "Open Rate (%)",
      "Clicks",
      "Click Rate (%)",
      "Replies",
      "Unsubscribes",
      "Bounces",
      "Blocks",
      "Opens Excl Apple"
    ];

    const rows = campaigns.map(c => {
      const openRate = c.recipients > 0 ? ((c.opens / c.recipients) * 100).toFixed(1) : '0';
      const clickRate = c.recipients > 0 ? ((c.clicks / c.recipients) * 100).toFixed(1) : '0';
      const dbTypeLabel = c.database_type === 'internal' ? 'Internal' : c.database_type === 'external' ? 'Eksternal' : '-';
      const audLabel = c.audience_category === 'dorman' ? 'Dorman' : c.audience_category === 'non_dorman' ? 'Non-Dorman' : '-';

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.program?.name || '-').replace(/"/g, '""')}"`,
        `"${dbTypeLabel}"`,
        `"${audLabel}"`,
        `"${c.sender}"`,
        `"${c.utcid || ''}"`,
        `"${new Date(c.sent_at).toLocaleString()}"`,
        `"${c.status}"`,
        c.recipients,
        c.opens,
        `"${openRate}%"`,
        c.clicks,
        `"${clickRate}%"`,
        c.replies,
        c.unsubscribes,
        c.bounces,
        c.blocks,
        c.opens_excl_apple
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Email_Blast_Reports_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <span className="w-1.5 h-3 bg-cyan-400 rounded-xs"></span>
          Data Riil Email Blast (Global)
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
          >
            <option value="today">Hari Ini</option>
            <option value="7daysAgo">7 Hari Terakhir</option>
            <option value="30daysAgo">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Penjelasan Metrik
          </button>
        </div>
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
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-cyan-400 font-mono">{globalStats.totalOpens.toLocaleString()}</h3>
            <span className="text-xs font-bold text-cyan-400">({avgOpenRate}%)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across all campaigns</p>
        </div>

        {/* Avg Click Rate */}
        <div className="high-tech-card p-5 border-emerald-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Click Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-emerald-400 font-mono">{globalStats.totalClicks.toLocaleString()}</h3>
            <span className="text-xs font-bold text-emerald-400">({avgClickRate}%)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across all campaigns</p>
        </div>

        {/* Total Recipients (Sent) */}
        <div className="high-tech-card p-5 border-purple-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-purple-400 font-mono">{totalSent.toLocaleString()}</h3>
            <span className="text-xs font-bold text-purple-400">(100%)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Audience reached</p>
        </div>

        {/* Avg Bounce Rate */}
        <div className="high-tech-card p-5 border-amber-500/20 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Bounce Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-amber-400 font-mono">{globalStats.totalBounces.toLocaleString()}</h3>
            <span className="text-xs font-bold text-amber-400">({avgBounceRate}%)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Average bounce index</p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="high-tech-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 min-w-[200px]">
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

          {/* Database Type Filter */}
          <select
            value={filterDbType}
            onChange={(e) => {
              setFilterDbType(e.target.value);
              setFilterAudience('');
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="">Semua Database</option>
            <option value="internal">🏢 Internal</option>
            <option value="external">🌐 Eksternal</option>
          </select>

          {/* Audience Filter (if internal) */}
          {filterDbType === 'internal' && (
            <select
              value={filterAudience}
              onChange={(e) => {
                setFilterAudience(e.target.value);
                setPage(1);
              }}
              className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500/50 cursor-pointer animate-in fade-in duration-150"
            >
              <option value="">Semua Audiens</option>
              <option value="dorman">💤 Dorman</option>
              <option value="non_dorman">✅ Non-Dorman</option>
            </select>
          )}

          {/* Program Filter */}
          {programs.length > 0 && (
            <select
              value={filterProgramId}
              onChange={(e) => {
                setFilterProgramId(e.target.value);
                setPage(1);
              }}
              className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="">Semua Program</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Export Excel Button */}
        <button
          onClick={handleExportCSV}
          disabled={campaigns.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          EXPORT EXCEL
        </button>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Sender Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipients</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Performance</th>
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
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {camp.program && (
                              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                {camp.program.name}
                              </span>
                            )}
                            {camp.database_type && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                camp.database_type === 'internal' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                <Database className="w-2.5 h-2.5" />
                                {camp.database_type === 'internal' ? 'Internal' : 'Eksternal'}
                              </span>
                            )}
                            {camp.database_type === 'internal' && camp.audience_category && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                camp.audience_category === 'dorman'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              }`}>
                                {camp.audience_category === 'dorman' ? '💤 Dorman' : '✅ Non-Dorman'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-300">
                            <p>{camp.sender}</p>
                            <p className="text-slate-500">UTCID: {camp.utcid || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white">{camp.recipients.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Opens</p>
                              <p className="text-sm font-bold text-emerald-400">{camp.opens} ({((camp.opens / (camp.recipients || 1)) * 100).toFixed(1)}%)</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Clicks</p>
                              <p className="text-sm font-bold text-cyan-400">{camp.clicks} ({((camp.clicks / (camp.recipients || 1)) * 100).toFixed(1)}%)</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Bounces</p>
                              <p className="text-sm font-bold text-amber-400">{camp.bounces} ({((camp.bounces / (camp.recipients || 1)) * 100).toFixed(1)}%)</p>
                            </div>
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
