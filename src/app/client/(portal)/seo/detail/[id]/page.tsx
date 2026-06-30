'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Globe,
  ExternalLink,
  Loader2,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  Play,
  Key,
  ShieldAlert,
  Clipboard,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface Project {
  id: string;
  name: string;
  website_url: string;
  ga_property_id: string;
  clients?: {
    name: string;
  };
}

interface KeywordData {
  keyword: string;
  rank: number;
  clicks: number;
}

interface PageData {
  path: string;
  views: number;
  rate: string;
}

interface GAData {
  isDemo: boolean;
  credsMissing?: boolean;
  propertyMissing?: boolean;
  realtime: {
    activeUsers: number;
    pageViews: number;
  };
  historical: {
    sessions: number;
    pageViews: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
    organicTraffic: number;
    chart: Array<{ date: string; Sessions: number; Users: number }>;
    keywords: KeywordData[];
    topPages: PageData[];
  };
}

export default function SEODetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [gaData, setGaData] = useState<GAData | null>(null);
  const [systemEmail, setSystemEmail] = useState<string>('');
  
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingGA, setLoadingGA] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connection Preview Toggle state
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      if (!id || !user) return;
      setLoadingProject(true);
      setError(null);
      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!clientInfo) {
          throw new Error('Client profile not found');
        }

        const { data, error: fetchErr } = await supabase
          .from('projects')
          .select('*, clients!inner(name)')
          .eq('id', id)
          .eq('client_id', clientInfo.id)
          .single();

        if (fetchErr) throw fetchErr;

        setProject({
          id: data.id,
          name: data.name,
          website_url: data.website_url || '',
          ga_property_id: data.ga_property_id || '',
          clients: data.clients
        });

        // Load Service Account email for tutorial guide
        const { data: settings } = await supabase
          .from('system_settings')
          .select('google_service_account_email')
          .single();
        if (settings?.google_service_account_email) {
          setSystemEmail(settings.google_service_account_email);
        }
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoadingProject(false);
      }
    }
    fetchProject();
  }, [id, user, supabase]);

  useEffect(() => {
    if (!id || loadingProject || !project) return;
    
    const fetchGAData = async () => {
      setLoadingGA(true);
      try {
        const res = await fetch(`/api/seo/ga4?project_id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch GA4 analytics');
        const data = await res.json();
        setGaData(data);
        document.title = `SEO Report: ${project.clients?.name} - ${project.name} | MarketBiz`;
      } catch (err: any) {
        console.error('Error fetching GA4 data:', err);
      } finally {
        setLoadingGA(false);
      }
    };

    fetchGAData();
    const interval = setInterval(fetchGAData, 30000);
    return () => clearInterval(interval);
  }, [id, project, loadingProject]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCopyEmail = () => {
    if (!systemEmail) return;
    navigator.clipboard.writeText(systemEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExcel = () => {
    if (!gaData || !project) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ["Project Name", project.name],
      ["Website URL", project.website_url],
      ["GA4 Property ID", project.ga_property_id || "N/A"],
      ["Realtime Active Users", gaData.realtime.activeUsers],
      ["Organic Sessions (30d)", gaData.historical.sessions],
      ["Page Views (30d)", gaData.historical.pageViews],
      ["Unique Users (30d)", gaData.historical.users],
      ["Organic Traffic Share", gaData.historical.organicTraffic],
      ["Bounce Rate", `${gaData.historical.bounceRate}%`],
      ["Avg Session Duration", `${Math.floor(gaData.historical.avgSessionDuration / 60)}m ${gaData.historical.avgSessionDuration % 60}s`]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SEO_Report_${project.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loadingProject || (loadingGA && !gaData)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Scanning project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="high-tech-card p-8 border-red-500/20 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-white font-mono">Project Not Found</h3>
        <p className="text-sm text-slate-400">
          The requested SEO project could not be found or loaded.
        </p>
        <button 
          onClick={() => router.push('/seo')}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          BACK TO SEO DASHBOARD
        </button>
      </div>
    );
  }

  const isGAConnected = gaData && !gaData.isDemo;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Back Link */}
      <button 
        onClick={() => router.push('/seo')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group cursor-pointer print:hidden animate-in fade-in"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to SEO Dashboard
      </button>

      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              SEO Traffic Report: <span className="text-indigo-400">{project.clients?.name}</span>, {project.name}
            </h1>
            {!isGAConnected && (
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider print:hidden">
                Demo Mode
              </span>
            )}
            {isGAConnected && (
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider print:hidden">
                Connected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            {project.website_url && (
              <a 
                href={project.website_url.startsWith('http') ? project.website_url : `https://${project.website_url}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Globe className="w-3.5 h-3.5" />
                {project.website_url}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {project.ga_property_id && (
              <>
                <span className="text-slate-700">•</span>
                <span>GA4 Property ID: <span className="font-mono text-indigo-400">{project.ga_property_id}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        {(isGAConnected || showDemoPreview) && (
          <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5 backdrop-blur-xl print:hidden animate-in fade-in">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> PDF Report
            </button>
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-extrabold text-black transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        )}
      </div>

      {/* RENDER CONNECTION TUTORIAL IF NOT CONNECTED & NOT CLICKED PREVIEW */}
      {!isGAConnected && !showDemoPreview ? (
        <div className="flex flex-col items-center justify-center p-12 border border-white/5 bg-white/[0.02] rounded-2xl animate-in fade-in">
          <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Tracking API Belum Terkoneksi</h3>
          <p className="text-slate-400 text-sm max-w-md text-center mb-6">
            Laporan analitik Google Analytics untuk situs ini sedang dalam proses integrasi oleh tim kami. Silakan cek kembali nanti atau hubungi support.
          </p>
          <button
            onClick={() => setShowDemoPreview(true)}
            className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3 h-3 text-cyan-400" /> Lihat Mode Demo Sementara
          </button>
        </div>
      ) : (
        /* RENDER LIVE / DEMO REPORT DASHBOARD DATA */
        loadingGA ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-xs text-slate-500">Mengambil data statistik traffic GA4...</p>
          </div>
        ) : gaData ? (
          <div className="space-y-8 animate-in fade-in">
            {/* Warning banner if credentials are not configured in system settings */}
            {gaData.isDemo && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center print:hidden">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-amber-300">Menampilkan pratinjau Mode Demo simulasi.</p>
                    <p>
                      {gaData.credsMissing && "Kredensial Google Service Account belum dikonfigurasi di Pengaturan Sistem. "}
                      {gaData.propertyMissing && "Proyek ini belum dikonfigurasi dengan ID Properti GA4. "}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoPreview(false)}
                  className="px-4 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
                >
                  LIHAT PANDUAN KONEKSI
                </button>
              </div>
            )}

            {/* Section 1: Real GA Data */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                <span className="w-1.5 h-3 bg-cyan-400 rounded-xs"></span>
                Data Riil Google Analytics 4 (SEO)
              </div>
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Penjelasan Metrik
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              
              {/* Realtime Active Users */}
              <div className="high-tech-card p-5 border-cyan-500/20 bg-linear-to-br from-cyan-500/5 to-transparent flex flex-col justify-between min-h-[110px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Users</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">
                  {gaData.realtime.activeUsers}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Right now (last 30m)</p>
              </div>

              {/* Organic Traffic */}
              <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organic Sessions</span>
                <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">
                  {gaData.historical.sessions.toLocaleString()}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Last 30 days total</p>
              </div>

              {/* Total Page Views */}
              <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page Views</span>
                <h3 className="text-3xl font-extrabold text-indigo-400 mt-3 font-mono">
                  {gaData.historical.pageViews.toLocaleString()}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Total page view logs</p>
              </div>

              {/* Unique Users */}
              <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Users</span>
                <h3 className="text-3xl font-extrabold text-white mt-3 font-mono">
                  {gaData.historical.users.toLocaleString()}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Unique organic visitors</p>
              </div>

              {/* Bounce Rate */}
              <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bounce Rate</span>
                <h3 className="text-3xl font-extrabold text-amber-500 mt-3 font-mono">
                  {gaData.historical.bounceRate}%
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Average bounce index</p>
              </div>

              {/* Avg Session Duration */}
              <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Duration</span>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-3 font-mono">
                  {formatDuration(gaData.historical.avgSessionDuration)}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1">Average user visit length</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Traffic Trend (Organic Search)</h4>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Sessions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Users
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gaData.historical.chart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F2EA" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00F2EA" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff', fontSize: 11 }}
                        cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="Sessions" stroke="#00F2EA" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                      <Area type="monotone" dataKey="Users" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Keyword Performance Table */}
              <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Organic Keywords</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-mono">
                    Estimasi Sistem
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-500 border-b border-white/10 uppercase tracking-wider font-bold">
                        <th className="pb-3">Keyword</th>
                        <th className="pb-3 text-center">Rank</th>
                        <th className="pb-3 text-right">Click Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gaData.historical.keywords.map((kw, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 text-slate-300 font-medium">{kw.keyword}</td>
                          <td className="py-3 text-center font-bold text-cyan-400 font-mono">#{kw.rank}</td>
                          <td className="py-3 text-right font-mono text-slate-400">{kw.clicks} clicks</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Pages Section */}
            <div className="high-tech-card p-6 border-white/5 bg-slate-900/20">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Performing Pages</h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-mono">
                  Estimasi Sistem
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] text-slate-500 border-b border-white/10 uppercase tracking-wider font-bold">
                      <th className="pb-3">Page Path</th>
                      <th className="pb-3 text-center">Page Views</th>
                      <th className="pb-3 text-right">Exit Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gaData.historical.topPages.map((page, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 text-slate-300 font-mono font-medium">{page.path}</td>
                        <td className="py-4 text-center text-white font-bold font-mono">{page.views.toLocaleString()}</td>
                        <td className="py-4 text-right text-slate-400 font-mono">{page.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-cyan-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Penjelasan Metrik Dashboard SEO
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
                <p className="font-bold text-cyan-400">1. Active Users (Realtime)</p>
                <p className="text-slate-400">Jumlah pengunjung unik yang sedang aktif membuka halaman website Anda saat ini (dalam jendela waktu 30 menit terakhir). Data ini diambil langsung dari Google Analytics secara real-time.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">2. Organic Sessions</p>
                <p className="text-slate-400">Total sesi kunjungan yang diawali dari hasil pencarian organik/alami di search engine (seperti Google Search, Bing) dalam 30 hari terakhir. Jika nilainya 0 sedangkan Active Users ada, itu berarti kunjungan yang masuk saat ini berasal dari sumber non-organik (seperti mengetik langsung URL website, iklan berbayar, atau rujukan link sosial media).</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">3. Page Views</p>
                <p className="text-slate-400">Total akumulasi halaman di website Anda yang dibuka/dilihat oleh pengunjung organik selama 30 hari terakhir.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">4. Unique Users</p>
                <p className="text-slate-400">Jumlah individu/pengunjung unik yang berkunjung ke website melalui pencarian organik dalam 30 hari terakhir (satu pengunjung yang membuka berkali-kali hanya dihitung satu kali).</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">5. Bounce Rate (Rasio Pantulan)</p>
                <p className="text-slate-400">Persentase pengunjung organik yang langsung meninggalkan website setelah hanya membuka satu halaman saja tanpa melakukan interaksi lebih lanjut (seperti mengklik tombol atau berpindah halaman). Rasio yang lebih rendah menunjukkan retensi/keterlibatan yang lebih baik.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">6. Session Duration</p>
                <p className="text-slate-400">Rata-rata durasi waktu yang dihabiskan oleh pengunjung organik di website Anda dalam satu kali kunjungan.</p>
              </div>

              <div className="border-t border-white/5 pt-4 mt-2">
                <p className="font-bold text-indigo-400">📊 Rumus Hasil Analisis & Estimasi Sistem</p>
                <p className="text-slate-400 mt-1">Metrik dengan lencana <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">Estimasi Sistem</span> dihitung menggunakan formula proyeksi berikut dari data dasar Google Analytics:</p>
                
                <div className="space-y-3 mt-3 pl-2">
                  <div>
                    <p className="font-semibold text-slate-200">• Estimasi Klik Kata Kunci (Keyword Click Share)</p>
                    <p className="text-slate-400">Dihitung berdasarkan proyeksi CTR (Click-Through Rate) standar industri terhadap posisi peringkat kata kunci Anda.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">• Estimasi Kunjungan Halaman (Top Performing Pages)</p>
                    <p className="text-slate-400">Didistribusikan dari total Page Views riil GA4 dengan rasio kontribusi halaman bawaan:</p>
                    <ul className="list-disc pl-4 mt-1 text-slate-400 space-y-0.5">
                      <li>Halaman Utama (<code>/</code>): 50% dari total Page Views asli</li>
                      <li>Halaman Layanan (<code>/services</code>): 30% dari total Page Views asli</li>
                      <li>Halaman Tentang Kami (<code>/about</code>): 15% dari total Page Views asli</li>
                      <li>Halaman Kontak (<code>/contact</code>): 5% dari total Page Views asli</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
