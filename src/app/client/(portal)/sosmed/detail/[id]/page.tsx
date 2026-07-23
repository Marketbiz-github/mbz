'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Share2, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  FileText,
  ExternalLink,
  Heart,
  MessageSquare,
  Printer,
  AlertTriangle,
  HelpCircle,
  Eye,
  Bookmark,
  Link2,
  BarChart3,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

// ─── Authentic Social Media Logo Icons ───────────────────────
export function InstagramLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="white" />
    </svg>
  );
}

export function TikTokLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.53 2c.07.1.15.2.22.3a6.83 6.83 0 0 0 5.16 3.1c.14.01.28.02.42.02v3.74a10.6 10.6 0 0 1-5.7-1.83v7.35a5.55 5.55 0 0 1-5.55 5.56A5.55 5.55 0 0 1 1.52 14.7a5.55 5.55 0 0 1 5.34-5.54c.26 0 .52.02.77.06v3.73c-.25-.06-.5-.09-.77-.09a1.81 1.81 0 0 0-1.81 1.82 1.81 1.81 0 0 0 1.81 1.82 1.81 1.81 0 0 0 1.81-1.82V2.01h3.86Z" fill="#00F2EA" />
      <path d="M12.5 2.03c.07.1.15.2.22.3a6.83 6.83 0 0 0 5.16 3.1c.14.01.28.02.42.02v3.74a10.6 10.6 0 0 1-5.7-1.83v7.35a5.55 5.55 0 0 1-5.55 5.56A5.55 5.55 0 0 1 1.49 14.7a5.55 5.55 0 0 1 5.34-5.54c.26 0 .52.02.77.06v3.73c-.25-.06-.5-.09-.77-.09a1.81 1.81 0 0 0-1.81 1.82 1.81 1.81 0 0 0 1.81 1.82 1.81 1.81 0 0 0 1.81-1.82V2.04h3.86Z" fill="#FF007F" className="mix-blend-lighten opacity-80" />
      <path d="M12.52 2.02c.07.1.15.2.22.3a6.83 6.83 0 0 0 5.16 3.1c.14.01.28.02.42.02v3.74a10.6 10.6 0 0 1-5.7-1.83v7.35a5.55 5.55 0 0 1-5.55 5.56A5.55 5.55 0 0 1 1.5 14.7a5.55 5.55 0 0 1 5.34-5.54c.26 0 .52.02.77.06v3.73c-.25-.06-.5-.09-.77-.09a1.81 1.81 0 0 0-1.81 1.82 1.81 1.81 0 0 0 1.81 1.82 1.81 1.81 0 0 0 1.81-1.82V2.02h3.86Z" fill="white" className="mix-blend-overlay" />
    </svg>
  );
}

export function LinkedInLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M6.5 6.5h3v10h-3zM8 5a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 5zM11 9.5h2.8v1.36h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47v5.69h-3.13v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58v4.99H11v-10z" fill="white" />
    </svg>
  );
}

