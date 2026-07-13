'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Search,
  Download,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Recipient {
  id: string;
  phone_number: string;
  name: string;
  status: string;
  error_message: string;
  sent_at: string;
  dynamic_data: any;
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

export default function WABlastReportDetail() {
  const { reportId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const rId = reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchReportInfo();
  }, [rId]);

  useEffect(() => {
    fetchRecipients();
  }, [rId, page, search]);

  const fetchReportInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('wa_blast_reports')
        .select('*, projects(name)')
        .eq('id', rId)
        .single();
        
      if (error) throw error;
      setReport(data);
      document.title = `${data.campaign_name} - Report | MarketBiz`;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchRecipients = async () => {
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

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      setRecipients(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error(err);
      if (!error) setError(err.message); // Only set if report info didn't fail
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchRecipients();
    }
  };

  const handleExportCSV = () => {
    if (!report || recipients.length === 0) return;
    
    // In a real app, you'd fetch all rows, not just the current page.
    // For simplicity, we just trigger an alert here to simulate the action.
    alert('Exporting CSV... In a production app, this would download all records for this report.');
  };

  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error(err);
      alert('Failed to update status: ' + err.message);
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {report?.campaign_name || 'Loading Report...'}
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
          <p className="text-slate-400 mt-1">
            Project: <span className="text-emerald-400 font-semibold">{report?.projects?.name || '...'}</span>
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

      {/* Toolbar */}
      <div className="high-tech-card p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-900/40">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name or number... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            EXPORT CSV
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
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-12">No.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dynamic Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No recipient data found.
                      </td>
                    </tr>
                  ) : (
                    recipients.map((rec, index) => {
                      const rowNumber = (page - 1) * limit + index + 1;
                      return (
                        <tr key={rec.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{rowNumber}</td>
                          <td className="px-6 py-4">
                            <h4 className="text-sm font-bold text-white">{rec.name || '-'}</h4>
                            <p className="text-xs text-slate-400 mt-1 font-mono">{rec.phone_number}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(rec.dynamic_data || {}).slice(0, 3).map(([k, v]: [string, any]) => (
                                <span key={k} className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] text-slate-300">
                                  <span className="text-slate-500 capitalize">{k}:</span> {v}
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
                                  className={cn("px-2 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:ring-2 ring-white/20 transition-all",
                                    rec.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                                    rec.status === 'read' ? 'bg-cyan-500/10 text-cyan-400' :
                                    rec.status === 'sent' ? 'bg-indigo-500/10 text-indigo-400' :
                                    rec.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                    'bg-slate-500/10 text-slate-400'
                                  )}
                                >
                                  {rec.status === 'delivered' || rec.status === 'read' ? <CheckCircle2 className="w-3 h-3" /> :
                                   rec.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                                   rec.status === 'pending' ? <Clock className="w-3 h-3" /> : null}
                                  {rec.status}
                                </button>
                              )}
                              {rec.error_message && (
                                <span className="text-[10px] text-red-400/80 max-w-[200px] truncate" title={rec.error_message}>
                                  {rec.error_message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {rec.sent_at ? new Date(rec.sent_at).toLocaleString() : '-'}
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
    </div>
  );
}
