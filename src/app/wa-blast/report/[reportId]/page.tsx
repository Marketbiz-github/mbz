'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Save,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import AIInsightCard from '@/components/AIInsightCard';

interface Recipient {
  id: string;
  phone_number: string;
  name: string;
  status: string;
  error_message: string;
  sent_at: string;
  dynamic_data: Record<string, unknown>;
}

interface Report {
  id: string;
  project_id: string;
  campaign_name: string;
  template_name: string;
  status: string;
  total_sent: number;
  delivered: number;
  read: number;
  failed: number;
  created_at: string;
  projects?: {
    name: string;
  };
}

export default function WABlastReportDetail({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = React.use(params);
  const router = useRouter();
  const supabase = createClient();
  const rId = reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Campaign State
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editTemplateName, setEditTemplateName] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Single Recipient Edit State
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  // Bulk Edit Recipient State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);



  const fetchReportInfo = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('wa_blast_reports')
        .select('*, projects(name)')
        .eq('id', rId)
        .single();
        
      if (error) throw error;
      setReport(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [rId, supabase]);

  const fetchRecipients = React.useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('wa_blast_recipients')
        .select('*', { count: 'exact' })
        .eq('report_id', rId)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      setRecipients(data || []);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [rId, supabase, page, limit, search, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReportInfo();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchReportInfo]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecipients();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchRecipients]);

  useEffect(() => {
    if (report?.campaign_name) {
      document.title = `${report.campaign_name} - Report | MarketBiz`;
    }
  }, [report?.campaign_name]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchRecipients();
    }
  };

  const handleSaveCampaign = async () => {
    if (!editCampaignName.trim()) return;
    setSavingCampaign(true);
    try {
      const { error } = await supabase
        .from('wa_blast_reports')
        .update({ campaign_name: editCampaignName, template_name: editTemplateName })
        .eq('id', rId);
      if (error) throw error;
      setReport(prev => prev ? { ...prev, campaign_name: editCampaignName, template_name: editTemplateName } : prev);
      setIsEditingCampaign(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingCampaign(false);
    }
  };


  const handleExportCSV = async () => {
    if (!report) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wa_blast_recipients')
        .select('*')
        .eq('report_id', rId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      const csvContent = [
        ["Name", "Phone Number", "Status", "Error Message", "Sent At"],
        ...data.map(rec => [
          `"${(rec.name || "-").replace(/"/g, '""')}"`,
          `"${rec.phone_number}"`,
          `"${rec.status}"`,
          `"${(rec.error_message || "").replace(/"/g, '""')}"`,
          `"${rec.sent_at ? new Date(rec.sent_at).toLocaleString() : "-"}"`
        ])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `WABlast_Report_${report.campaign_name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to export CSV: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleUpdateStatus = async (recipientId: string, newStatus: string) => {
    try {
      const newSentAt = new Date().toISOString();
      const { error } = await supabase
        .from('wa_blast_recipients')
        .update({ status: newStatus, sent_at: newSentAt })
        .eq('id', recipientId);

      if (error) throw error;

      // Calculate new stats
      const { data: allRecs } = await supabase
        .from('wa_blast_recipients')
        .select('status')
        .eq('report_id', rId);

      if (allRecs) {
        const total_sent = allRecs.length;
        const delivered = allRecs.filter(r => r.status === 'delivered').length;
        const read = allRecs.filter(r => r.status === 'read').length;
        const failed = allRecs.filter(r => r.status === 'failed').length;

        // Sync report stats
        await supabase
          .from('wa_blast_reports')
          .update({ total_sent, delivered, read, failed })
          .eq('id', rId);
      }

      // Update local state
      setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, status: newStatus, sent_at: newSentAt } : r));
      setEditingStatusId(null);
      
      // Recalculate stats for UI
      fetchReportInfo();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to update status: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteRecipient = async (recipientId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kontak ini?')) return;
    try {
      const { error } = await supabase
        .from('wa_blast_recipients')
        .delete()
        .eq('id', recipientId);

      if (error) throw error;

      // Update local state
      setRecipients(prev => prev.filter(r => r.id !== recipientId));

      // Calculate new stats
      const { data: allRecs } = await supabase
        .from('wa_blast_recipients')
        .select('status')
        .eq('report_id', rId);

      if (allRecs) {
        const total_sent = allRecs.length;
        const delivered = allRecs.filter(r => r.status === 'delivered').length;
        const read = allRecs.filter(r => r.status === 'read').length;
        const failed = allRecs.filter(r => r.status === 'failed').length;

        // Sync report stats
        await supabase
          .from('wa_blast_reports')
          .update({ total_sent, delivered, read, failed })
          .eq('id', rId);
      }

      fetchReportInfo();
    } catch (err: unknown) {
      console.error(err);
      alert('Gagal menghapus kontak: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // --- Bulk Edit Recipient Handlers ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (recipients.every(r => selectedIds.has(r.id))) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        recipients.forEach(r => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        recipients.forEach(r => next.add(r.id));
        return next;
      });
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedIds.size === 0 || !bulkStatus) {
      alert('Pilih status terlebih dahulu.');
      return;
    }
    setBulkLoading(true);
    try {
      const idsArray = Array.from(selectedIds);
      const nowIso = new Date().toISOString();

      // 1. Bulk update recipients in Supabase
      const { error } = await supabase
        .from('wa_blast_recipients')
        .update({ 
          status: bulkStatus,
          sent_at: bulkStatus !== 'pending' ? nowIso : null
        })
        .in('id', idsArray);

      if (error) throw error;

      // 2. Recalculate stats for entire report
      const { data: allRecs } = await supabase
        .from('wa_blast_recipients')
        .select('status')
        .eq('report_id', rId);

      if (allRecs) {
        const total_sent = allRecs.length;
        const delivered = allRecs.filter(r => r.status === 'delivered').length;
        const read = allRecs.filter(r => r.status === 'read').length;
        const failed = allRecs.filter(r => r.status === 'failed').length;

        await supabase
          .from('wa_blast_reports')
          .update({ total_sent, delivered, read, failed })
          .eq('id', rId);
      }

      setIsBulkEditOpen(false);
      setSelectedIds(new Set());
      setBulkStatus('');
      fetchReportInfo();
      fetchRecipients();
    } catch (err: unknown) {
      console.error(err);
      alert('Bulk update gagal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => report ? router.push(`/wa-blast/detail/${report.project_id}`) : router.push('/wa-blast')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          {isEditingCampaign ? (
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="text" 
                value={editCampaignName} 
                onChange={e => setEditCampaignName(e.target.value)}
                placeholder="Campaign Name"
                className="bg-slate-900 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
              />
              <input 
                type="text" 
                value={editTemplateName} 
                onChange={e => setEditTemplateName(e.target.value)}
                placeholder="Template ID"
                className="bg-slate-900 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500/50 w-32"
              />
              <button onClick={handleSaveCampaign} disabled={savingCampaign} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                {savingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsEditingCampaign(false)} className="p-1.5 bg-white/10 text-slate-400 rounded-lg hover:bg-white/20 transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {report?.campaign_name || 'Loading Report...'}
              {report && (
                <button 
                  onClick={() => {
                    setEditCampaignName(report.campaign_name);
                    setEditTemplateName(report.template_name || '');
                    setIsEditingCampaign(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer" 
                  title="Edit Campaign"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {report && (
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  report.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                )}>
                  {report.status}
                </span>
              )}
            </h1>
          )}
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            Project: <span className="text-emerald-400 font-semibold">{report?.projects?.name || '...'}</span>
            {report?.template_name && (
              <>
                <span className="text-slate-600">•</span>
                Template: <span className="text-cyan-400 font-mono text-sm">{report.template_name}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="high-tech-card p-5 border-slate-700 bg-slate-900/30">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sent</p>
            <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">{report.total_sent}</h3>
          </div>
          <div className="high-tech-card p-5 border-emerald-500/20 bg-emerald-950/10">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Delivered</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{report.delivered}</h3>
          </div>
          <div className="high-tech-card p-5 border-cyan-500/20 bg-cyan-950/10">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Read</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 mt-2 font-mono">{report.read}</h3>
          </div>
          <div className="high-tech-card p-5 border-red-500/20 bg-red-950/10">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Failed</p>
            <h3 className="text-3xl font-extrabold text-red-400 mt-2 font-mono">{report.failed}</h3>
          </div>
          <div className="high-tech-card p-5 border-indigo-500/20 bg-indigo-950/10">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Success Rate</p>
            <h3 className="text-3xl font-extrabold text-indigo-400 mt-2 font-mono">
              {report.total_sent > 0 ? Math.round(((report.delivered + report.read) / report.total_sent) * 100) : 0}%
            </h3>
          </div>
        </div>
      )}

      {/* AI Insight Card */}
      {report && (
        <AIInsightCard 
          reportType="WhatsApp Blast Campaign" 
          reportData={{
            campaignName: report.campaign_name,
            totalSent: report.total_sent,
            delivered: report.delivered,
            read: report.read,
            failed: report.failed,
            successRate: report.total_sent > 0 ? Math.round(((report.delivered + report.read) / report.total_sent) * 100) + '%' : '0%'
          }} 
        />
      )}

      {/* Toolbar */}
      <div className="high-tech-card p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-900/40">
        <div className="flex gap-3 flex-1 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 min-w-32.5 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Status</option>
            <option value="pending" className="bg-slate-900 text-white">Pending</option>
            <option value="sent" className="bg-slate-900 text-white">Sent</option>
            <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
            <option value="read" className="bg-slate-900 text-white">Read</option>
            <option value="failed" className="bg-slate-900 text-white">Failed</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto print:hidden">
          <button
            onClick={() => report && router.push(`/wa-blast/create/${report.project_id}?reportId=${rId}`)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD RECIPIENT
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            CETAK PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            EXPORT EXCEL
          </button>
        </div>
      </div>


      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4 mx-auto" />
          <h3 className="text-lg font-bold text-white mb-2">Error</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="high-tech-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-200">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-4 py-4 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Pilih semua di halaman ini"
                      >
                        {recipients.length > 0 && recipients.every(r => selectedIds.has(r.id))
                          ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="px-3 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-10">No.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient (No. WA)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dynamic Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No recipient data found.
                      </td>
                    </tr>
                  ) : (
                    recipients.map((rec, index) => {
                      const rowNumber = (page - 1) * limit + index + 1;
                      return (
                        <tr
                          key={rec.id}
                          className={`transition-colors ${
                            selectedIds.has(rec.id)
                              ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500/40'
                              : 'hover:bg-white/2'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleSelect(rec.id)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                              {selectedIds.has(rec.id)
                                ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                                : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-3 py-4 text-xs font-bold text-slate-500">{rowNumber}</td>
                          <td className="px-6 py-4">
                            <h4 className="text-sm font-bold text-white">{rec.name || '-'}</h4>
                            <p className="text-xs text-slate-400 mt-1 font-mono">{rec.phone_number}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(rec.dynamic_data || {}).slice(0, 3).map(([k, v]) => (
                                <span key={k} className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] text-slate-300">
                                  <span className="text-slate-500 capitalize">{k}:</span> {String(v)}
                                </span>
                              ))}
                              {Object.keys(rec.dynamic_data || {}).length > 3 && (
                                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] text-slate-400">...</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 relative">
                            <div className="flex flex-col items-start gap-1">
                              {editingStatusId === rec.id ? (
                                <div className="flex items-center gap-2 bg-slate-900 border border-white/20 p-1.5 rounded-lg shadow-xl z-10">
                                  <select 
                                    className="bg-slate-800 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none"
                                    value={rec.status}
                                    onChange={(e) => handleUpdateStatus(rec.id, e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="sent">Sent</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="read">Read</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                  <button onClick={() => setEditingStatusId(null)} className="text-slate-400 hover:text-white">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setEditingStatusId(rec.id)}
                                  title="Click to manually update status"
                                  className={cn("px-2 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:ring-2 ring-white/20 transition-all group",
                                    rec.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    rec.status === 'read' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                    rec.status === 'sent' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                    rec.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                  )}
                                >
                                  {rec.status === 'delivered' || rec.status === 'read' ? <CheckCircle2 className="w-3 h-3" /> :
                                   rec.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                                   rec.status === 'pending' ? <Clock className="w-3 h-3" /> : null}
                                  {rec.status}
                                  <Edit2 className="w-3 h-3 ml-1" />
                                </button>
                              )}
                              {rec.error_message && (
                                <span className="text-[10px] text-red-400/80 max-w-50 truncate" title={rec.error_message}>
                                  {rec.error_message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            <div className="flex items-center justify-between">
                              <span>{rec.sent_at ? new Date(rec.sent_at).toLocaleString() : '-'}</span>
                              <button 
                                onClick={() => handleDeleteRecipient(rec.id)}
                                title="Hapus kontak ini"
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-950 p-4 border border-white/10 rounded-xl">
              <span className="text-xs text-slate-500 font-bold">
                Showing page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  PREV
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (page <= 3) {
                    pageNum = idx + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer",
                        page === pageNum 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

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

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">{selectedIds.size} penerima terpilih</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={() => { setBulkStatus(''); setIsBulkEditOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Zap className="w-3.5 h-3.5" />
              Bulk Update Status
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
              title="Clear selection"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Edit Recipient Status Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Bulk Update Status Penerima
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Akan diapply ke <span className="text-emerald-400 font-bold">{selectedIds.size} nomor WA</span>
                </p>
              </div>
              <button onClick={() => setIsBulkEditOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Pilih Status Penerima Baru</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'pending', label: '⏳ Pending', color: 'slate' },
                  { value: 'sent', label: '📤 Sent', color: 'indigo' },
                  { value: 'delivered', label: '✅ Delivered', color: 'emerald' },
                  { value: 'read', label: '👀 Read', color: 'cyan' },
                  { value: 'failed', label: '❌ Failed', color: 'red' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBulkStatus(opt.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                      bulkStatus === opt.value
                        ? opt.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : opt.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : opt.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                          : opt.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mt-2">
                <p className="text-[10px] text-amber-300/70 leading-relaxed">
                  ⚠️ Status akan langsung diubah untuk <strong>{selectedIds.size} kontak penerima</strong> dan angka statistik kampanye akan otomatis dihitung ulang.
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
                onClick={handleBulkUpdateStatus}
                disabled={bulkLoading || !bulkStatus}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Apply ke {selectedIds.size} Nomor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
