'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  BarChart,
  MessageSquare,
  Search,
  Loader2,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

interface Report {
  id: string;
  campaign_name: string;
  template_name: string;
  status: string;
  total_sent: number;
  delivered: number;
  read: number;
  failed: number;
  created_at: string;
}

export default function ClientWABlastProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const projectId = id as string;

  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function init() {
      if (!user) return;
      
      // Get client ID of logged in user
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_id', user.id)
        .single();
        
      if (clientInfo) {
        fetchData(clientInfo.id);
      } else {
        setError("User is not associated with any client profile.");
        setLoading(false);
      }
    }
    
    init();
  }, [projectId, user]);

  const fetchData = async (clientId: string) => {
    setLoading(true);
    try {
      // Get Project Info and verify it belongs to this client
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('id', projectId)
        .eq('client_id', clientId)
        .single();
        
      if (projErr) throw projErr;
      if (!projData) throw new Error("Project not found or access denied.");
      
      setProject(projData);
      document.title = `${projData.name} - WA Blast | Client Portal`;

      // Get Reports
      const { data: reportsData, error: repErr } = await supabase
        .from('wa_blast_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (repErr) throw repErr;
      setReports(reportsData || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.campaign_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/client/wa-blast')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {project?.name || 'Loading Project...'}
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            Campaigns Overview
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="high-tech-card p-6 border-red-500/20 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4 mx-auto" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Project</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="high-tech-card p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
          <p className="text-slate-400 max-w-md">Your project doesn't have any WhatsApp blast campaigns yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="high-tech-card bg-slate-900/40 p-0 overflow-hidden flex flex-col border border-white/5 hover:border-emerald-500/30 transition-all group">
              <div className="p-5 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {report.campaign_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(report.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                  report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  report.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                  report.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-500/10 text-slate-400'
                )}>
                  {report.status}
                </span>
              </div>
              
              <div className="p-5 grid grid-cols-2 gap-4 flex-1 bg-black/20">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Sent</p>
                  <p className="text-2xl font-bold text-white font-mono">{report.total_sent}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Delivered</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{report.delivered}</p>
                </div>
                <div>
                  <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Read</p>
                  <p className="text-2xl font-bold text-cyan-400 font-mono">{report.read}</p>
                </div>
                <div>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-400 font-mono">{report.failed}</p>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-slate-900/60">
                <Link 
                  href={`/client/wa-blast/report/${report.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <BarChart className="w-4 h-4" />
                  VIEW FULL REPORT
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