export function FacebookLogo({ className = "w-4 h-4" }: { className?: string }) {
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

// ─── Helper: percentage bar ──────────────────────────────────
function PctBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono font-bold text-white">{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%`, background: color }}></div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function SosmedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();
  const supabase = createClient();

  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [activeTab, setActiveTab] = useState<'account' | 'posts'>('account');
  const [loading, setLoading] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30daysAgo');

  // ─── Data Fetching ─────────────────────────────────────────
  useEffect(() => {
    fetchProjectData();
  }, [id, dateRange, user]);

  useEffect(() => {
    if (project) {
      const activePlats = project.active_platforms ? project.active_platforms.split(',') : ['instagram', 'tiktok', 'linkedin', 'facebook'];
      if (activePlats.length > 0 && !activePlats.includes(selectedPlatform)) {
        setSelectedPlatform(activePlats[0]);
      }
    }
  }, [project]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // 1. Fetch project info and enforce security
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_id', user?.id)
        .single();
        
      if (!clientInfo) throw new Error('Client profile not found');

      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('id', id)
        .eq('client_id', clientInfo.id)
        .single();
      if (projErr) throw projErr;
      setProject(projData);

      if (projData) {
        document.title = `${projData.name} - Sosmed | MarketBiz`;
      }

      let repQuery = supabase.from('sosmed_reports').select('*').eq('project_id', id).order('report_date', { ascending: true });
      let pstQuery = supabase.from('sosmed_posts').select('*').eq('project_id', id).order('posted_at', { ascending: false });

      if (dateRange !== 'all') {
        const today = new Date();
        const targetDate = new Date();
        if (dateRange === 'today') targetDate.setHours(0,0,0,0);
        else if (dateRange === '7daysAgo') targetDate.setDate(today.getDate() - 7);
        else if (dateRange === '30daysAgo') targetDate.setDate(today.getDate() - 30);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        repQuery = repQuery.gte('report_date', targetDateStr);
        pstQuery = pstQuery.gte('posted_at', targetDateStr);
      }

      const { data: repData } = await repQuery;
      setReports(repData || []);
      const { data: pstData } = await pstQuery;
      setPosts(pstData || []);
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed Account Data ─────────────────────────────────
  const getSocialPlatformData = () => {
    const pReports = reports.filter(r => r.platform === selectedPlatform);
    if (pReports.length === 0) {
      return {
        hasData: false,
        totalViews: 0, totalReach: 0, totalInteractions: 0, totalAccountsEngaged: 0,
        avgViewsFollowersPct: 0, avgViewsNonFollowersPct: 0,
        avgViewsPostsPct: 0, avgViewsStoriesPct: 0,
        avgInteractionsFollowersPct: 0, avgInteractionsNonFollowersPct: 0,
        avgInteractionsPostsPct: 0, avgInteractionsStoriesPct: 0,
        totalProfileVisits: 0, totalExternalLinkTaps: 0,
        totalFollowers: 0, engagementRate: 0,
        chart: []
      };
    }

    const totalViews = pReports.reduce((s, r) => s + (r.views || 0), 0);
    const totalReach = pReports.reduce((s, r) => s + (r.reach || 0), 0);
    const totalInteractions = pReports.reduce((s, r) => s + (r.engagement || 0), 0);
    const totalAccountsEngaged = pReports.reduce((s, r) => s + (r.accounts_engaged || 0), 0);
    const totalProfileVisits = pReports.reduce((s, r) => s + (r.profile_visits || 0), 0);
    const totalExternalLinkTaps = pReports.reduce((s, r) => s + (r.external_link_taps || 0), 0);

    // Weighted averages for percentages
    const weightedAvg = (field: string) => {
      const total = pReports.reduce((s, r) => s + (r[field] || 0), 0);
      return pReports.length > 0 ? total / pReports.length : 0;
    };

    const sorted = [...pReports].sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
    const latestFollowers = sorted[sorted.length - 1]?.total_followers || 0;
    const engagementRate = totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;

    const chart = pReports.map(r => ({
      name: new Date(r.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      views: r.views || 0,
      interactions: r.engagement || 0
    }));

    return {
      hasData: true,
      totalViews, totalReach, totalInteractions, totalAccountsEngaged,
      avgViewsFollowersPct: weightedAvg('views_followers_pct'),
      avgViewsNonFollowersPct: weightedAvg('views_non_followers_pct'),
      avgViewsPostsPct: weightedAvg('views_posts_pct'),
      avgViewsStoriesPct: weightedAvg('views_stories_pct'),
      avgInteractionsFollowersPct: weightedAvg('interactions_followers_pct'),
      avgInteractionsNonFollowersPct: weightedAvg('interactions_non_followers_pct'),
      avgInteractionsPostsPct: weightedAvg('interactions_posts_pct'),
      avgInteractionsStoriesPct: weightedAvg('interactions_stories_pct'),
      totalProfileVisits, totalExternalLinkTaps,
      totalFollowers: latestFollowers,
      engagementRate,
      chart
    };
  };

  const getTrackedPosts = () => {
    const platformPosts = posts.filter(p => p.platform === selectedPlatform);
    return { list: platformPosts, hasData: platformPosts.length > 0 };
  };

  // ─── CSV Download ──────────────────────────────────────────
  const handleDownloadExcel = () => {
    if (activeTab === 'account') {
      const pReports = reports.filter(r => r.platform === selectedPlatform);
      if (pReports.length === 0) { alert('Tidak ada log data.'); return; }
      const headers = ['Tanggal','Views','Views Followers %','Views NonFollowers %','Views Posts %','Views Stories %','Accounts Reached','Interactions','Inter Followers %','Inter NonFollowers %','Inter Posts %','Inter Stories %','Accounts Engaged','Profile Visits','External Link Taps','Total Followers','Notes'];
      const csvRows = [headers.join(',')];
      for (const r of pReports) {
        csvRows.push([r.report_date, r.views||0, r.views_followers_pct||0, r.views_non_followers_pct||0, r.views_posts_pct||0, r.views_stories_pct||0, r.reach||0, r.engagement||0, r.interactions_followers_pct||0, r.interactions_non_followers_pct||0, r.interactions_posts_pct||0, r.interactions_stories_pct||0, r.accounts_engaged||0, r.profile_visits||0, r.external_link_taps||0, r.total_followers||0, `"${(r.notes||'').replace(/"/g,'""')}"`].join(','));
      }
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.setAttribute('href', url); a.setAttribute('download', `IG_Account_${selectedPlatform}_${project?.name}.csv`); a.click();
    } else {
      const pPosts = posts.filter(p => p.platform === selectedPlatform);
      if (pPosts.length === 0) { alert('Tidak ada log postingan.'); return; }
      const headers = ['Judul','Tipe','Tanggal','URL','Views','Accounts Reached','Interactions','Likes','Comments','Shares','Saves','Accounts Engaged','Profile Visits','External Link Taps','Notes'];
      const csvRows = [headers.join(',')];
      for (const p of pPosts) {
        csvRows.push([`"${p.post_title.replace(/"/g,'""')}"`, p.content_type||'post', p.posted_at, p.post_url, p.views||0, p.accounts_reached||p.reach||0, p.interactions_total||p.engagement||0, p.likes||0, p.comments||0, p.shares||0, p.saves||0, p.accounts_engaged||0, p.profile_visits||0, p.external_link_taps||0, `"${(p.notes||'').replace(/"/g,'""')}"`].join(','));
      }
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.setAttribute('href', url); a.setAttribute('download', `IG_Posts_${selectedPlatform}_${project?.name}.csv`); a.click();
    }
  };

  // ─── Derived values ────────────────────────────────────────
  const currentData = getSocialPlatformData();
  const trackedPosts = getTrackedPosts();
  const platformColor = platforms.find(p => p.id === selectedPlatform)?.color || '#22d3ee';
  const activePlats = project?.active_platforms ? project.active_platforms.split(',') : ['instagram', 'tiktok', 'linkedin', 'facebook'];
  const filteredPlatforms = platforms.filter(p => activePlats.includes(p.id));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-500">Memuat detail analitik...</p>
      </div>
    );
  }

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CSS print-friendly styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          aside, header, nav, .print\\:hidden, button, a.print\\:hidden { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .high-tech-card { background: transparent !important; border: 1px solid #e2e8f0 !important; color: black !important; box-shadow: none !important; }
          .text-white { color: black !important; }
          .text-slate-400, .text-slate-500 { color: #475569 !important; }
        }
      `}</style>

      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/client/sosmed" className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all print:hidden">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{project?.name}</h1>
              <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                project?.status === 'active' 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              )}>
                {project?.status === 'active' ? 'Ongoing' : project?.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Klien: {project?.clients?.name || '-'}
              </p>
              {(() => {
                const currentProfile = project?.platform_profiles?.[selectedPlatform] 
                  || (selectedPlatform === 'instagram' ? { username: project?.profile_username, url: project?.profile_url } : null);
                if (!currentProfile?.username) return null;
                return (
                  <a href={currentProfile.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-cyan-400 hover:underline font-bold">
                    @{currentProfile.username}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 print:hidden">
            <Printer className="w-4 h-4" /> CETAK PDF
          </button>
          <button onClick={handleDownloadExcel} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 print:hidden">
            <FileText className="w-4 h-4" /> UNDUH CSV
          </button>
        </div>
      </div>

      {/* Platform & Section Selector */}
      <div className="flex flex-col md:flex-row justify-between border-b border-white/10 gap-4 pb-2 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {filteredPlatforms.map(p => {
              const Icon = p.icon;
              const isActive = selectedPlatform === p.id;
              return (
                <button key={p.id} onClick={() => setSelectedPlatform(p.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border select-none whitespace-nowrap",
                  isActive ? "bg-white/10 border-white/20 text-white shadow-lg" : "bg-transparent border-transparent text-slate-500 hover:text-white"
                )}>
                  <Icon className="w-4 h-4" /> {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer h-9">
              <option value="today">Hari Ini</option>
              <option value="7daysAgo">7 Hari Terakhir</option>
              <option value="30daysAgo">30 Hari Terakhir</option>
              <option value="all">Semua Waktu</option>
            </select>
          </div>
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 items-center">
          <button onClick={() => setActiveTab('account')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === 'account' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}>
            Analisis Akun
          </button>
          <button onClick={() => setActiveTab('posts')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === 'posts' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}>
            Analisis Per Post
          </button>
        </div>
      </div>

      {/* ═══ TAB 1: ANALISIS AKUN ═══ */}
      {activeTab === 'account' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* 4 Main Metric Cards — IG Style */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <span className="w-1.5 h-3 bg-emerald-400 rounded-xs"></span>
              Metrik Performa — Sesuai Instagram Dashboard
            </div>
            <button onClick={() => setIsHelpModalOpen(true)} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" /> Penjelasan Metrik
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Views */}
            <div className="high-tech-card p-6 flex flex-col gap-3 border-purple-500/20">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><Eye className="w-4 h-4" /></div>
                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">IG Direct</span>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Views</h4>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{currentData.totalViews.toLocaleString()}</p>
              </div>
            </div>

            {/* Accounts Reached */}
            <div className="high-tech-card p-6 flex flex-col gap-3 border-blue-500/20">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Users className="w-4 h-4" /></div>
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">IG Direct</span>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Accounts Reached</h4>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{currentData.totalReach.toLocaleString()}</p>
              </div>
            </div>

            {/* Interactions */}
            <div className="high-tech-card p-6 flex flex-col gap-3 border-rose-500/20">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400"><Heart className="w-4 h-4" /></div>
                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">IG Direct</span>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Interactions</h4>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{currentData.totalInteractions.toLocaleString()}</p>
              </div>
            </div>

            {/* Engagement Rate — Computed */}
            <div className="high-tech-card p-6 flex flex-col gap-3 border-amber-500/20">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><MousePointer2 className="w-4 h-4" /></div>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Computed</span>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Engagement Rate</h4>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{currentData.engagementRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {!currentData.hasData ? (
            <div className="high-tech-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <div className="max-w-md">
                <h4 className="text-white font-bold text-sm">Belum Ada Log Data Akun</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Belum ada log histori performa yang terdaftar untuk platform {selectedPlatform.toUpperCase()}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Secondary metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="high-tech-card p-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Accounts Engaged</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.totalAccountsEngaged.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400"><MousePointer2 className="w-5 h-5" /></div>
                </div>
                <div className="high-tech-card p-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Profile Visits</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.totalProfileVisits.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400"><Link2 className="w-5 h-5" /></div>
                </div>
                <div className="high-tech-card p-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">External Link Taps</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.totalExternalLinkTaps.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400"><ExternalLink className="w-5 h-5" /></div>
                </div>
                <div className="high-tech-card p-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Followers</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.totalFollowers.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400"><Users className="w-5 h-5" /></div>
                </div>
              </div>

              {/* Instagram Professional Dashboard Insight Card */}
              <div className="high-tech-card p-6 border-purple-500/20 bg-linear-to-br from-purple-500/5 via-slate-950 to-slate-950">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <InstagramLogo className="w-4 h-4" /> Account Insights — Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ringkasan distribusi views & interactions sesuai format Instagram</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">Instagram Format</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Views */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Views</span>
                      <h2 className="text-3xl font-extrabold text-white mt-1">{currentData.totalViews.toLocaleString()}</h2>
                    </div>
                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <PctBar label="Followers" pct={currentData.avgViewsFollowersPct} color="#a78bfa" />
                      <PctBar label="Non-followers" pct={currentData.avgViewsNonFollowersPct} color="#f472b6" />
                    </div>
                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">By Content Type</p>
                      <PctBar label="Posts" pct={currentData.avgViewsPostsPct} color="#818cf8" />
                      <PctBar label="Stories" pct={currentData.avgViewsStoriesPct} color="#f472b6" />
                    </div>
                  </div>

                  {/* Right: Interactions */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Interactions</span>
                      <h2 className="text-3xl font-extrabold text-white mt-1">{currentData.totalInteractions.toLocaleString()}</h2>
                    </div>
                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <PctBar label="Followers" pct={currentData.avgInteractionsFollowersPct} color="#a78bfa" />
                      <PctBar label="Non-followers" pct={currentData.avgInteractionsNonFollowersPct} color="#f472b6" />
                    </div>
                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">By Content Type</p>
                      <PctBar label="Posts" pct={currentData.avgInteractionsPostsPct} color="#818cf8" />
                      <PctBar label="Stories" pct={currentData.avgInteractionsStoriesPct} color="#f472b6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie: Views followers vs non-followers */}
                <div className="high-tech-card p-6">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Views: Followers vs Non-followers</h3>
                  {(currentData.avgViewsFollowersPct > 0 || currentData.avgViewsNonFollowersPct > 0) ? (
                    <div className="flex items-center gap-6">
                      <div className="w-44 h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[
                              { name: 'Followers', value: currentData.avgViewsFollowersPct },
                              { name: 'Non-followers', value: currentData.avgViewsNonFollowersPct }
                            ]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                              <Cell fill="#a78bfa" />
                              <Cell fill="#f472b6" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ fontSize: '11px', color: '#fff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#a78bfa]"></span>
                          <span className="text-xs text-slate-300 flex-1">Followers</span>
                          <span className="text-xs font-bold text-white">{currentData.avgViewsFollowersPct.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#f472b6]"></span>
                          <span className="text-xs text-slate-300 flex-1">Non-followers</span>
                          <span className="text-xs font-bold text-white">{currentData.avgViewsNonFollowersPct.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">Belum ada data breakdown views.</p>
                  )}
                </div>

                {/* Bar: Views by content type */}
                <div className="high-tech-card p-6">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Views per Jenis Konten</h3>
                  {(currentData.avgViewsPostsPct > 0 || currentData.avgViewsStoriesPct > 0) ? (
                    <div className="w-full h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={[
                          { name: 'Posts', value: currentData.avgViewsPostsPct, fill: '#818cf8' },
                          { name: 'Stories', value: currentData.avgViewsStoriesPct, fill: '#f472b6' }
                        ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={60} />
                          <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                          <Bar dataKey="value" name="%" radius={[0, 6, 6, 0]}>
                            <Cell key="posts" fill="#818cf8" />
                            <Cell key="stories" fill="#f472b6" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">Belum ada data breakdown konten.</p>
                  )}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="high-tech-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">Tren Views vs Interactions (Akun)</h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentData.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={platformColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={platformColor} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInteract" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }} itemStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="views" name="Views" stroke={platformColor} fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                      <Area type="monotone" dataKey="interactions" name="Interactions" stroke="#818cf8" fillOpacity={1} fill="url(#colorInteract)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History Log Table */}
              <div className="high-tech-card overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histori Log Performa Akun</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">Tanggal</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Views</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reached</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactions</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engaged</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports.filter(r => r.platform === selectedPlatform).map(r => (
                        <tr key={r.id} className="hover:bg-white/2 transition-colors text-xs text-white">
                          <td className="px-4 py-4 font-mono text-slate-400">{new Date(r.report_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                          <td className="px-4 py-4 font-bold">{(r.views || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(r.reach || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(r.engagement || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(r.accounts_engaged || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(r.total_followers || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-500 italic max-w-xs truncate" title={r.notes}>{r.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ TAB 2: ANALISIS PER POST ═══ */}
      {activeTab === 'posts' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!trackedPosts.hasData ? (
            <div className="high-tech-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <div className="max-w-md">
                <h4 className="text-white font-bold text-sm">Belum Ada Postingan yang Di-track</h4>
                <p className="text-xs text-slate-500 mt-1">Tim agensi belum menambahkan laporan postingan per konten.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Top content by views — auto-sorted */}
              <div className="high-tech-card p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Content — By Views</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {trackedPosts.list.sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((post: any) => (
                    <a key={post.id} href={post.post_url} target="_blank" rel="noopener noreferrer" className="group bg-white/5 border border-white/10 rounded-xl p-3 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Eye className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-bold text-white">{(post.views || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{post.post_title}</p>
                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border mt-1 inline-block",
                        post.content_type === 'reel' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        post.content_type === 'story' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      )}>{post.content_type || 'post'}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Post Table */}
              <div className="high-tech-card overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daftar Postingan</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">No</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Views</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reached</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactions</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail</th>
                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engaged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {trackedPosts.list.map((post: any, idx: number) => (
                        <tr key={post.id || idx} className="hover:bg-white/2 transition-colors text-xs text-white">
                          <td className="px-4 py-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <div>
                              <span className="font-bold text-white block max-w-xs truncate">{post.post_title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border",
                                  post.content_type === 'reel' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                  post.content_type === 'story' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                )}>{post.content_type || 'post'}</span>
                                <span className="text-[10px] text-slate-500">{new Date(post.posted_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5 print:hidden">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold">{(post.views || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(post.accounts_reached || post.reach || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-slate-300">{(post.interactions_total || post.engagement || 0).toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3 text-slate-400">
                              <div className="flex items-center gap-1" title="Likes"><Heart className="w-3 h-3 text-pink-500" /><span className="font-bold">{post.likes || 0}</span></div>
                              <div className="flex items-center gap-1" title="Comments"><MessageSquare className="w-3 h-3 text-cyan-500" /><span className="font-bold">{post.comments || 0}</span></div>
                              <div className="flex items-center gap-1" title="Shares"><Share2 className="w-3 h-3 text-indigo-500" /><span className="font-bold">{post.shares || 0}</span></div>
                              <div className="flex items-center gap-1" title="Saves"><Bookmark className="w-3 h-3 text-amber-500" /><span className="font-bold">{post.saves || 0}</span></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-300">{(post.accounts_engaged || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ HELP MODAL — Penjelasan Metrik + Rumus ═══ */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-emerald-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                Penjelasan Metrik & Rumus
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {/* Metrik dari IG Langsung */}
              <div className="space-y-1 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <p className="font-bold text-purple-400 text-sm">📊 Metrik dari Instagram Langsung</p>
                <p className="text-slate-500 text-[10px] italic mb-2">Data ini diambil langsung dari Instagram Professional Dashboard</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">1. Views</p>
                <p className="text-slate-400">
                  <span className="font-bold text-white">Views</span> adalah total berapa kali konten Anda ditayangkan/tampil di layar pengguna. Satu orang bisa menonton berulang kali.
                  <br /><span className="font-bold text-purple-400">Breakdown:</span> Persentase views dari Followers vs Non-followers, dan dari Posts vs Stories — langsung dari IG.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">2. Accounts Reached</p>
                <p className="text-slate-400">
                  <span className="font-bold text-white">Accounts Reached</span> adalah jumlah akun <span className="italic">unik</span> yang melihat konten Anda minimal sekali. Berbeda dengan Views yang bisa dihitung berulang.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">3. Interactions</p>
                <p className="text-slate-400">
                  <span className="font-bold text-white">Interactions</span> adalah total interaksi (Likes, Comments, Shares, Saves) dari audiens.
                  <br /><span className="font-bold text-purple-400">Breakdown:</span> Persentase dari Followers vs Non-followers, dan dari Posts vs Stories.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">4. Accounts Engaged</p>
                <p className="text-slate-400">
                  <span className="font-bold text-white">Accounts Engaged</span> adalah jumlah akun unik yang berinteraksi dengan konten Anda (subset dari Accounts Reached).
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-400">5. Profile (Visits, Link Taps)</p>
                <p className="text-slate-400">
                  <span className="font-bold text-white">Profile Visits</span> = berapa kali profil dikunjungi. <span className="font-bold text-white">External Link Taps</span> = berapa kali link di bio di-tap.
                </p>
              </div>

              {/* Metrik Computed */}
              <div className="space-y-1 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="font-bold text-amber-400 text-sm">🧮 Metrik yang Dihitung Otomatis (Computed)</p>
                <p className="text-slate-500 text-[10px] italic mb-2">Data ini dihitung dari data performa secara spesifik</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-amber-400">6. Engagement Rate</p>
                <p className="text-slate-400">
                  Mengukur seberapa aktif audiens yang dijangkau untuk berinteraksi.
                  <br />
                  <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded-md inline-block mt-1 text-white">
                    Engagement Rate = (Total Interactions ÷ Accounts Reached) × 100
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-amber-400">7. Profile Activity (per Post)</p>
                <p className="text-slate-400">
                  Total aktivitas profil yang dihasilkan oleh sebuah postingan.
                  <br />
                  <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded-md inline-block mt-1 text-white">
                    Profile Activity = Profile Visits + Ext. Link Taps + Biz Addr Taps + Follows
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-amber-400">8. Total Interactions (per Post — fallback)</p>
                <p className="text-slate-400">
                  Jika tidak diisi manual, dihitung otomatis dari detail interaksi.
                  <br />
                  <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded-md inline-block mt-1 text-white">
                    Total Interactions = Likes + Comments + Shares + Saves
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button onClick={() => setIsHelpModalOpen(false)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                Pahami & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
