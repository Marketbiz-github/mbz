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
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Client {
  id: string;
  name: string;
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
  clients?: {
    name: string;
  };
}

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Default to 5 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filterClientId, setFilterClientId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [sender, setSender] = useState('mira@ipaymu.com');
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

  const supabase = createClient();

  // Stable manual refetch (used after create/update/delete)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      if (clientError) throw clientError;
      setClients(clientData || []);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {}),
        ...(filterClientId ? { client_id: filterClientId } : {})
      });
      const response = await fetch(`/api/email-campaigns?${queryParams.toString()}`);
      const result = await response.json();
      if (result.status === 'error') throw new Error(result.message);

      setCampaigns(result.data.campaigns || []);
      setTotalPages(result.data.pagination.totalPages || 1);
      setTotalCount(result.data.pagination.total || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Error fetching data:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filterClientId]);

  // Auto-fetch when filters/page change — fetch logic is inlined to avoid
  // the "setState in effect via callback" lint rule.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');
        if (clientError) throw clientError;
        if (!cancelled) setClients(clientData || []);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {}),
          ...(filterClientId ? { client_id: filterClientId } : {})
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
  // supabase client is stable; only re-run when these values change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filterClientId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterClientChange = (value: string) => {
    setFilterClientId(value);
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setClientId(clients[0]?.id || '');
    setName('');
    setSender('mira@ipaymu.com');
    // Format now to YYYY-MM-DDTHH:mm
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setSentAt(localNow);
    setUtcid(Math.floor(10000000 + Math.random() * 90000000).toString());
    setStatus('completed');
    setRecipients(1000);
    setOpens(100);
    setClicks(10);
    setBounces(5);
    setBlocks(0);
    setReplies(0);
    setUnsubscribes(0);
    setOpensExclApple(90);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setClientId(campaign.client_id);
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = {
        client_id: clientId,
        name,
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
        opens_excl_apple: Number(opensExclApple)
      };

      if (editingCampaign) {
        // Update
        const { error } = await supabase
          .from('email_campaigns')
          .update(payload)
          .eq('id', editingCampaign.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('email_campaigns')
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
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign.';
      alert(message);
    }
  };

  // Aggregated Stats (from current page data — real totals need a dedicated aggregation endpoint)
  const pageEmailsSent = campaigns.reduce((acc, c) => acc + c.recipients, 0);
  const pageOpens = campaigns.reduce((acc, c) => acc + c.opens, 0);
  const pageClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgOpenRate = pageEmailsSent > 0 ? ((pageOpens / pageEmailsSent) * 100).toFixed(1) : '0';
  const avgClickRate = pageEmailsSent > 0 ? ((pageClicks / pageEmailsSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email Platform</h1>
          <p className="text-slate-400 mt-1">Broadcast personalized emails and track engagement.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link 
            href="/crm"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all hover:bg-white/10"
          >
            <Settings2 className="w-4 h-4" />
            MANAGE CLIENTS
          </Link>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="high-tech-card p-6 border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Campaigns</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{totalCount.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">All campaign reports</p>
            </div>
            <div className="high-tech-card p-6 border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Open</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{avgOpenRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">Across all campaigns</p>
            </div>
            <div className="high-tech-card p-6 border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <MousePointer2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Click</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{avgClickRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">Across all campaigns</p>
            </div>
            <div className="high-tech-card p-6 border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sent (Page)</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{pageEmailsSent.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">Emails Sent (This Page)</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
                  <select
                    value={filterClientId}
                    onChange={(e) => handleFilterClientChange(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="">All Clients</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="high-tech-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
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
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                            No email campaign reports found.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((camp) => {
                          const openRate = camp.recipients > 0 ? ((camp.opens / camp.recipients) * 100).toFixed(1) : '0';
                          const clickRate = camp.recipients > 0 ? ((camp.clicks / camp.recipients) * 100).toFixed(1) : '0';
                          const dateString = new Date(camp.sent_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });

                          return (
                            <tr key={camp.id} className="hover:bg-white/2 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Client: <span className="text-indigo-400 font-semibold">{camp.clients?.name || 'Unknown'}</span> • {dateString}
                                  </p>
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
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Select Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  >
                    <option value="" disabled className="bg-slate-900">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Campaign Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Campaign Name / Subject</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pembeli Anda tinggal klik & bayar"
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Sender */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Sender Email</label>
                  <input
                    type="email"
                    required
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="mira@ipaymu.com"
                    className="block w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* UTCID */}
                <div>
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">UTCID (External ID)</label>
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
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Sent Date & Time</label>
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
                  <label className="block text-xs font-medium text-cyan-400 uppercase tracking-widest mb-2">Status</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Total Recipients</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Total Opens</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Total Clicks</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Bounces</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Blocks</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Replies</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Unsubscribes</label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Opens (Excl. Apple)</label>
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
    </div>
  );
}
