'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Activity,
  Edit2,
  Loader2,
  Eye,
  ExternalLink,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  website_url: string;
  status: string;
  client_id: string;
  active_platforms?: string;
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
  placeholder = "Pilih Klien...",
  emptyMessage = "Klien tidak ditemukan",
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
              placeholder="Cari..."
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
                  className={`px-3 py-2 text-xs text-white hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer transition-colors ${
                    opt.id === value ? "bg-white/5 text-cyan-400 font-bold" : ""
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

// Real Social SVG Logos
function InstagramLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <radialGradient id="ig-grad-list" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad-list)" />
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

export default function SosmedOverviewPage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sosmedServiceId, setSosmedServiceId] = useState<string>('');
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
  const [newProjClientId, setNewProjClientId] = useState('');
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');
  const [newProjPlatforms, setNewProjPlatforms] = useState<string[]>(['instagram', 'tiktok', 'linkedin', 'facebook']);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPlatforms, setEditPlatforms] = useState<string[]>(['instagram', 'tiktok', 'linkedin', 'facebook']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Sosmed Performance | MarketBiz";
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (sosmedServiceId) {
      fetchData();
    }
  }, [page, filterClientId, sosmedServiceId]);

  const fetchInitialData = async () => {
    try {
      const { data: svcData } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'Sosmed')
        .single();
      if (svcData) {
        setSosmedServiceId(svcData.id);
      }

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, client_services!inner(service_id, services!inner(name))')
        .eq('client_services.services.name', 'Sosmed');

      setClients(clientsData || []);
    } catch (err) {
      console.error('Error fetching initial settings metadata:', err);
    }
  };

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('projects')
        .select('id, name, website_url, status, client_id, active_platforms, clients(name)', { count: 'exact' })
        .eq('service_id', sosmedServiceId);

      if (filterClientId) {
        query = query.eq('client_id', filterClientId);
      }

      if (search.trim()) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error: fetchErr } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchErr) throw fetchErr;

      setProjects(data as any[] || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjClientId || !newProjName.trim() || !newProjUrl.trim()) {
      alert('Klien, nama proyek, dan URL website wajib diisi.');
      return;
    }
    if (newProjPlatforms.length === 0) {
      alert('Pilih minimal satu platform sosial media.');
      return;
    }

    setSaving(true);
    try {
      const { error: insertErr } = await supabase
        .from('projects')
        .insert({
          client_id: newProjClientId,
          service_id: sosmedServiceId,
          name: newProjName,
          description: newProjDesc,
          website_url: newProjUrl,
          status: 'active',
          active_platforms: newProjPlatforms.join(',')
        });

      if (insertErr) throw insertErr;

      setIsCreateModalOpen(false);
      setNewProjClientId('');
      setNewProjName('');
      setNewProjDesc('');
      setNewProjUrl('');
      setNewProjPlatforms(['instagram', 'tiktok', 'linkedin', 'facebook']);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name || '');
    setEditUrl(project.website_url || '');
    setEditStatus(project.status || 'active');
    setEditPlatforms(project.active_platforms ? project.active_platforms.split(',') : ['instagram', 'tiktok', 'linkedin', 'facebook']);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editName.trim() || !editUrl.trim()) {
      alert('Nama proyek dan URL website wajib diisi.');
      return;
    }
    if (editPlatforms.length === 0) {
      alert('Pilih minimal satu platform sosial media.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          name: editName,
          website_url: editUrl,
          status: editStatus,
          active_platforms: editPlatforms.join(',')
        })
        .eq('id', editingProject.id);

      if (updateErr) throw updateErr;

      setIsEditModalOpen(false);
      setEditingProject(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (id: string, isEdit: boolean = false) => {
    const list = isEdit ? editPlatforms : newProjPlatforms;
    const setter = isEdit ? setEditPlatforms : setNewProjPlatforms;

    if (list.includes(id)) {
      setter(list.filter(p => p !== id));
    } else {
      setter([...list, id]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Sosmed Projects</h1>
          <p className="text-slate-400 mt-1">Kelola proyek dan laporan performa sosial media agensi.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-cyan-500 text-black px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          PROYEK SOSMED BARU
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Proyek</p>
            <h3 className="text-2xl font-bold text-white">{totalCount}</h3>
          </div>
        </div>
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Proyek Aktif</p>
            <h3 className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'active').length}
            </h3>
          </div>
        </div>
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Klien Terdaftar</p>
            <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="high-tech-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between relative z-20">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari nama proyek..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto items-center">
            <SearchableSelect 
              options={clients} 
              value={filterClientId} 
              onChange={(val) => setFilterClientId(val)} 
            />
            {filterClientId && (
              <button 
                onClick={() => setFilterClientId('')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-500">Memuat data proyek...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">No</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klien & Nama Proyek</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website URL</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Aktif</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-500">
                      Tidak ada proyek sosial media yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  projects.map((project, index) => {
                    const rowNumber = (page - 1) * limit + index + 1;
                    const activePlats = project.active_platforms ? project.active_platforms.split(',') : ['instagram', 'tiktok', 'linkedin', 'facebook'];
                    return (
                      <tr key={project.id} className="hover:bg-white/2 transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{rowNumber}</td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors block">
                              {project.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                              Klien: {project.clients?.name || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={project.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            {project.website_url}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            {activePlats.includes('instagram') && <InstagramLogo className="w-4.5 h-4.5" />}
                            {activePlats.includes('tiktok') && <TikTokLogo className="w-4.5 h-4.5" />}
                            {activePlats.includes('linkedin') && <LinkedInLogo className="w-4.5 h-4.5" />}
                            {activePlats.includes('facebook') && <FacebookLogo className="w-4.5 h-4.5" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            project.status === 'active' 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : project.status === 'completed'
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          )}>
                            {project.status === 'active' ? 'Ongoing' : project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/sosmed/detail/${project.id}`}
                              className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                              title="Lihat Detail Analitik"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => openEditModal(project)}
                              className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                              title="Edit Detail Proyek"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Proyek Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateProject}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button 
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Buat Proyek Sosmed Baru</h3>
              <p className="text-xs text-slate-500 mt-1">Daftarkan target proyek pelacakan performa sosial media klien agensi.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pilih Klien</label>
                <SearchableSelect 
                  options={clients} 
                  value={newProjClientId} 
                  onChange={(val) => setNewProjClientId(val)} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nama Proyek</label>
                <input 
                  type="text" 
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Contoh: IG & TikTok PT Sinar Jaya"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Platform Sosmed Dipantau</label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(p => {
                    const isChecked = newProjPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id, false)}
                        className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                          isChecked 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-transparent border-white/5 text-slate-500 hover:text-white"
                        )}
                      >
                        <p.icon className="w-4 h-4" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Deskripsi Singkat</label>
                <textarea 
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Keterangan kampanye atau detail target..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 min-h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Website URL</label>
                <input 
                  type="url" 
                  value={newProjUrl}
                  onChange={(e) => setNewProjUrl(e.target.value)}
                  placeholder="https://sinarjaya.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SIMPAN PROYEK
            </button>
          </form>
        </div>
      )}

      {/* Modal Edit Proyek */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveEdit}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button 
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProject(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Edit Proyek Sosmed</h3>
              <p className="text-xs text-slate-500 mt-1">Ubah detail proyek pelacakan sosial media.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nama Proyek</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: IG Growth PT Sinar Jaya"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Platform Sosmed Dipantau</label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(p => {
                    const isChecked = editPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id, true)}
                        className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                          isChecked 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-transparent border-white/5 text-slate-500 hover:text-white"
                        )}
                      >
                        <p.icon className="w-4 h-4" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Website URL</label>
                <input 
                  type="url" 
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://sinarjaya.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Status Proyek</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="active" className="bg-slate-950">Ongoing</option>
                  <option value="completed" className="bg-slate-950">Completed</option>
                  <option value="on_hold" className="bg-slate-950">On Hold</option>
                  <option value="cancelled" className="bg-slate-950">Cancelled</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SIMPAN PERUBAHAN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
