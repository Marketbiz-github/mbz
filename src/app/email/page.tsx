'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  BarChart3, 
  Plus, 
  Eye,
  MousePointer2,
  Trash2,
  Settings2,
  Loader2,
  X,
  Edit2,
  AlertTriangle,
  HelpCircle,
  Database,
  Tag,
  Layers,
  CheckSquare,
  Square,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Client {
  id: string;
  name: string;
}

interface EmailProgram {
  id: string;
  name: string;
  project_id?: string;
}

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
  program_id: string | null;
  database_type: string | null;
  audience_category: string | null;
  program?: { id: string; name: string } | null;
  clients?: {
    name: string;
  };
}

interface SearchableSelectProps {
  options: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function SearchableSelect({ options, value, onChange, placeholder = "-- Select --", emptyMessage = "No matches found", className = "" }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

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

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalSent: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalBounces: 0
  });

  useEffect(() => {
    document.title = "Email Blast Platform | MarketBiz";
  }, []);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Default to 5 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [dateRange, setDateRange] = useState('30daysAgo');

  // Classification Filter States
  const [filterDbType, setFilterDbType] = useState('');
  const [filterAudience, setFilterAudience] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Bulk Edit State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkDbType, setBulkDbType] = useState('');
  const [bulkAudience, setBulkAudience] = useState('');
  const [bulkProgramId, setBulkProgramId] = useState('');
  const [bulkPrograms, setBulkPrograms] = useState<EmailProgram[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [sender, setSender] = useState('');
  const [sentAt, setSentAt] = useState('');
  const [utcid, setUtcid] = useState('');
  const [status, setStatus] = useState('completed');
  const [recipients, setRecipients] = useState(0);
  const [opens, setOpens] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [bounces, setBounces] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [replies, setReplies] = useState(0);
  const [unsubscribes, setUnsubscribes] = useState(0);
  const [opensExclApple, setOpensExclApple] = useState(0);

  // Classification Form State
  const [programId, setProgramId] = useState('');
  const [programs, setPrograms] = useState<EmailProgram[]>([]);
  const [newProgramName, setNewProgramName] = useState('');
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [databaseType, setDatabaseType] = useState('');
  const [audienceCategory, setAudienceCategory] = useState('');

  const supabase = createClient();

  // Stable manual refetch (used after create/update/delete)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load clients yang punya service Email Blast, fallback ke semua client jika kosong
      const { data: clientDataFiltered } = await supabase
        .from('clients')
        .select('id, name, client_services!inner(service_id, services!inner(name))')
        .eq('client_services.services.name', 'Email Blast')
        .order('name');
      if (clientDataFiltered && clientDataFiltered.length > 0) {
        setClients(clientDataFiltered);
      } else {
        // Fallback: load semua client
        const { data: allClientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');
        if (clientError) throw clientError;
        setClients(allClientData || []);
      }

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, client_id, services(name)');
      if (projectError) throw projectError;
      const emailProjects = (projectData || []).filter((p: any) => p.services?.name === 'Email Blast');
      setAllProjects(emailProjects);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {}),
        ...(filterClientId ? { client_id: filterClientId } : {}),
        ...(dateRange ? { range: dateRange } : {}),
        ...(filterDbType ? { database_type: filterDbType } : {}),
        ...(filterAudience ? { audience_category: filterAudience } : {})
      });
      const response = await fetch(`/api/email-campaigns?${queryParams.toString()}`);
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);

      setCampaigns(result.data.campaigns || []);
      setTotalPages(result.data.pagination.totalPages || 1);
      setTotalCount(result.data.pagination.total || 0);
      if (result.data.aggregates) {
        setGlobalStats(result.data.aggregates);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Error fetching data:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filterClientId, dateRange, filterDbType, filterAudience]);

  // Auto-fetch when filters/page change — fetch logic is inlined to avoid
  // the "setState in effect via callback" lint rule.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load clients yang punya service Email Blast, fallback ke semua client jika kosong
        const { data: clientDataFiltered } = await supabase
          .from('clients')
          .select('id, name, client_services!inner(service_id, services!inner(name))')
          .eq('client_services.services.name', 'Email Blast')
          .order('name');
        if (!cancelled) {
          if (clientDataFiltered && clientDataFiltered.length > 0) {
            setClients(clientDataFiltered);
          } else {
            const { data: allClientData } = await supabase
              .from('clients')
              .select('id, name')
              .order('name');
            if (!cancelled) setClients(allClientData || []);
          }
        }

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name, client_id, services(name)');
        if (projectError) throw projectError;
        const emailProjects = (projectData || []).filter((p: any) => p.services?.name === 'Email Blast');
        if (!cancelled) setAllProjects(emailProjects);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {}),
          ...(filterClientId ? { client_id: filterClientId } : {}),
          ...(dateRange ? { range: dateRange } : {}),
          ...(filterDbType ? { database_type: filterDbType } : {}),
          ...(filterAudience ? { audience_category: filterAudience } : {})
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
  // supabase client is stable; only re-run when these values change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filterClientId, dateRange, filterDbType, filterAudience]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterClientChange = (value: string) => {
    setFilterClientId(value);
    setPage(1);
  };

  const handleFormClientChange = (val: string) => {
    setClientId(val);
    const clientProjects = allProjects.filter(p => p.client_id === val);
    const firstProject = clientProjects[0]?.id || '';
    setProjectId(firstProject);
    setProgramId('');
    setPrograms([]);
    if (firstProject) fetchPrograms(firstProject);
  };

  const fetchPrograms = async (projId: string) => {
    const { data } = await supabase
      .from('email_programs')
      .select('id, name, project_id')
      .eq('project_id', projId)
      .order('name');
    setPrograms(data || []);
  };

  const handleFormProjectChange = (val: string) => {
    setProjectId(val);
    setProgramId('');
    if (val) fetchPrograms(val);
    else setPrograms([]);
  };

  const handleCreateProgram = async () => {
    if (!newProgramName.trim() || !projectId) return;
    setIsCreatingProgram(true);
    try {
      const { data, error } = await supabase
        .from('email_programs')
        .insert([{ project_id: projectId, name: newProgramName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setPrograms(prev => [...prev, data]);
      setProgramId(data.id);
      setNewProgramName('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat program');
    } finally {
      setIsCreatingProgram(false);
    }
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    const defaultClient = clients[0]?.id || '';
    setClientId(defaultClient);
    
    // Find projects for the first client
    const clientProjects = allProjects.filter(p => p.client_id === defaultClient);
    setProjectId(clientProjects[0]?.id || '');

    setName('');
    setSender('');
    setSentAt('');
    setUtcid('');
    setStatus('completed');
    setRecipients(0);
    setOpens(0);
    setClicks(0);
    setBounces(0);
    setBlocks(0);
    setReplies(0);
    setUnsubscribes(0);
    setOpensExclApple(0);
    setProgramId('');
    setDatabaseType('');
    setAudienceCategory('');
    setNewProgramName('');
    setPrograms([]);
    if (clientProjects[0]?.id) fetchPrograms(clientProjects[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: EmailCampaign & { project_id?: string }) => {
    setEditingCampaign(campaign);
    setClientId(campaign.client_id);
    setProjectId(campaign.project_id || '');
    setName(campaign.name);
    setSender(campaign.sender);
    // Format sent_at timestamp to YYYY-MM-DDTHH:mm
    const date = new Date(campaign.sent_at);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setSentAt(localDate);
    setUtcid(campaign.utcid || '');
    setStatus(campaign.status);
    setRecipients(campaign.recipients);
    setOpens(campaign.opens);
    setClicks(campaign.clicks);
    setBounces(campaign.bounces);
    setBlocks(campaign.blocks);
    setReplies(campaign.replies);
    setUnsubscribes(campaign.unsubscribes);
    setOpensExclApple(campaign.opens_excl_apple);
    setProgramId(campaign.program_id || '');
    setDatabaseType(campaign.database_type || '');
    setAudienceCategory(campaign.audience_category || '');
    setNewProgramName('');
    if (campaign.project_id) fetchPrograms(campaign.project_id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      alert('Please select or create a project for this client first.');
      return;
    }
    setModalLoading(true);
    try {
      const payload: Record<string, unknown> = {
        project_id: projectId,
        campaign_name: name,
        sender,
        sent_at: new Date(sentAt).toISOString(),
        utcid,
        status,
        recipients: Number(recipients),
        opens: Number(opens),
        clicks: Number(clicks),
        bounces: Number(bounces),
        blocks: Number(blocks),
        replies: Number(replies),
        unsubscribes: Number(unsubscribes),
        opens_excl_apple: Number(opensExclApple),
        program_id: programId || null,
        database_type: databaseType || null,
        audience_category: databaseType === 'internal' ? (audienceCategory || null) : null
      };

      if (editingCampaign) {
        // Update
        const { error } = await supabase
          .from('email_blast_reports')
          .update(payload)
          .eq('id', editingCampaign.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('email_blast_reports')
          .insert([payload]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong saving the campaign.';
      alert(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign report?')) return;
    try {
      const { error } = await supabase
        .from('email_blast_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign.';
      alert(message);
    }
  };

  // --- Bulk Edit ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (campaigns.every(c => selectedIds.has(c.id))) {
      // deselect semua di halaman ini
      setSelectedIds(prev => {
        const next = new Set(prev);
        campaigns.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        campaigns.forEach(c => next.add(c.id));
        return next;
      });
    }
  };

  const openBulkEdit = async () => {
    setBulkDbType('');
    setBulkAudience('');
    setBulkProgramId('');
    // Load semua program untuk pilihan
    const { data } = await supabase
      .from('email_programs')
      .select('id, name, project_id')
      .order('name');
    setBulkPrograms(data || []);
    setIsBulkEditOpen(true);
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (bulkDbType !== '__skip__') {
        payload.database_type = bulkDbType || null;
        payload.audience_category = bulkDbType === 'internal' ? (bulkAudience || null) : null;
      }
      if (bulkProgramId !== '__skip__') {
        payload.program_id = bulkProgramId || null;
      }
      if (Object.keys(payload).length === 0) {
        alert('Pilih minimal satu field yang ingin diubah.');
        return;
      }
      const { error } = await supabase
        .from('email_blast_reports')
        .update(payload)
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      setIsBulkEditOpen(false);
      setSelectedIds(new Set());
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bulk update gagal.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Aggregated Stats (Global totals across all campaigns retrieved from API)
  const totalSent = globalStats.totalSent;
  const avgOpenRate = totalSent > 0 ? ((globalStats.totalOpens / totalSent) * 100).toFixed(1) : '0.0';
  const avgClickRate = totalSent > 0 ? ((globalStats.totalClicks / totalSent) * 100).toFixed(1) : '0.0';
  const avgBounceRate = totalSent > 0 ? ((globalStats.totalBounces / totalSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email Blast</h1>
          <p className="text-slate-400 mt-1">Broadcast personalized emails and track engagement.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={openCreateModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            NEW REPORT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading campaign reports...</p>
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Campaigns</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">RETRY</button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 mt-2 gap-4">
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
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{totalCount.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">All campaign reports</p>
            </div>

            {/* Avg Open Rate */}
            <div className="high-tech-card p-5 border-emerald-500/20 bg-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Open</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">{globalStats.totalOpens.toLocaleString()}</h3>
                <span className="text-xs font-bold text-emerald-400">({avgOpenRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Across all campaigns</p>
            </div>

            {/* Avg Click Rate */}
            <div className="high-tech-card p-5 border-cyan-500/20 bg-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <MousePointer2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Click</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">{globalStats.totalClicks.toLocaleString()}</h3>
                <span className="text-xs font-bold text-cyan-400">({avgClickRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Across all campaigns</p>
            </div>

            {/* Total Emails Sent */}
            <div className="high-tech-card p-5 border-purple-500/20 bg-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sent</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">{totalSent.toLocaleString()}</h3>
                <span className="text-xs font-bold text-purple-400">(100%)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Emails Sent (Global)</p>
            </div>

            {/* Avg Bounce Rate */}
            <div className="high-tech-card p-5 border-amber-500/20 bg-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Bounce</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">{globalStats.totalBounces.toLocaleString()}</h3>
                <span className="text-xs font-bold text-amber-400">({avgBounceRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Average bounce index</p>
            </div>
          </div>

          {/* Classification Tab Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/60 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => { setFilterDbType(''); setFilterAudience(''); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterDbType === '' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => { setFilterDbType('internal'); setFilterAudience(''); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterDbType === 'internal' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Internal
              </button>
              <button
                onClick={() => { setFilterDbType('external'); setFilterAudience(''); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterDbType === 'external' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Eksternal
              </button>
            </div>

            {/* Sub-filter: Dorman / Non-Dorman (only when Internal is active) */}
            {filterDbType === 'internal' && (
              <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Audiens:</span>
                <button
                  onClick={() => { setFilterAudience(''); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    filterAudience === '' 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => { setFilterAudience('dorman'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterAudience === 'dorman' 
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  💤 Dorman
                </button>
                <button
                  onClick={() => { setFilterAudience('non_dorman'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterAudience === 'non_dorman' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ✅ Non-Dorman
                </button>
              </div>
            )}
          </div>

          {/* Table Area */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative z-20">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Email Campaign Reports ({totalCount})
                </h3>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search campaign name..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  {/* Client Filter */}
                  <SearchableSelect
                    options={[{ id: "", name: "All Clients" }, ...clients]}
                    value={filterClientId}
                    onChange={(val) => handleFilterClientChange(val)}
                    placeholder="All Clients"
                    className="w-full sm:w-48"
                  />
                </div>
              </div>

              <div className="high-tech-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 py-4 w-10">
                          <button
                            onClick={toggleSelectAll}
                            className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Pilih semua di halaman ini"
                          >
                            {campaigns.length > 0 && campaigns.every(c => selectedIds.has(c.id))
                              ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                              : <Square className="w-4 h-4" />}
                          </button>
                        </th>
                        <th className="px-3 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-10">No.</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client & Campaign</th>
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
                            No email campaign reports found.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((camp, index) => {
                          const rowNumber = (page - 1) * limit + index + 1;
                          const openRate = camp.recipients > 0 ? ((camp.opens / camp.recipients) * 100).toFixed(1) : '0';
                          const clickRate = camp.recipients > 0 ? ((camp.clicks / camp.recipients) * 100).toFixed(1) : '0';
                          const dateString = new Date(camp.sent_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });

                          return (
                            <tr
                              key={camp.id}
                              className={`transition-colors ${
                                selectedIds.has(camp.id)
                                  ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500/50'
                                  : 'hover:bg-white/2'
                              }`}
                            >
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => toggleSelect(camp.id)}
                                  className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                                >
                                  {selectedIds.has(camp.id)
                                    ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                                    : <Square className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="px-3 py-4 text-xs font-bold text-slate-500">{rowNumber}</td>
                              <td className="px-6 py-4">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Client: <span className="text-indigo-400 font-semibold">{camp.clients?.name || 'Unknown'}</span> • {dateString}
                                  </p>
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
                                    <p className="text-sm font-bold text-emerald-400">{camp.opens} ({openRate}%)</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Clicks</p>
                                    <p className="text-sm font-bold text-cyan-400">{camp.clicks} ({clickRate}%)</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Bounces</p>
                                    <p className="text-sm font-bold text-amber-400">{camp.bounces} ({(camp.recipients > 0 ? ((camp.bounces / camp.recipients) * 100) : 0).toFixed(1)}%)</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                  camp.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  camp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  'bg-slate-500/10 text-slate-400 border border-white/10'
                                }`}>
                                  {camp.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link 
                                    href={`/email/detail/${camp.id}`}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                                    title="View Campaign Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button 
                                    onClick={() => openEditModal(camp)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(camp.id)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                {/* Bulk hint info bar */}
                {campaigns.length > 0 && selectedIds.size === 0 && (
                  <div className="px-5 py-2.5 bg-white/2 border-t border-white/5 flex items-center gap-2">
                    <CheckSquare className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] text-slate-600">Centang baris untuk bulk edit klasifikasi sekaligus</span>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/1">
                    <span className="text-xs text-slate-400">
                      Showing Page {page} of {totalPages} ({totalCount} campaigns)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white">
                {editingCampaign ? 'Edit Email Campaign Report' : 'New Email Campaign Report'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client selection */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Select Client <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    options={clients}
                    value={clientId}
                    onChange={(val) => handleFormClientChange(val)}
                    placeholder="-- Choose Client --"
                  />
                </div>

                {/* Project selection */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Select Project <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    options={allProjects.filter(p => p.client_id === clientId)}
                    value={projectId}
                    onChange={(val) => handleFormProjectChange(val)}
                    placeholder="-- Choose Project --"
                  />
                  {allProjects.filter(p => p.client_id === clientId).length === 0 && clientId && (
                    <p className="text-xs text-amber-400 mt-1">This client has no active projects with the &quot;Email Blast&quot; service.</p>
                  )}
                </div>

                {/* Program & Classification Section */}
                {clientId && (
                  <>
                    {/* Program Selection */}
                    <div className="md:col-span-2 bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 space-y-3">
                      <label className="block text-xs font-medium text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Program
                      </label>
                      {programs.length > 0 ? (
                        <SearchableSelect
                          options={[{ id: '', name: '-- Tanpa Program --' }, ...programs]}
                          value={programId}
                          onChange={(val) => setProgramId(val)}
                          placeholder="-- Pilih Program --"
                        />
                      ) : (
                        <p className="text-xs text-slate-500">
                          {projectId ? 'Belum ada program. Buat program baru di bawah.' : 'Pilih Project dulu untuk melihat dan membuat program.'}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newProgramName}
                          onChange={(e) => setNewProgramName(e.target.value)}
                          placeholder={projectId ? "Nama program baru (cth: iPaymu.link)" : "Pilih project dulu..."}
                          disabled={!projectId}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={handleCreateProgram}
                          disabled={isCreatingProgram || !newProgramName.trim() || !projectId}
                          className="px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          {isCreatingProgram ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Buat
                        </button>
                      </div>
                    </div>

                    {/* Database Type & Audience Classification */}
                    <div className="md:col-span-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                      <label className="block text-xs font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        Sumber Database
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setDatabaseType(''); setAudienceCategory(''); }}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            databaseType === '' 
                              ? 'bg-white/10 text-white border border-white/20' 
                              : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                          }`}
                        >
                          Belum Dipilih
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDatabaseType('internal'); setAudienceCategory(''); }}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            databaseType === 'internal' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                          }`}
                        >
                          🏢 Internal
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDatabaseType('external'); setAudienceCategory(''); }}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            databaseType === 'external' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                          }`}
                        >
                          🌐 Eksternal
                        </button>
                      </div>

                      {/* Audience Category (only for Internal) */}
                      {databaseType === 'internal' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Audiens</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAudienceCategory('dorman')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                audienceCategory === 'dorman' 
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                              }`}
                            >
                              💤 Dorman
                            </button>
                            <button
                              type="button"
                              onClick={() => setAudienceCategory('non_dorman')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                audienceCategory === 'non_dorman' 
                                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                              }`}
                            >
                              ✅ Non-Dorman (Aktif)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Campaign Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Campaign Name / Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pembeli Anda tinggal klik &amp; bayar"
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>
                
                {/* Sender */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Sender Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="noreply@ipaymu.com"
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* UTCID */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    UTCID (External ID) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utcid}
                    onChange={(e) => setUtcid(e.target.value)}
                    placeholder="e.g. 51687784"
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Sent At */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Sent Date & Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={sentAt}
                    onChange={(e) => setSentAt(e.target.value)}
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  >
                    <option value="completed" className="bg-slate-900">Completed (Done sending)</option>
                    <option value="active" className="bg-slate-900">Active (Sending)</option>
                    <option value="planned" className="bg-slate-900">Planned (Draft)</option>
                    <option value="paused" className="bg-slate-900">Paused</option>
                  </select>
                </div>
              </div>

              {/* Data Metrik / Angka Pokok */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Campaign Metrics (Raw Numbers)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Recipients */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Total Recipients <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={recipients}
                      onChange={(e) => setRecipients(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Opens */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Total Opens <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={opens}
                      onChange={(e) => setOpens(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Clicks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Total Clicks <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={clicks}
                      onChange={(e) => setClicks(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Bounces */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Bounces <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={bounces}
                      onChange={(e) => setBounces(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Blocks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Blocks <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={blocks}
                      onChange={(e) => setBlocks(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Replies */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Replies <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={replies}
                      onChange={(e) => setReplies(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Unsubscribes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Unsubscribes <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={unsubscribes}
                      onChange={(e) => setUnsubscribes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>

                  {/* Opens Excl Apple */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Opens (Excl. Apple) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={opensExclApple}
                      onChange={(e) => setOpensExclApple(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 flex justify-end gap-3 bg-white/5 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAVE REPORT'}
                </button>
              </div>
            </form>
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
                <p className="text-slate-400">Jumlah total seluruh kampanye/blast email yang telah dikirimkan untuk klien yang terpilih.</p>
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
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-black/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">{selectedIds.size} campaign terpilih</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={openBulkEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              <Zap className="w-3.5 h-3.5" />
              Bulk Edit
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  Bulk Edit Klasifikasi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Akan diapply ke <span className="text-indigo-400 font-bold">{selectedIds.size} campaign</span>
                </p>
              </div>
              <button onClick={() => setIsBulkEditOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Sumber Database */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Sumber Database
                  </label>
                  <button
                    onClick={() => setBulkDbType('__skip__')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      bulkDbType === '__skip__'
                        ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    Lewati field ini
                  </button>
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${bulkDbType === '__skip__' ? 'opacity-30 pointer-events-none' : ''}`}>
                  <button type="button" onClick={() => { setBulkDbType(''); setBulkAudience(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bulkDbType === '' ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                    }`}>
                    Belum Dipilih
                  </button>
                  <button type="button" onClick={() => { setBulkDbType('internal'); setBulkAudience(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      bulkDbType === 'internal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                    }`}>
                    🏢 Internal
                  </button>
                  <button type="button" onClick={() => { setBulkDbType('external'); setBulkAudience(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      bulkDbType === 'external' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                    }`}>
                    🌐 Eksternal
                  </button>
                </div>
                {bulkDbType === 'internal' && (
                  <div className="animate-in slide-in-from-top-2 duration-200 space-y-2 pl-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Audiens</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setBulkAudience('')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bulkAudience === '' ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                        }`}>Semua / Tidak Set</button>
                      <button type="button" onClick={() => setBulkAudience('dorman')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bulkAudience === 'dorman' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                        }`}>💤 Dorman</button>
                      <button type="button" onClick={() => setBulkAudience('non_dorman')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bulkAudience === 'non_dorman' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                        }`}>✅ Non-Dorman</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Program */}
              <div className="space-y-3 border-t border-white/5 pt-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Program
                  </label>
                  <button
                    onClick={() => setBulkProgramId('__skip__')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      bulkProgramId === '__skip__'
                        ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    Lewati field ini
                  </button>
                </div>
                <div className={`transition-opacity ${bulkProgramId === '__skip__' ? 'opacity-30 pointer-events-none' : ''}`}>
                  <SearchableSelect
                    options={[{ id: '', name: '-- Hapus Program (set null) --' }, ...bulkPrograms]}
                    value={bulkProgramId === '__skip__' ? '' : bulkProgramId}
                    onChange={(val) => setBulkProgramId(val)}
                    placeholder="-- Pilih Program --"
                    emptyMessage="Belum ada program di sistem"
                  />
                </div>
              </div>

              {/* Info box */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                <p className="text-[10px] text-amber-300/70 leading-relaxed">
                  ⚠️ Perubahan akan langsung disimpan ke database untuk semua <strong>{selectedIds.size} campaign</strong> yang dipilih. Gunakan &quot;Lewati field ini&quot; untuk field yang tidak ingin diubah.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/2">
              <button
                type="button"
                onClick={() => setIsBulkEditOpen(false)}
                className="px-5 py-2.5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm font-bold cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkUpdate}
                disabled={bulkLoading}
                className="px-6 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Apply ke {selectedIds.size} Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
