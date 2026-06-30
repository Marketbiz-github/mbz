'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Share2, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Plus,
  X,
  FileText,
  Edit2,
  Trash2,
  ExternalLink,
  Heart,
  MessageSquare,
  Printer,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

// Authentic Social Media Logo Icons (SVGs)
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

export default function SosmedDetailPage() {
  const { id } = useParams() as { id: string };
  const { role, user } = useAuth();
  const supabase = createClient();

  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [activeTab, setActiveTab] = useState<'account' | 'posts'>('account');
  const [loading, setLoading] = useState(true);

  // Form input logs (Account)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logPlatform, setLogPlatform] = useState('instagram');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logReach, setLogReach] = useState('');
  const [logImpressions, setLogImpressions] = useState('');
  const [logEngagement, setLogEngagement] = useState('');
  const [logPosts, setLogPosts] = useState('');
  const [logProduced, setLogProduced] = useState('');
  const [logFollowers, setLogFollowers] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Form input posts (Post Level)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postPlatform, setPostPlatform] = useState('instagram');
  const [postUrl, setPostUrl] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postedAt, setPostedAt] = useState(new Date().toISOString().split('T')[0]);
  const [postReach, setPostReach] = useState('');
  const [postImpressions, setPostImpressions] = useState('');
  const [postLikes, setPostLikes] = useState('');
  const [postComments, setPostComments] = useState('');
  const [postShares, setPostShares] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  // Edit / Delete post states
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);

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

      // 2. Fetch reports log
      const { data: repData, error: repErr } = await supabase
        .from('sosmed_reports')
        .select('*')
        .eq('project_id', id)
        .order('report_date', { ascending: true });
      if (repErr) throw repErr;
      setReports(repData || []);

      // 3. Fetch tracked posts
      const { data: pstData, error: pstErr } = await supabase
        .from('sosmed_posts')
        .select('*')
        .eq('project_id', id)
        .order('posted_at', { ascending: false });
      if (pstErr) throw pstErr;
      setPosts(pstData || []);

    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (project) {
      const activePlats = project.active_platforms ? project.active_platforms.split(',') : ['instagram', 'tiktok', 'linkedin', 'facebook'];
      if (activePlats.length > 0 && !activePlats.includes(selectedPlatform)) {
        setSelectedPlatform(activePlats[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);
  // Removed original fetchProjectData declaration block

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logReach || !logImpressions || !logEngagement) {
      alert('Metrik Reach, Impressions, dan Engagement wajib diisi.');
      return;
    }

    setSavingLog(true);
    try {
      const { error: insertErr } = await supabase
        .from('sosmed_reports')
        .insert({
          project_id: id,
          platform: logPlatform,
          report_date: logDate,
          reach: parseInt(logReach) || 0,
          impressions: parseInt(logImpressions) || 0,
          engagement: parseInt(logEngagement) || 0,
          total_posts: parseInt(logPosts) || 0,
          content_produced: parseInt(logProduced) || 0,
          followers_gained: parseInt(logFollowers) || 0,
          notes: logNotes
        });

      if (insertErr) throw insertErr;

      setIsLogModalOpen(false);
      setLogReach('');
      setLogImpressions('');
      setLogEngagement('');
      setLogPosts('');
      setLogProduced('');
      setLogFollowers('');
      setLogNotes('');
      fetchProjectData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postUrl.trim()) {
      alert('Judul postingan dan URL tautan wajib diisi.');
      return;
    }

    const likesNum = parseInt(postLikes) || 0;
    const commentsNum = parseInt(postComments) || 0;
    const sharesNum = parseInt(postShares) || 0;
    const calculatedEngagement = likesNum + commentsNum + sharesNum;

    setSavingPost(true);
    try {
      const { error: insertErr } = await supabase
        .from('sosmed_posts')
        .insert({
          project_id: id,
          platform: postPlatform,
          post_url: postUrl,
          post_title: postTitle,
          posted_at: new Date(postedAt).toISOString(),
          reach: parseInt(postReach) || 0,
          impressions: parseInt(postImpressions) || 0,
          engagement: calculatedEngagement,
          likes: likesNum,
          comments: commentsNum,
          shares: sharesNum,
          notes: postNotes
        });

      if (insertErr) throw insertErr;

      setIsPostModalOpen(false);
      setPostTitle('');
      setPostUrl('');
      setPostReach('');
      setPostImpressions('');
      setPostLikes('');
      setPostComments('');
      setPostShares('');
      setPostNotes('');
      fetchProjectData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingPost(false);
    }
  };

  const openEditPostModal = (postItem: any) => {
    setEditingPost(postItem);
    setPostPlatform(postItem.platform || 'instagram');
    setPostUrl(postItem.post_url || '');
    setPostTitle(postItem.post_title || '');
    setPostedAt(new Date(postItem.posted_at).toISOString().split('T')[0]);
    setPostReach(postItem.reach?.toString() || '');
    setPostImpressions(postItem.impressions?.toString() || '');
    setPostLikes(postItem.likes?.toString() || '');
    setPostComments(postItem.comments?.toString() || '');
    setPostShares(postItem.shares?.toString() || '');
    setPostNotes(postItem.notes || '');
    setIsEditPostModalOpen(true);
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const likesNum = parseInt(postLikes) || 0;
    const commentsNum = parseInt(postComments) || 0;
    const sharesNum = parseInt(postShares) || 0;
    const calculatedEngagement = likesNum + commentsNum + sharesNum;

    setSavingPost(true);
    try {
      const { error: updateErr } = await supabase
        .from('sosmed_posts')
        .update({
          platform: postPlatform,
          post_url: postUrl,
          post_title: postTitle,
          posted_at: new Date(postedAt).toISOString(),
          reach: parseInt(postReach) || 0,
          impressions: parseInt(postImpressions) || 0,
          engagement: calculatedEngagement,
          likes: likesNum,
          comments: commentsNum,
          shares: sharesNum,
          notes: postNotes
        })
        .eq('id', editingPost.id);

      if (updateErr) throw updateErr;

      setIsEditPostModalOpen(false);
      setEditingPost(null);
      fetchProjectData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini dari tracking?')) return;
    try {
      const { error: delErr } = await supabase
        .from('sosmed_posts')
        .delete()
        .eq('id', postId);

      if (delErr) throw delErr;
      fetchProjectData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getSocialPlatformData = () => {
    const platformReports = reports.filter(r => r.platform === selectedPlatform);

    if (platformReports.length === 0) {
      return {
        hasData: false,
        stats: [
          { label: 'Total Reach', value: '0', growth: 'Manual', icon: TrendingUp },
          { label: 'Total Impressions', value: '0', growth: 'Manual', icon: Share2 },
          { label: 'Total Engagement', value: '0', growth: 'Manual', icon: Users },
          { label: 'Engagement Rate', value: '0%', growth: 'Computed', icon: MousePointer2 }
        ],
        chart: [],
        totalPosts: 0,
        contentProduced: 0,
        followersGained: 0
      };
    }

    const totalReach = platformReports.reduce((sum, r) => sum + (r.reach || 0), 0);
    const totalImpressions = platformReports.reduce((sum, r) => sum + (r.impressions || 0), 0);
    const totalEngagement = platformReports.reduce((sum, r) => sum + (r.engagement || 0), 0);
    const totalPosts = platformReports.reduce((sum, r) => sum + (r.total_posts || 0), 0);
    const contentProduced = platformReports.reduce((sum, r) => sum + (r.content_produced || 0), 0);
    const followersGained = platformReports.reduce((sum, r) => sum + (r.followers_gained || 0), 0);
    const avgEngRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) + '%' : '0%';

    const chart = platformReports.map(r => ({
      name: new Date(r.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      reach: r.reach,
      engagement: r.engagement
    }));

    return {
      hasData: true,
      stats: [
        { label: 'Total Reach', value: totalReach.toLocaleString(), growth: 'Dinamis', icon: TrendingUp },
        { label: 'Total Impressions', value: totalImpressions.toLocaleString(), growth: 'Dinamis', icon: Share2 },
        { label: 'Total Engagement', value: totalEngagement.toLocaleString(), growth: 'Dinamis', icon: Users },
        { label: 'Engagement Rate', value: avgEngRate, growth: 'Computed', icon: MousePointer2 }
      ],
      chart,
      totalPosts,
      contentProduced,
      followersGained
    };
  };

  const getTrackedPosts = () => {
    const platformPosts = posts.filter(p => p.platform === selectedPlatform);
    return {
      list: platformPosts,
      hasData: platformPosts.length > 0
    };
  };

  const handleDownloadExcel = () => {
    if (activeTab === 'account') {
      const platformReports = reports.filter(r => r.platform === selectedPlatform);
      if (platformReports.length === 0) {
        alert('Tidak ada log data untuk platform ini.');
        return;
      }

      const headers = ['ID', 'Tanggal', 'Platform', 'Reach', 'Impressions', 'Engagement', 'Total Posts', 'Content Produced', 'Followers Gained', 'Notes'];
      const csvRows = [headers.join(',')];

      for (const r of platformReports) {
        const row = [
          r.id,
          r.report_date,
          r.platform,
          r.reach || 0,
          r.impressions || 0,
          r.engagement || 0,
          r.total_posts || 0,
          r.content_produced || 0,
          r.followers_gained || 0,
          `"${(r.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Sosmed_Report_Akun_${selectedPlatform}_${project?.name}.csv`);
      a.click();
    } else {
      const platformPosts = posts.filter(p => p.platform === selectedPlatform);
      if (platformPosts.length === 0) {
        alert('Tidak ada log postingan untuk platform ini.');
        return;
      }

      const headers = ['ID', 'Judul Post', 'Platform', 'Upload Date', 'URL Tautan', 'Reach', 'Impressions', 'Engagement', 'Likes', 'Comments', 'Shares', 'Notes'];
      const csvRows = [headers.join(',')];

      for (const p of platformPosts) {
        const row = [
          p.id,
          `"${p.post_title.replace(/"/g, '""')}"`,
          p.platform,
          p.posted_at,
          p.post_url,
          p.reach || 0,
          p.impressions || 0,
          p.engagement || 0,
          p.likes || 0,
          p.comments || 0,
          p.shares || 0,
          `"${(p.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Sosmed_Report_Postingan_${selectedPlatform}_${project?.name}.csv`);
      a.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CSS print-friendly styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, .print\:hidden, button, a.print\:hidden {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .high-tech-card {
            background: transparent !important;
            border: 1px solid #e2e8f0 !important;
            color: black !important;
            box-shadow: none !important;
          }
          .text-white {
            color: black !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #475569 !important;
          }
        }
      `}</style>

      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <Link 
            href="/sosmed"
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all print:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {project?.name}
              </h1>
              <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                project?.status === 'active' 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              )}>
                {project?.status === 'active' ? 'Ongoing' : project?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
              Klien: {project?.clients?.name || '-'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 print:hidden"
          >
            <Printer className="w-4 h-4" />
            CETAK PDF
          </button>
          
          <button
            onClick={handleDownloadExcel}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 print:hidden"
          >
            <FileText className="w-4 h-4" />
            UNDUH CSV
          </button>
          
          {role === 'admin' && (
            <>
              {activeTab === 'account' ? (
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="bg-cyan-500 text-black px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 print:hidden"
                >
                  <Plus className="w-4 h-4" />
                  TAMBAH LOG AKUN
                </button>
              ) : (
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-cyan-500 text-black px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 print:hidden"
                >
                  <Plus className="w-4 h-4" />
                  TRACK POST BARU
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Platform & Section Selector tabs */}
      <div className="flex flex-col md:flex-row justify-between border-b border-white/10 gap-4 pb-2 print:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {filteredPlatforms.map(p => {
            const Icon = p.icon;
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border select-none whitespace-nowrap",
                  isActive 
                    ? "bg-white/10 border-white/20 text-white shadow-lg"
                    : "bg-transparent border-transparent text-slate-500 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Tab selector between Account and Post Tracking */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 items-center">
          <button
            onClick={() => setActiveTab('account')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === 'account' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Analisis Akun
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === 'posts' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Analisis Per Post
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: ANALISIS AKUN */}
      {activeTab === 'account' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {currentData.stats.map((s: any, idx: number) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="high-tech-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full print:hidden">
                      {s.growth}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{s.label}</h4>
                    <p className="text-xl md:text-2xl font-bold text-white mt-1">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {!currentData.hasData ? (
            <div className="high-tech-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <div className="max-w-md">
                <h4 className="text-white font-bold text-sm">Belum Ada Log Data Akun</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Belum ada log histori performa sosial media yang terdaftar untuk platform {selectedPlatform.toUpperCase()}. Silakan input data performa menggunakan tombol di kanan atas.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Secondary metrics (postings, content produced, followers) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="high-tech-card p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Postingan</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.totalPosts}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                    <Printer className="w-5 h-5" />
                  </div>
                </div>
                <div className="high-tech-card p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Konten Diproduksi</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentData.contentProduced}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="high-tech-card p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Penambahan Followers</p>
                    <h3 className="text-2xl font-bold text-white mt-1">+{currentData.followersGained}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Chart Graphic Area */}
              <div className="high-tech-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">Tren Reach vs Engagement (Akun)</h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentData.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={platformColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={platformColor} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="reach" name="Reach" stroke={platformColor} fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
                      <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#818cf8" fillOpacity={1} fill="url(#colorEngage)" strokeWidth={2} />
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
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40">Tanggal</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reach</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impressions</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postingan</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports
                        .filter(r => r.platform === selectedPlatform)
                        .map(r => (
                          <tr key={r.id} className="hover:bg-white/2 transition-colors text-xs text-white">
                            <td className="px-6 py-4 font-mono text-slate-400">
                              {new Date(r.report_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </td>
                            <td className="px-6 py-4 font-bold">{r.reach?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-300">{r.impressions?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-300">{r.engagement?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400">{r.total_posts || 0} posts</td>
                            <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate" title={r.notes}>
                              {r.notes || '-'}
                            </td>
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

      {/* RENDER TAB 2: ANALISIS PER POST (TRACKED POSTS) */}
      {activeTab === 'posts' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!trackedPosts.hasData ? (
            <div className="high-tech-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <div className="max-w-md">
                <h4 className="text-white font-bold text-sm">Belum Ada Postingan yang Di-track</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Belum ada postingan individual yang terdaftar untuk platform {selectedPlatform.toUpperCase()}. Silakan tambahkan postingan baru menggunakan tombol di kanan atas.
                </p>
              </div>
            </div>
          ) : (
            <div className="high-tech-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daftar Postingan yang Di-track</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">No</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul & Detail Postingan</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Upload</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tautan URL</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrik Performa</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Likes / Komen / Shares</th>
                      {role === 'admin' && (
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-28 print:hidden">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trackedPosts.list.map((post: any, idx: number) => {
                      return (
                        <tr key={post.id || idx} className="hover:bg-white/2 transition-colors text-xs text-white">
                          <td className="px-6 py-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-bold text-white block max-w-xs truncate">{post.post_title}</span>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                                Platform: {post.platform?.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(post.posted_at || post.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </td>
                          <td className="px-6 py-4">
                            <a 
                              href={post.post_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-cyan-400 hover:underline flex items-center gap-1 print:hidden"
                            >
                              Buka Postingan
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <span className="hidden print:inline font-mono text-[10px] text-slate-500">{post.post_url}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <span className="text-slate-500">Reach:</span>
                                <span className="font-bold text-white">{post.reach?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-slate-500">Engage:</span>
                                <span className="font-bold text-cyan-400">{post.engagement?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4 text-slate-400">
                              <div className="flex items-center gap-1.5" title="Likes">
                                <Heart className="w-3.5 h-3.5 text-pink-500" />
                                <span className="font-bold">{post.likes?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex items-center gap-1.5" title="Comments">
                                <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                                <span className="font-bold">{post.comments?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex items-center gap-1.5" title="Shares">
                                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="font-bold">{post.shares?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </td>
                          {role === 'admin' && (
                            <td className="px-6 py-4 text-right print:hidden">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openEditPostModal(post)}
                                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                                  title="Edit Metrik Post"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                  title="Hapus Post"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add Log Account (TAB 1) */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddLog}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button 
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Input Log Performa Akun</h3>
              <p className="text-xs text-slate-500 mt-1">Tambahkan log data performa sosial media terbaru secara global.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Platform</label>
                <select 
                  value={logPlatform}
                  onChange={(e) => setLogPlatform(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                >
                  {filteredPlatforms.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-950">{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tanggal Log</label>
                <input 
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Reach</label>
                <input 
                  type="number"
                  value={logReach}
                  onChange={(e) => setLogReach(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Impressions</label>
                <input 
                  type="number"
                  value={logImpressions}
                  onChange={(e) => setLogImpressions(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Engagement</label>
                <input 
                  type="number"
                  value={logEngagement}
                  onChange={(e) => setLogEngagement(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Posts</label>
                <input 
                  type="number"
                  value={logPosts}
                  onChange={(e) => setLogPosts(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Produced</label>
                <input 
                  type="number"
                  value={logProduced}
                  onChange={(e) => setLogProduced(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Followers</label>
                <input 
                  type="number"
                  value={logFollowers}
                  onChange={(e) => setLogFollowers(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Catatan Tambahan</label>
              <textarea 
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Catatan update performa campaign..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 min-h-[60px]"
              />
            </div>

            <button 
              type="submit"
              disabled={savingLog}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingLog ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SIMPAN LOG DATA
            </button>
          </form>
        </div>
      )}

      {/* Modal Add Track Post (TAB 2) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddPost}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button 
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Track Postingan Baru</h3>
              <p className="text-xs text-slate-500 mt-1">Daftarkan URL postingan spesifik untuk dipantau secara detail.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Platform</label>
                <select 
                  value={postPlatform}
                  onChange={(e) => setPostPlatform(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                >
                  {filteredPlatforms.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-950">{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tanggal Upload</label>
                <input 
                  type="date"
                  value={postedAt}
                  onChange={(e) => setPostedAt(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Judul / Caption Post</label>
              <input 
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Contoh: Reels Launching Baju Q3"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tautan URL Post</label>
              <input 
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Reach</label>
                <input 
                  type="number"
                  value={postReach}
                  onChange={(e) => setPostReach(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Impressions</label>
                <input 
                  type="number"
                  value={postImpressions}
                  onChange={(e) => setPostImpressions(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Likes</label>
                <input 
                  type="number"
                  value={postLikes}
                  onChange={(e) => setPostLikes(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Comments</label>
                <input 
                  type="number"
                  value={postComments}
                  onChange={(e) => setPostComments(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Shares</label>
                <input 
                  type="number"
                  value={postShares}
                  onChange={(e) => setPostShares(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={savingPost}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              MULAI TRACK POSTINGAN
            </button>
          </form>
        </div>
      )}

      {/* Modal Edit Track Post (TAB 2) */}
      {isEditPostModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleEditPost}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button 
              type="button"
              onClick={() => {
                setIsEditPostModalOpen(false);
                setEditingPost(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Edit Track Post</h3>
              <p className="text-xs text-slate-500 mt-1">Ubah metrik performa postingan spesifik ini.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Platform</label>
                <select 
                  value={postPlatform}
                  onChange={(e) => setPostPlatform(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                >
                  {filteredPlatforms.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-950">{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tanggal Upload</label>
                <input 
                  type="date"
                  value={postedAt}
                  onChange={(e) => setPostedAt(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Judul / Caption Post</label>
              <input 
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Contoh: Reels Launching Baju Q3"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tautan URL Post</label>
              <input 
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Reach</label>
                <input 
                  type="number"
                  value={postReach}
                  onChange={(e) => setPostReach(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Impressions</label>
                <input 
                  type="number"
                  value={postImpressions}
                  onChange={(e) => setPostImpressions(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Likes</label>
                <input 
                  type="number"
                  value={postLikes}
                  onChange={(e) => setPostLikes(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Comments</label>
                <input 
                  type="number"
                  value={postComments}
                  onChange={(e) => setPostComments(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Shares</label>
                <input 
                  type="number"
                  value={postShares}
                  onChange={(e) => setPostShares(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={savingPost}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SIMPAN PERUBAHAN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
