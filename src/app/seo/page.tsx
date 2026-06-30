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
  Trash2,
  Settings2,
  Loader2,
  AlertTriangle,
  Eye,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  website_url: string;
  ga_property_id: string;
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

// Select2-like Searchable Select Component
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

export default function SEOOverviewPage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [seoServiceId, setSeoServiceId] = useState<string>('');
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
  const [newProjGaId, setNewProjGaId] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editGaId, setEditGaId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "SEO Performance | MarketBiz";
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, filterClientId]);

  const fetchInitialData = async () => {
    try {
      // Fetch SEO service ID
      const { data: svcData } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'SEO')
        .single();
      if (svcData) {
        setSeoServiceId(svcData.id);
      }

      // Fetch Clients who have SEO active
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, client_services!inner(service_id, services!inner(name))')
        .eq('client_services.services.name', 'SEO');

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
        .eq('services.name', 'SEO')
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
        website_url: p.website_url || '',
        ga_property_id: p.ga_property_id || '',
        status: p.status,
        client_id: p.client_id,
        clients: p.clients
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

  const handleCreateProject = async () => {
    if (!newProjClientId) {
      alert('Please select a client.');
      return;
    }
    if (!newProjName.trim()) {
      alert('Please enter a project name.');
      return;
    }
    if (!newProjUrl.trim()) {
      alert('Please enter the target Website URL.');
      return;
    }
    if (!newProjGaId.trim()) {
      alert('Please enter the Google Analytics 4 Property ID.');
      return;
    }
    if (!seoServiceId) {
      alert('SEO Service metadata not loaded yet.');
      return;
    }

    setSaving(true);
    try {
      // Validate GA Property ID
      const valRes = await fetch(`/api/seo/validate-property?property_id=${encodeURIComponent(newProjGaId)}`);
      const valData = await valRes.json();
      if (!valData.valid) {
        alert(valData.error || 'Property ID Google Analytics tidak valid atau tidak bisa diakses.');
        setSaving(false);
        return;
      }
      if (valData.warning) {
        const confirmSave = window.confirm(valData.warning + '\n\nTetap simpan proyek?');
        if (!confirmSave) {
          setSaving(false);
          return;
        }
      }

      const { error: insertErr } = await supabase
        .from('projects')
        .insert({
          client_id: newProjClientId,
          service_id: seoServiceId,
          name: newProjName,
          description: newProjDesc,
          website_url: newProjUrl,
          ga_property_id: newProjGaId,
          status: 'active'
        });

      if (insertErr) throw insertErr;

      setIsCreateModalOpen(false);
      // Reset form fields
      setNewProjClientId('');
      setNewProjName('');
      setNewProjDesc('');
      setNewProjUrl('');
      setNewProjGaId('');

      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create new SEO project');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setEditUrl(proj.website_url);
    setEditGaId(proj.ga_property_id);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    if (!editUrl.trim()) {
      alert('Please enter the target Website URL.');
      return;
    }
    if (!editGaId.trim()) {
      alert('Please enter the Google Analytics 4 Property ID.');
      return;
    }
    setSaving(true);
    try {
      // Validate GA Property ID
      const valRes = await fetch(`/api/seo/validate-property?property_id=${encodeURIComponent(editGaId)}`);
      const valData = await valRes.json();
      if (!valData.valid) {
        alert(valData.error || 'Property ID Google Analytics tidak valid atau tidak bisa diakses.');
        setSaving(false);
        return;
      }
      if (valData.warning) {
        const confirmSave = window.confirm(valData.warning + '\n\nTetap simpan proyek?');
        if (!confirmSave) {
          setSaving(false);
          return;
        }
      }

      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          website_url: editUrl,
          ga_property_id: editGaId,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id);

      if (updateErr) throw updateErr;

      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update project settings');
    } finally {
      setSaving(false);
    }
  };

  // Stats Card data
  const totalProjects = totalCount;
  const withGaCount = projects.filter(p => p.ga_property_id).length;
  const withUrlCount = projects.filter(p => p.website_url).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SEO Projects Overview
          </h1>
          <p className="text-slate-400 mt-1">Manage SEO projects, setup Google Analytics property IDs, and view report details.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-linear-to-r from-cyan-500 to-indigo-500 text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer print:hidden text-xs"
        >
          <Plus className="w-4 h-4" />
          NEW SEO PROJECT
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="high-tech-card p-6 border-indigo-500/20 bg-linear-to-br from-indigo-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total SEO Projects</p>
          <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">{totalProjects}</h3>
          <p className="text-[10px] text-slate-500 mt-1">All registered client websites</p>
        </div>

        <div className="high-tech-card p-6 border-cyan-500/20 bg-linear-to-br from-cyan-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected GA4</p>
          <h3 className="text-3xl font-extrabold text-cyan-400 mt-3 font-mono">{withGaCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Projects configured with API tracking</p>
        </div>

        <div className="high-tech-card p-6 border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Sites</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">{withUrlCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Projects with active destination URLs</p>
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
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="w-full md:w-64">
          {/* Select2-like Searchable Select for Client Filter */}
          <SearchableSelect 
            options={clients.map(c => ({ id: c.id, name: c.name }))}
            value={filterClientId}
            onChange={(val) => {
              setFilterClientId(val);
              setPage(1);
            }}
            placeholder="Filter by Client (Select2)..."
            emptyMessage="No SEO clients found"
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client & Project</th>
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
                            <div>
                              <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Client: <span className="text-indigo-400 font-semibold">{proj.clients?.name}</span>
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {proj.website_url ? (
                              <a 
                                href={proj.website_url.startsWith('http') ? proj.website_url : `https://${proj.website_url}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                              >
                                {proj.website_url}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {proj.ga_property_id ? (
                              <span className="text-xs text-indigo-400 font-mono font-bold select-all bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                                {proj.ga_property_id}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600 italic">Not set</span>
                            )}
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
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/seo/detail/${proj.id}`}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                                title="View Realtime Traffic Analysis"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => openEditModal(proj)}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
                                title="Edit Project Settings"
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
          </div>

          {/* Pagination Controls */}
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

      {/* Create SEO Project Modal */}
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
              <h3 className="text-lg font-bold text-white">Create New SEO Project</h3>
              <p className="text-xs text-slate-500 mt-1">Initialize a new search engine optimization tracking profile for a client.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Select Client</label>
                {/* Searchable Select component for Client */}
                <SearchableSelect 
                  options={clients.map(c => ({ id: c.id, name: c.name }))}
                  value={newProjClientId}
                  onChange={(val) => setNewProjClientId(val)}
                  placeholder="Search and select client..."
                  emptyMessage="No SEO clients found"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                <input 
                  type="text" 
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. SEO Campaign Q4"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Optional brief description of target goals..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Website URL</label>
                <input 
                  type="text" 
                  value={newProjUrl}
                  onChange={(e) => setNewProjUrl(e.target.value)}
                  placeholder="e.g. www.clientwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GA4 Property ID</label>
                <input 
                  type="text" 
                  value={newProjGaId}
                  onChange={(e) => setNewProjGaId(e.target.value)}
                  placeholder="e.g. 415877840"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateProject}
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              CREATE SEO PROJECT
            </button>
          </div>
        </div>
      )}

      {/* Edit SEO settings modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Configure SEO Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Update website URL and Google Analytics Property ID for this project.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                <input 
                  type="text" 
                  value={editingProject.name}
                  readOnly 
                  className="w-full bg-white/2 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-400 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Website URL</label>
                <input 
                  type="text" 
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="e.g. www.clientwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GA4 Property ID</label>
                <input 
                  type="text" 
                  value={editGaId}
                  onChange={(e) => setEditGaId(e.target.value)}
                  placeholder="e.g. 415877840"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveEdit}
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SAVE CONFIGURATION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
