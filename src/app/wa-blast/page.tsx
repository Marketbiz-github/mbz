'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  X,
  CheckCircle2,
  Edit2,
  AlertTriangle,
  Eye,
  Loader2,
  Search,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  status: string;
  client_id: string;
  clients?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Array<{ id: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  emptyMessage = "No results found",
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);
  const filtered = options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white cursor-pointer hover:border-cyan-500/50 transition-all select-none min-h-[36px]"
      >
        <span className={selectedOption ? "text-white font-medium" : "text-slate-500"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className="text-slate-500 text-[10px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 w-full min-w-[200px] mt-1 bg-slate-950 border border-white/15 rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-100 max-h-60 flex flex-col">
          <div className="p-2 border-b border-white/10 bg-black/40">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 max-h-[180px] bg-slate-950">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-500 text-center">{emptyMessage}</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-xs text-white hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer transition-colors ${opt.id === value ? "bg-white/5 text-cyan-400 font-bold" : ""
                    }`}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WABlastOverviewPage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [waBlastServiceId, setWaBlastServiceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filterClientId, setFilterClientId] = useState('');

  // Project Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [newProjClientId, setNewProjClientId] = useState('');
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
  });

  useEffect(() => {
    document.title = "WhatsApp Blast | MarketBiz";
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, filterClientId]);

  useEffect(() => {
    fetchStats();
  }, [filterClientId, projects]);

  const fetchInitialData = async () => {
    try {
      // Fetch WA Blast service ID
      const { data: svcData } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'WA Blast')
        .single();
      if (svcData) {
        setWaBlastServiceId(svcData.id);
      }

      // Fetch Clients who have WA Blast active
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, client_services!inner(service_id, services!inner(name))')
        .eq('client_services.services.name', 'WA Blast');

      setClients(clientsData || []);
    } catch (err) {
      console.error('Error fetching initial settings metadata:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('projects')
        .select('*, clients!inner(name), services!inner(name)', { count: 'exact' })
        .eq('services.name', 'WA Blast')
        .order('created_at', { ascending: false });

      if (filterClientId) {
        query = query.eq('client_id', filterClientId);
      }
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
        clients: p.clients
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

  const fetchStats = async () => {
    try {
      let query = supabase.from('wa_blast_reports').select('total_sent, delivered, read, failed', { count: 'exact' });

      if (filterClientId && projects.length > 0) {
        const projectIds = projects.filter(p => p.client_id === filterClientId).map(p => p.id);
        if (projectIds.length > 0) {
          query = query.in('project_id', projectIds);
        } else {
          setStats({ totalCampaigns: 0, totalSent: 0, totalDelivered: 0, totalRead: 0, totalFailed: 0 });
          return;
        }
      }

      const { data, count, error } = await query;
      if (error) throw error;

      if (data) {
        const totalSent = data.reduce((acc, curr) => acc + (curr.total_sent || 0), 0);
        const totalDelivered = data.reduce((acc, curr) => acc + (curr.delivered || 0), 0);
        const totalRead = data.reduce((acc, curr) => acc + (curr.read || 0), 0);
        const totalFailed = data.reduce((acc, curr) => acc + (curr.failed || 0), 0);

        setStats({
          totalCampaigns: count || 0,
          totalSent,
          totalDelivered,
          totalRead,
          totalFailed
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData();
    }
  };

  const handleCreateProject = async () => {
    if (!newProjClientId) {
      alert('Please select a client.');
      return;
    }
    if (!newProjName.trim()) {
      alert('Please enter a project name.');
      return;
    }
    if (!waBlastServiceId) {
      alert('WA Blast Service metadata not loaded yet.');
      return;
    }

    setSaving(true);
    try {
      const { error: insertErr } = await supabase
        .from('projects')
        .insert({
          client_id: newProjClientId,
          service_id: waBlastServiceId,
          name: newProjName,
          description: newProjDesc,
          status: 'active'
        });

      if (insertErr) throw insertErr;

      setIsCreateModalOpen(false);
      setNewProjClientId('');
      setNewProjName('');
      setNewProjDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create new WA Blast project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            WA Blast Projects
          </h1>
          <p className="text-slate-400 mt-1">Manage WhatsApp Broadcast campaigns, contacts, and track delivery performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white/5 text-slate-300 border border-white/10 px-4 py-3 rounded-xl font-bold hover:bg-white/10 hover:text-white transition-all cursor-pointer text-xs"
          >
            <HelpCircle className="w-4 h-4" />

          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            NEW PROJECT
          </button>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="high-tech-card p-6 border-emerald-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Projects</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalCount}</h3>
        </div>
        <div className="high-tech-card p-6 border-teal-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</p>
          <h3 className="text-3xl font-extrabold text-teal-400 mt-3 font-mono">{stats.totalCampaigns}</h3>
        </div>
        <div className="high-tech-card p-6 border-cyan-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Messages Sent</p>
          <h3 className="text-3xl font-extrabold text-cyan-400 mt-3 font-mono">{stats.totalSent.toLocaleString()}</h3>
        </div>
        <div className="high-tech-card p-6 border-indigo-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivered</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-3 font-mono">{stats.totalDelivered.toLocaleString()}</h3>
        </div>
        <div className="high-tech-card p-6 border-red-500/20 bg-slate-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed</p>
          <h3 className="text-3xl font-extrabold text-red-400 mt-3 font-mono">{stats.totalFailed.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="high-tech-card p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-900/40">
        <div className="relative flex-1 w-full">
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

        <div className="w-full md:w-64">
          <SearchableSelect
            options={clients.map(c => ({ id: c.id, name: c.name }))}
            value={filterClientId}
            onChange={(val) => {
              setFilterClientId(val);
              setPage(1);
            }}
            placeholder="Filter by Client..."
            emptyMessage="No WA Blast clients found"
          />
        </div>
      </div>

      {/* Data Table */}
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
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
                            <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-300">{proj.clients?.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                proj.status === 'completed' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-slate-500/10 text-slate-400 border border-white/10'
                            )}>
                              {proj.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/wa-blast/detail/${proj.id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-lg text-xs text-white hover:text-emerald-400 transition-all cursor-pointer font-semibold"
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
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-950 p-4 border border-white/10 rounded-xl">
              <span className="text-xs text-slate-500 font-bold">
                Showing {projects.length} of {totalCount} projects
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  PREVIOUS
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create WA Blast Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Create WA Blast Project</h3>
              <p className="text-xs text-slate-500 mt-1">Initialize a new project to start sending WhatsApp campaigns.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Select Client</label>
                <SearchableSelect
                  options={clients.map(c => ({ id: c.id, name: c.name }))}
                  value={newProjClientId}
                  onChange={(val) => setNewProjClientId(val)}
                  placeholder="Search and select client..."
                  emptyMessage="No WA Blast clients found"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Promo Ramadhan 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Optional brief description..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCreateProject}
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              CREATE PROJECT
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-emerald-400" />
                Cara Menggunakan WA Blast
              </h3>
              <p className="text-xs text-slate-400 mt-1">Panduan singkat penggunaan fitur WhatsApp Blast & Format CSV.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <h4 className="text-sm font-bold text-emerald-400 mb-2">1. Format Excel (.xlsx)</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Baris pertama <strong>WAJIB</strong> berisi nama header kolom.</li>
                  <li><strong>WAJIB</strong> ada satu kolom nomor HP bernama <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300">phone</code>, <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300">phone_number</code>, atau <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300">whatsapp</code>.</li>
                  <li>Kolom sisanya bersifat dinamis. Anda bebas menambahkan kolom lain seperti <code>nama</code> atau pesan kustom lainnya.</li>
                </ul>
                <div className="mt-4">
                  <a href="/wa_blast_template.xlsx" download className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-400 transition-colors">
                    Download Contoh Excel
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">Alur Penggunaan (Step-by-Step)</h4>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-200">Buat Project Baru</h5>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol <strong>NEW PROJECT</strong> di halaman utama ini. Pilih klien dan beri nama projectnya (misal: "Promo Akhir Tahun").</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-200">Buka Detail Project</h5>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol <strong>View Campaigns</strong> (ikon mata) di tabel untuk masuk ke dalam project tersebut.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-200">Buat Campaign & Upload Data</h5>
                    <p className="text-xs text-slate-400 mt-1">Di dalam project, klik <strong>NEW CAMPAIGN</strong>. Masukkan nama campaign, lalu pilih mau <strong>Upload File (Excel/CSV)</strong> atau <strong>Input Manual</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-200">Launch & Pantau Report</h5>
                    <p className="text-xs text-slate-400 mt-1">Setelah klik <strong>LAUNCH CAMPAIGN</strong>, Anda akan diarahkan ke halaman laporan detail untuk memantau status pengiriman secara *Real-time*. Anda juga bisa merubah status manual jika diperlukan.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-right">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-colors"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
