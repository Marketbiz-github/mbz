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
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  Copy,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import AIInsightCard from '@/components/AIInsightCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const COLORS = ['#00F2EA', '#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

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
  url?: string;
  rank: number;
  clicks: number;
  impressions?: number;
  ctr?: string;
  history?: any[];
}

interface PageData {
  path: string;
  views?: number;
  rate?: string;
  clicks?: number;
  impressions?: number;
  ctr?: string;
  rank?: string;
}

interface GAData {
  isDemo: boolean;
  credsMissing?: boolean;
  propertyMissing?: boolean;
  trafficAcquisition: any[];
  demographics: { countries: any[], cities: any[] };
  tech: { devices: any[], os: any[], browsers: any[] };
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
    chart: any[];
    topPages?: any[];
  };
}

interface GSCData {
  isDemo: boolean;
  apiError?: string;
  credsMissing?: boolean;
  propertyMissing?: boolean;
  keywords: KeywordData[];
  topPages: PageData[];
}

export default function SEODetailPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(props.params);
  const supabase = createClient();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [gaData, setGaData] = useState<GAData | null>(null);
  const [gscData, setGscData] = useState<GSCData | null>(null);
  const [systemEmail, setSystemEmail] = useState<string>('');

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingGA, setLoadingGA] = useState(true);
  const [loadingGSC, setLoadingGSC] = useState(true);
  const [activeTab, setActiveTab] = useState<'ga4' | 'gsc'>('ga4');
  const [error, setError] = useState<string | null>(null);

  // GSC Sub-tab and Pagination states
  const [gscSubTab, setGscSubTab] = useState<'keywords' | 'pages'>('keywords');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [keywordPage, setKeywordPage] = useState(1);
  const [pageSearch, setPageSearch] = useState('');
  const [pagePage, setPagePage] = useState(1);
  const rowsPerPage = 15;

  // Derived GSC Data
  const filteredKeywords = gscData?.keywords.filter(kw =>
    kw.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
    (kw.url && kw.url.toLowerCase().includes(keywordSearch.toLowerCase()))
  ) || [];
  const paginatedKeywords = filteredKeywords.slice((keywordPage - 1) * rowsPerPage, keywordPage * rowsPerPage);
  const totalKeywordPages = Math.max(1, Math.ceil(filteredKeywords.length / rowsPerPage));

  const filteredPages = gscData?.topPages.filter(p =>
    p.path.toLowerCase().includes(pageSearch.toLowerCase())
  ) || [];
  const paginatedPages = filteredPages.slice((pagePage - 1) * rowsPerPage, pagePage * rowsPerPage);
  const totalPagePages = Math.max(1, Math.ceil(filteredPages.length / rowsPerPage));

  // GSC Chart Data
  const allDates = Array.from(new Set(gscData?.keywords.flatMap(kw => kw.history?.map((h: any) => h.date) || []) || [])).sort();
  const gscChartData = allDates.map(date => {
    const row: any = { date };
    gscData?.keywords.forEach(kw => {
      const entry = kw.history?.find((h: any) => h.date === date);
      if (entry) {
        row[kw.keyword] = entry.rank;
      }
    });
    return row;
  });

  const [copied, setCopied] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState('30daysAgo');

  // GSC Manual Input Modal State
  const [isGscModalOpen, setIsGscModalOpen] = useState(false);
  const [gscKeyword, setGscKeyword] = useState('');
  const [gscUrl, setGscUrl] = useState('');
  const [gscRank, setGscRank] = useState('');
  const [gscDate, setGscDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingGsc, setSavingGsc] = useState(false);

  const handleAddGscManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gscKeyword || !gscUrl || !gscRank || !gscDate) {
      alert('Semua field wajib diisi.');
      return;
    }
    
    setSavingGsc(true);
    try {
      const { error: insertErr } = await supabase
        .from('seo_gsc_manual')
        .insert({
          project_id: id,
          keyword: gscKeyword,
          url: gscUrl,
          rank: parseFloat(gscRank),
          date: gscDate
        });
        
      if (insertErr) throw insertErr;
      
      setIsGscModalOpen(false);
      setGscKeyword('');
      setGscUrl('');
      setGscRank('');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingGsc(false);
    }
  };

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      setLoadingProject(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from('projects')
          .select('*, clients!inner(name)')
          .eq('id', id)
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
  }, [id, supabase]);

  useEffect(() => {
    if (!id || loadingProject || !project) return;
    
    const fetchGAData = async () => {
      setLoadingGA(true);
      try {
        const res = await fetch(`/api/seo/ga4?project_id=${id}&range=${dateRange}`);
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

    const fetchGSCData = async () => {
      setLoadingGSC(true);
      try {
        const res = await fetch(`/api/seo/gsc?project_id=${id}&range=${dateRange}`);
        if (!res.ok) throw new Error('Failed to fetch GSC analytics');
        const data = await res.json();
        setGscData(data);
      } catch (err: any) {
        console.error('Error fetching GSC data:', err);
      } finally {
        setLoadingGSC(false);
      }
    };

    fetchGAData();
    fetchGSCData();
  }, [id, project, loadingProject, refreshKey, dateRange]);

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
      ["Total Sessions (30d)", gaData.historical.sessions],
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

      </div>

      {loadingGA ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-xs text-slate-500">Mengambil data statistik traffic...</p>
          </div>
        ) : gaData ? (
          <div className="space-y-8 animate-in fade-in">
            {/* Info banner if not connected */}
            {gaData.isDemo && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center print:hidden">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-amber-300">Google API belum terintegrasi.</p>
                    <p>
                      {gaData.credsMissing && "Kredensial Google Service Account belum dikonfigurasi di Pengaturan Sistem. "}
                      {gaData.propertyMissing && "Proyek ini belum memiliki ID Properti GA4. "}
                      Semua metrik akan menampilkan 0 hingga integrasi selesai.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-1.5 bg-cyan-500 text-black rounded-lg text-xs font-bold hover:bg-cyan-400 transition-colors cursor-pointer shrink-0"
                >
                  BUKA PENGATURAN
                </button>
              </div>
            )}

            {/* Action Controls Bar (Moved) */}
            <div className="flex items-center justify-end mb-4 print:hidden animate-in fade-in">
              <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5 backdrop-blur-xl">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                >
                  <option value="today">Hari Ini</option>
                  <option value="7daysAgo">7 Hari Terakhir</option>
                  <option value="30daysAgo">30 Hari Terakhir</option>
                  <option value="all_time">Semua Tanggal</option>
                </select>
                <button 
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGA || loadingGSC ? 'animate-spin' : ''}`} /> Refresh
                </button>
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
            </div>

            {/* TABS */}
            <div className="flex border-b border-white/10 space-x-6">
              <button 
                onClick={() => setActiveTab('ga4')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'ga4' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'}`}
              >
                Google Analytics 4
              </button>
              <button 
                onClick={() => setActiveTab('gsc')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'gsc' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'}`}
              >
                Search Console
              </button>
            </div>

            {/* AI Insight Card */}
            <div className="mb-4 mt-6">
              <AIInsightCard 
                reportType={`SEO Report (${activeTab === 'ga4' ? 'Google Analytics 4' : 'Google Search Console'})`}
                reportData={activeTab === 'ga4' ? gaData : gscData} 
              />
            </div>

            {activeTab === 'ga4' && (
              <div className="space-y-8 animate-in fade-in">
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sessions</span>
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
            <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col h-[400px]">
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

              {/* Traffic & Tech Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                {/* Traffic Acquisition */}
                <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col min-h-[300px]">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Traffic Acquisition</h4>
                  <div className="flex-1 space-y-4">
                    {gaData.trafficAcquisition?.slice(0, 5).map((t, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="font-bold">{t.channel}</span>
                          <span className="font-mono">{t.sessions.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${Math.max(2, (t.sessions / Math.max(1, gaData.historical.sessions)) * 100)}%`,
                              backgroundColor: COLORS[idx % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {(!gaData.trafficAcquisition || gaData.trafficAcquisition.length === 0) && (
                      <div className="text-xs text-slate-500 italic py-4 text-center">No traffic data available</div>
                    )}
                  </div>
                </div>


                {/* Tech (Device) */}
                <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col min-h-[300px]">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Device Category</h4>
                  <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
                    {gaData.tech?.devices && gaData.tech.devices.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={gaData.tech.devices}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="users"
                              nameKey="device"
                            >
                              {gaData.tech.devices.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#090d16', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff', fontSize: 11 }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Overlay legend */}
                        <div className="absolute top-4 right-0 flex flex-col gap-2">
                          {gaData.tech.devices.slice(0,3).map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              {d.device}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500 italic text-center">No tech data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* World Map Demographics */}
              <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Persebaran Pengunjung (Negara)</h4>
                  <Globe className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-h-[350px] bg-slate-950/50 rounded-xl overflow-hidden relative border border-white/5">
                  <ComposableMap 
                    projectionConfig={{ scale: 140 }} 
                    className="w-full h-full object-cover opacity-80"
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }: { geographies: any[] }) => {
                        const maxUsers = gaData.demographics?.countries?.[0]?.users || 1;
                        return geographies.map((geo) => {
                          const d = gaData.demographics?.countries?.find((s: any) => s.country === geo.properties.name);
                          let fill = "#1e293b";
                          if (d) {
                            const logRatio = Math.log(d.users + 1) / Math.log(maxUsers + 1);
                            const opacity = Math.max(0.15, Math.min(1, logRatio));
                            fill = `rgba(0, 242, 234, ${opacity})`;
                          }
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fill}
                              stroke="#0f172a"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: { fill: "#8b5cf6", outline: "none" },
                                pressed: { outline: "none" },
                              }}
                            />
                          );
                        });
                      }}
                    </Geographies>
                  </ComposableMap>
                  
                  {/* Legend overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-lg flex flex-col gap-2 min-w-[200px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10 pb-1 mb-1">Top 5 Negara</div>
                    {gaData.demographics?.countries?.slice(0,5).map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-center gap-4 text-xs">
                        <span className="text-slate-300">{c.country}</span>
                        <span className="text-emerald-400 font-mono font-bold">{c.users.toLocaleString()}</span>
                      </div>
                    ))}
                    {(!gaData.demographics?.countries || gaData.demographics.countries.length === 0) && (
                      <div className="text-xs text-slate-500 italic py-2 text-center">No demographics data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Pages (Moved to bottom of GA4) */}
              <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col h-auto mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Page Visitor</h4>
                  <Globe className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 space-y-2 flex flex-col">
                  {gaData.historical.topPages?.map((page: any, idx: number) => {
                    const baseUrl = project?.website_url ? (project.website_url.startsWith('http') ? project.website_url : `https://${project.website_url}`) : '';
                    const fullUrl = baseUrl && page.path ? `${baseUrl}${page.path.startsWith('/') ? page.path : '/' + page.path}` : '#';
                    return (
                    <div key={idx} className="flex flex-col gap-2 border-b border-white/5 pb-3 pt-3 first:pt-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                      <div className="flex justify-between items-center">
                        <a 
                          href={fullUrl}
                          target={fullUrl !== '#' ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="flex flex-col group min-w-0 flex-1 pr-4"
                        >
                          <span className="text-sm text-slate-300 font-medium truncate group-hover:text-indigo-400 transition-colors" title={page.title}>{page.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate mt-0.5 group-hover:text-indigo-300/70">{page.path}</span>
                        </a>
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span className="text-sm font-bold text-white font-mono">{page.views.toLocaleString()}</span>
                          <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-1", page.isUp ? "text-emerald-400" : "text-red-400")}>
                            {page.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {page.rate}
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                  {(!gaData.historical.topPages || gaData.historical.topPages.length === 0) && (
                     <div className="text-xs text-slate-500 italic py-4 text-center">No top pages data available</div>
                  )}
                </div>
              </div>

            </div>
            )}

            {activeTab === 'gsc' && (
              <div className="space-y-8 animate-in fade-in mt-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <span className="w-1.5 h-3 bg-indigo-400 rounded-xs"></span>
                    Data Search Console (Organik Google)
                  </div>
                </div>

                {loadingGSC ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs text-slate-500">Mengambil data Search Console...</p>
                  </div>
                ) : gscData ? (
                  <>
                    {gscData.isDemo && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="font-bold text-amber-300">Google Search Console belum terintegrasi.</p>
                          <p>Pastikan Service Account sudah diundang ke Google Search Console milik website ini. Data akan kosong hingga integrasi selesai.</p>
                        </div>
                      </div>
                    )}


                    <div className="high-tech-card p-6 border-indigo-500/10 bg-slate-900/20 flex flex-col h-[650px]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Semua Performa Kata Kunci</h4>
                              <div className="relative w-full md:w-64">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                  type="text"
                                  placeholder="Cari keyword atau URL..."
                                  value={keywordSearch}
                                  onChange={(e) => { setKeywordSearch(e.target.value); setKeywordPage(1); }}
                                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                              <table className="w-full text-left text-xs relative">
                                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
                                  <tr className="text-[10px] text-slate-500 border-b border-white/10 uppercase tracking-wider font-bold">
                                    <th className="pb-4 pt-3 px-4 w-12 text-center">No</th>
                                    <th className="pb-4 pt-3 px-4">Keyword</th>
                                    <th className="pb-4 pt-3 px-4">Halaman (URL)</th>
                                    <th className="pb-4 pt-3 px-4 text-center">Rank</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {paginatedKeywords.map((kw: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                      <td className="py-4 px-4 text-center text-slate-500 font-mono text-[10px]">
                                        {(keywordPage - 1) * rowsPerPage + i + 1}
                                      </td>
                                      <td className="py-4 px-4 text-slate-300 font-medium group-hover:text-white transition-colors">{kw.keyword}</td>
                                      <td className="py-4 px-4 text-slate-400 font-mono max-w-[300px] truncate" title={kw.url}>
                                        {kw.url ? (
                                          <a href={kw.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                                            {kw.url} <ExternalLink className="w-3 h-3 shrink-0" />
                                          </a>
                                        ) : '-'}
                                      </td>
                                      <td className="py-4 px-4 text-center font-mono">
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="font-bold text-emerald-400 text-sm">{kw.rank}</span>
                                          {kw.rankChange !== undefined && kw.rankChange !== 0 && (
                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", kw.rankChange > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                              {kw.rankChange > 0 ? '+' : ''}{kw.rankChange}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                  {paginatedKeywords.length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="py-12 text-center text-slate-500">Tidak ada data ditemukan.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
                              <span className="text-[10px] text-slate-500">
                                Menampilkan {filteredKeywords.length > 0 ? (keywordPage - 1) * rowsPerPage + 1 : 0} - {Math.min(keywordPage * rowsPerPage, filteredKeywords.length)} dari {filteredKeywords.length}
                              </span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => setKeywordPage(p => Math.max(1, p - 1))}
                                  disabled={keywordPage === 1}
                                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-mono text-slate-400 px-3 py-1 bg-black/40 rounded-md border border-white/5">
                                  {keywordPage} / {totalKeywordPages}
                                </span>
                                <button 
                                  onClick={() => setKeywordPage(p => Math.min(totalKeywordPages, p + 1))}
                                  disabled={keywordPage === totalKeywordPages}
                                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                  </>
                ) : (
                  <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-400 text-xs">
                    Gagal mengambil data Search Console.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}


      {/* GSC Manual Input Modal */}
      {isGscModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="high-tech-card p-6 max-w-md w-full space-y-6 relative border-indigo-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Tambah Data Keyword Manual
              </h3>
              <button 
                onClick={() => setIsGscModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGscManual} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Keyword</label>
                <input 
                  type="text" 
                  value={gscKeyword} 
                  onChange={(e) => setGscKeyword(e.target.value)} 
                  required
                  placeholder="Contoh: jasa seo jakarta"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Link / Halaman (URL)</label>
                <input 
                  type="url" 
                  value={gscUrl} 
                  onChange={(e) => setGscUrl(e.target.value)} 
                  required
                  placeholder="https://marketbiz.net/jasa-seo"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Posisi (Rank)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1"
                    value={gscRank} 
                    onChange={(e) => setGscRank(e.target.value)} 
                    required
                    placeholder="Contoh: 1.5"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Tanggal</label>
                  <input 
                    type="date" 
                    value={gscDate} 
                    onChange={(e) => setGscDate(e.target.value)} 
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
                <button 
                  type="button"
                  onClick={() => setIsGscModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={savingGsc}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {savingGsc ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
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

            <div className="space-y-6 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
                <h4 className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  1. Google Search Console (Fokus pada "SEBELUM" Masuk Website)
                </h4>
                <p className="text-slate-400">Search Console mengukur performa website Anda di halaman pencarian Google. Data yang terekam adalah interaksi pengguna <strong>sebelum</strong> mereka mengklik web Anda.</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-2">
                  <li><strong>Data yang diambil:</strong> Orang mengetik kata kunci (keyword) apa di Google? Website Anda muncul di urutan ke berapa (Ranking/Position)? Berapa kali link web Anda dilihat di Google (Impressions)? Berapa yang akhirnya diklik (Clicks)?</li>
                  <li><strong>Fungsi Utama:</strong> Murni untuk strategi SEO (mengukur ranking keyword dan kesehatan pencarian Google).</li>
                </ul>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  2. Google Analytics 4 (Fokus pada "SETELAH" Masuk Website)
                </h4>
                <p className="text-slate-400">Analytics mengukur aktivitas pengguna <strong>setelah</strong> mereka tiba dan membuka website Anda (baik mereka datang dari Google, Instagram, Facebook, Iklan, atau mengetik langsung).</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-2">
                  <li><strong>Data yang diambil:</strong> Berapa lama mereka diam di website? Halaman apa saja yang mereka baca (Top Pages)? Berapa banyak orang yang aktif sekarang (Realtime Users)? Apakah mereka langsung keluar tanpa baca (Bounce Rate)? Berapa banyak total pengunjung unik bulan ini (Total Users/Sessions)?</li>
                  <li><strong>Fungsi Utama:</strong> Memahami perilaku pengunjung dan performa engagement website.</li>
                </ul>
                <div className="mt-3 p-3 bg-black/40 rounded-lg text-[11px] text-slate-400 border border-white/5">
                  <p><strong>Kenapa data GA4 saya 0 semua?</strong> Jika data Active Users, Sessions, dan Page Views menunjukkan angka 0, artinya dalam 30 hari terakhir memang belum ada pengunjung riil yang masuk ke website Anda via pencarian Google Organik (atau tag GA4 belum terpasang dengan benar di website).</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <h4 className="font-bold text-emerald-400 mb-2">Kesimpulan</h4>
                <p className="text-slate-400">Jika Anda ingin menampilkan data "Pengunjung yang sedang buka web" atau "Total Kunjungan", kita pakai <strong>Google Analytics 4</strong>. Tapi jika Anda ingin menampilkan data "Website kita masuk halaman 1 Google untuk keyword apa saja?", kita memakai <strong>Google Search Console</strong>.</p>
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
