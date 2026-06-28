'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Mail,
  Camera,
  Video,
  Briefcase,
  CheckCircle,
  Inbox,
  Loader2,
  Share2
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

// --- Static Social Media Fallback Data ---
const platformStaticData: Record<string, any> = {
  instagram: {
    color: '#E1306C',
    stats: [
      { label: 'IG Reach', value: '450K', growth: '+15.2%', icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { label: 'New Followers', value: '12.2K', growth: '+5.2%', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { label: 'Eng. Rate', value: '4.2%', growth: '+1.1%', icon: MousePointer2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { label: 'Reels Shares', value: '3.1K', growth: '+22.3%', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    ],
    chart: [
      { name: 'Mon', reach: 4000, engagement: 2400 },
      { name: 'Tue', reach: 3000, engagement: 1398 },
      { name: 'Wed', reach: 5000, engagement: 3800 },
      { name: 'Thu', reach: 2780, engagement: 3908 },
      { name: 'Fri', reach: 1890, engagement: 4800 },
      { name: 'Sat', reach: 2390, engagement: 3800 },
      { name: 'Sun', reach: 3490, engagement: 4300 },
    ]
  },
  tiktok: {
    color: '#00F2EA',
    stats: [
      { label: 'TT Views', value: '1.2M', growth: '+45.8%', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { label: 'New Followers', value: '28.5K', growth: '+12.4%', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { label: 'Completion Rate', value: '18.5%', growth: '+2.5%', icon: MousePointer2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { label: 'TT Shares', value: '15.4K', growth: '+35.1%', icon: Share2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    ],
    chart: [
      { name: 'Mon', reach: 8000, engagement: 4400 },
      { name: 'Tue', reach: 9500, engagement: 5398 },
      { name: 'Wed', reach: 12000, engagement: 8800 },
      { name: 'Thu', reach: 10780, engagement: 7908 },
      { name: 'Fri', reach: 14890, engagement: 9800 },
      { name: 'Sat', reach: 13390, engagement: 8800 },
      { name: 'Sun', reach: 15490, engagement: 11300 },
    ]
  },
  linkedin: {
    color: '#0A66C2',
    stats: [
      { label: 'LI Impressions', value: '85K', growth: '+8.2%', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'New Connections', value: '450', growth: '+2.1%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'Click Rate', value: '2.8%', growth: '-0.5%', icon: MousePointer2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'Reposts', value: '120', growth: '+14.3%', icon: Share2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ],
    chart: [
      { name: 'Mon', reach: 1200, engagement: 400 },
      { name: 'Tue', reach: 1500, engagement: 598 },
      { name: 'Wed', reach: 2000, engagement: 800 },
      { name: 'Thu', reach: 1780, engagement: 608 },
      { name: 'Fri', reach: 2200, engagement: 900 },
      { name: 'Sat', reach: 800, engagement: 200 },
      { name: 'Sun', reach: 900, engagement: 250 },
    ]
  }
};

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'tiktok', label: 'TikTok', icon: Video },
  { id: 'linkedin', label: 'LinkedIn', icon: Briefcase },
  { id: 'email', label: 'Email Campaigns', icon: Mail },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('email'); // Default to email as requested

  // Loaded DB states
  const [clientName, setClientName] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [performanceLogs, setPerformanceLogs] = useState<any[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [selectedEmailCampaign, setSelectedEmailCampaign] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchClientData() {
      if (!user) return;

      try {
        // 1. Get client info for this user
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();

        if (clientInfo) {
          setClientName(clientInfo.name);

          // 2. Get campaigns
          const { data: campaignsData } = await supabase
            .from('campaigns')
            .select('*')
            .eq('client_id', clientInfo.id);
          setCampaigns(campaignsData || []);

          if (campaignsData && campaignsData.length > 0) {
            const campaignIds = campaignsData.map(c => c.id);
            // 3. Get performance logs
            const { data: logs } = await supabase
              .from('performance_logs')
              .select('*')
              .in('campaign_id', campaignIds)
              .order('log_date', { ascending: false });
            setPerformanceLogs(logs || []);
          }

          // 4. Get email campaigns
          const { data: emailsData } = await supabase
            .from('email_blast_reports')
            .select('*, projects!inner(client_id)')
            .eq('projects.client_id', clientInfo.id)
            .order('sent_at', { ascending: false });
          
          const formattedEmails = (emailsData || []).map((camp: any) => ({
            ...camp,
            name: camp.campaign_name
          }));

          setEmailCampaigns(formattedEmails);
          if (formattedEmails.length > 0) {
            setSelectedEmailCampaign(formattedEmails[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientData();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500">Loading your reports...</p>
      </div>
    );
  }

  // Calculate dynamic stats for social media
  const getSocialPlatformData = (platformId: string) => {
    const staticData = platformStaticData[platformId];
    const logs = performanceLogs.filter((log: any) => {
      const camp = campaigns.find(c => c.id === log.campaign_id);
      return camp?.platform === platformId;
    });

    if (logs.length === 0) return staticData;

    const totalReach = logs.reduce((sum, l) => sum + (l.reach || 0), 0);
    const totalEngagement = logs.reduce((sum, l) => sum + (l.engagement || 0), 0);
    const avgEngRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) + '%' : '0%';

    const chart = logs
      .slice(-7)
      .map(log => ({
        name: new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' }),
        reach: log.reach,
        engagement: log.engagement
      }));

    return {
      color: staticData.color,
      stats: [
        { label: 'Total Reach', value: totalReach.toLocaleString(), growth: '+12.4%', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Engagements', value: totalEngagement.toLocaleString(), growth: '+8.2%', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Engagement Rate', value: avgEngRate, growth: '+1.5%', icon: MousePointer2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Logged Days', value: logs.length.toString(), growth: 'Stable', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      ],
      chart: chart.length > 0 ? chart : staticData.chart
    };
  };

  const currentSocialData = selectedPlatform !== 'email' ? getSocialPlatformData(selectedPlatform) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hello, {clientName || 'Partner'}!
          </h1>
          <p className="text-slate-400 mt-1">Here's a summary of your active services and performance.</p>
        </div>

        {/* Platform Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                  isActive 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && (
                  p.id === 'instagram' ? "text-pink-400" : 
                  p.id === 'tiktok' ? "text-cyan-400" : 
                  p.id === 'linkedin' ? "text-blue-400" : "text-indigo-400"
                ))} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER EMAIL REPORT (SCREENSHOT REPLICA) */}
      {selectedPlatform === 'email' ? (
        <div className="space-y-6">
          {/* Multiple campaigns selector */}
          {emailCampaigns.length > 1 && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl max-w-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Campaign Report:</span>
              <select
                value={selectedEmailCampaign?.id || ''}
                onChange={(e) => setSelectedEmailCampaign(emailCampaigns.find(ec => ec.id === e.target.value))}
                className="bg-transparent text-sm text-white font-bold focus:outline-none border-b border-white/20 pb-0.5 cursor-pointer"
              >
                {emailCampaigns.map(ec => (
                  <option key={ec.id} value={ec.id} className="bg-slate-900">{ec.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedEmailCampaign ? (
            <div className="space-y-6">
              {/* Campaign Header */}
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Campaign Report: <span className="text-indigo-400">{selectedEmailCampaign.name}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                  <span>Sent {new Date(selectedEmailCampaign.sent_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}</span>
                  {selectedEmailCampaign.utcid && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>UTCID: {selectedEmailCampaign.utcid}</span>
                    </>
                  )}
                  {selectedEmailCampaign.sender && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-medium">{selectedEmailCampaign.sender}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wide pt-1">
                  <CheckCircle className="w-4 h-4" />
                  Done sending
                </div>
              </div>

              {/* Grid Layout (Screenshot replica) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1 */}
                <div className="space-y-6">
                  {/* Recipients */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Recipients</p>
                    <h3 className="text-4xl font-bold text-white">{selectedEmailCampaign.recipients.toLocaleString()}</h3>
                  </div>

                  {/* Open Rate */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Open Rate</p>
                    <h3 className="text-4xl font-bold text-white">
                      {selectedEmailCampaign.opens}{' '}
                      <span className="text-lg font-bold text-indigo-400 ml-1">
                        ({selectedEmailCampaign.recipients > 0 ? ((selectedEmailCampaign.opens / selectedEmailCampaign.recipients) * 100).toFixed(1) : '0'}%)
                      </span>
                    </h3>
                  </div>

                  {/* Click Rate */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Click Rate</p>
                    <h3 className="text-4xl font-bold text-white">
                      {selectedEmailCampaign.clicks}{' '}
                      <span className="text-lg font-bold text-indigo-400 ml-1">
                        ({selectedEmailCampaign.recipients > 0 ? ((selectedEmailCampaign.clicks / selectedEmailCampaign.recipients) * 100).toFixed(1) : '0'}%)
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  {/* Replies */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Replies</p>
                    <h3 className="text-4xl font-bold text-slate-400">
                      {selectedEmailCampaign.replies > 0 ? selectedEmailCampaign.replies : 'No Replies'}
                    </h3>
                  </div>

                  {/* Unsubscribes */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Unsubscribes</p>
                    <h3 className="text-4xl font-bold text-slate-400">
                      {selectedEmailCampaign.unsubscribes > 0 ? selectedEmailCampaign.unsubscribes : 'No Unsubscribes'}
                    </h3>
                  </div>

                  {/* Open Rate Excl Apple */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Open Rate <span className="text-[9px] text-slate-500 lowercase">excluding Apple</span></p>
                      <span className="text-[8px] bg-white/10 px-1 py-0.5 rounded text-slate-400 font-bold uppercase">MPP</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mt-2">
                      {selectedEmailCampaign.opens_excl_apple}{' '}
                      <span className="text-lg font-bold text-indigo-400 ml-1">
                        ({selectedEmailCampaign.recipients > 0 ? ((selectedEmailCampaign.opens_excl_apple / selectedEmailCampaign.recipients) * 100).toFixed(1) : '0'}%)
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                  {/* Chart */}
                  <div className="high-tech-card p-6 border-white/5 bg-white/1 flex flex-col h-[280px]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Activity by Time</h4>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={[
                          { name: 'Recipients', count: selectedEmailCampaign.recipients, fill: '#00f2ea' },
                          { name: 'Opens', count: selectedEmailCampaign.opens, fill: '#6366f1' },
                          { name: 'Clicks', count: selectedEmailCampaign.clicks, fill: '#f59e0b' },
                          { name: 'Replies', count: selectedEmailCampaign.replies, fill: '#94a3b8' }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff', fontSize: 10 }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                            {
                              [
                                { fill: '#00F2EA' },
                                { fill: '#6366F1' },
                                { fill: '#F59E0B' },
                                { fill: '#E2E8F0' }
                              ].map((entry, index) => (
                                <Bar key={`cell-${index}`} dataKey="count" fill={entry.fill} />
                              ))
                            }
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bounces & Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="high-tech-card p-4 border-white/5 bg-white/1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Bounces</p>
                      <h4 className="text-2xl font-bold text-white">
                        {selectedEmailCampaign.bounces}{' '}
                        <span className="text-xs font-medium text-indigo-400 block sm:inline">
                          ({selectedEmailCampaign.recipients > 0 ? ((selectedEmailCampaign.bounces / selectedEmailCampaign.recipients) * 100).toFixed(1) : '0'}%)
                        </span>
                      </h4>
                    </div>

                    <div className="high-tech-card p-4 border-white/5 bg-white/1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Blocks</p>
                      <h4 className="text-2xl font-bold text-white">
                        {selectedEmailCampaign.blocks}{' '}
                        <span className="text-xs font-medium text-indigo-400 block sm:inline">
                          ({selectedEmailCampaign.recipients > 0 ? ((selectedEmailCampaign.blocks / selectedEmailCampaign.recipients) * 100).toFixed(1) : '0'}%)
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="high-tech-card p-4 border-white/5 bg-white/1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Polls</p>
                    <h4 className="text-2xl font-bold text-slate-400">No Polls</h4>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="high-tech-card p-12 text-center flex flex-col items-center justify-center border-indigo-500/10">
              <Inbox className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Campaign Data</h3>
              <p className="text-sm text-slate-500">There are no seeded email campaign reports for your profile.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Social Platforms Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentSocialData?.stats.map((stat: any, i: number) => (
              <div key={i} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20", 
                  selectedPlatform === 'instagram' ? 'bg-pink-500' : 
                  selectedPlatform === 'tiktok' ? 'bg-cyan-500' : 'bg-blue-500'
                )}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex items-center text-xs font-medium text-emerald-400">
                    {stat.growth}
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400 relative z-10">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1 relative z-10">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Social Platforms Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="high-tech-card p-4 md:p-6 h-[350px] md:h-[400px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className={cn(
                  "w-1 h-4 rounded-full",
                  selectedPlatform === 'instagram' ? "bg-pink-500" : 
                  selectedPlatform === 'tiktok' ? "bg-cyan-500" : "bg-blue-500"
                )}></div>
                Performance Trend
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentSocialData?.chart}>
                    <defs>
                      <linearGradient id="colorPlatformClient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentSocialData?.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={currentSocialData?.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: currentSocialData?.color }}
                    />
                    <Area type="monotone" dataKey="engagement" stroke={currentSocialData?.color} fillOpacity={1} fill="url(#colorPlatformClient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="high-tech-card p-4 md:p-6 h-[350px] md:h-[400px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <div className={cn(
                  "w-1 h-4 rounded-full opacity-50",
                  selectedPlatform === 'instagram' ? "bg-pink-500" : 
                  selectedPlatform === 'tiktok' ? "bg-cyan-500" : "bg-blue-500"
                )}></div>
                Reach Distribution
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={currentSocialData?.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                    <Tooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: currentSocialData?.color }}
                    />
                    <Bar dataKey="reach" fill={currentSocialData?.color} radius={[4, 4, 0, 0]} barSize={24} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
