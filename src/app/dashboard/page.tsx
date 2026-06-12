'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Share2, 
  ArrowUpRight, 
  ArrowDownRight,
  Camera,
  Video,
  Briefcase,
  ChevronLeft,
  Search,
  ExternalLink,
  ChevronRight,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- DATA CLIENT LIST ---
const clientsSummary = [
  { id: 1, name: 'TechNova Solutions', industry: 'Technology', totalReach: '1.2M', avgEng: '4.8%', status: 'Active', growth: '+12%' },
  { id: 2, name: 'GreenLife Organics', industry: 'E-commerce', totalReach: '850K', avgEng: '5.2%', status: 'Active', growth: '+8%' },
  { id: 3, name: 'Urban Styles Inc.', industry: 'Fashion', totalReach: '2.4M', avgEng: '3.9%', status: 'Warning', growth: '-2%' },
  { id: 4, name: 'EcoWare Ltd.', industry: 'Manufacturing', totalReach: '120K', avgEng: '2.1%', status: 'Active', growth: '+5%' },
  { id: 5, name: 'Swift Logistics', industry: 'Services', totalReach: '450K', avgEng: '4.5%', status: 'Active', growth: '+15%' },
];

// --- DATA DETAIL (Platform Specific) ---
const platformData: Record<string, any> = {
  instagram: {
    color: '#E1306C',
    stats: [
      { label: 'IG Reach', value: '450K', growth: '+15.2%', icon: TrendingUp, color: 'text-pink-400' },
      { label: 'New Followers', value: '12.2K', growth: '+5.2%', icon: Users, color: 'text-pink-400' },
      { label: 'Eng. Rate', value: '4.2%', growth: '+1.1%', icon: MousePointer2, color: 'text-pink-400' },
      { label: 'Reels Shares', value: '3.1K', growth: '+22.3%', icon: Share2, color: 'text-pink-400' },
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
      { label: 'TT Views', value: '1.2M', growth: '+45.8%', icon: TrendingUp, color: 'text-cyan-400' },
      { label: 'New Followers', value: '28.5K', growth: '+12.4%', icon: Users, color: 'text-cyan-400' },
      { label: 'Completion Rate', value: '18.5%', growth: '+2.5%', icon: MousePointer2, color: 'text-cyan-400' },
      { label: 'TT Shares', value: '15.4K', growth: '+35.1%', icon: Share2, color: 'text-cyan-400' },
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
      { label: 'LI Impressions', value: '85K', growth: '+8.2%', icon: TrendingUp, color: 'text-blue-400' },
      { label: 'New Connections', value: '450', growth: '+2.1%', icon: Users, color: 'text-blue-400' },
      { label: 'Click Rate', value: '2.8%', growth: '-0.5%', icon: MousePointer2, color: 'text-blue-400' },
      { label: 'Reposts', value: '120', growth: '+14.3%', icon: Share2, color: 'text-blue-400' },
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
];

export default function KPIPage() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  const handleViewDetail = (client: any) => {
    setSelectedClient(client);
    setView('detail');
  };

  const currentData = platformData[selectedPlatform];

  // --- RENDER LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">KPI Dashboard</h1>
            <p className="text-slate-400 mt-1">Select a client to view detailed performance metrics.</p>
          </div>
          <Link 
            href="/crm"
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Settings2 className="w-4 h-4" />
            MANAGE CLIENTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="high-tech-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Avg. Growth</p>
              <h3 className="text-2xl font-bold text-white">+8.4%</h3>
            </div>
          </div>
          <div className="high-tech-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Accounts</p>
              <h3 className="text-2xl font-bold text-white">128</h3>
            </div>
          </div>
          <div className="high-tech-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MousePointer2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Active Campaigns</p>
              <h3 className="text-2xl font-bold text-white">34</h3>
            </div>
          </div>
        </div>

        <div className="high-tech-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search clients performance..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Industry</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reach</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Engagement</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Performance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientsSummary.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
                          {client.name[0]}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{client.industry}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{client.totalReach}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{client.avgEng}</td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        client.growth.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {client.growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {client.growth}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetail(client)}
                        className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all group/btn flex items-center gap-2 ml-auto"
                      >
                        <span className="text-xs font-bold">INSIGHTS</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DETAIL VIEW ---
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{selectedClient.name}</h1>
            <p className="text-sm text-slate-400 mt-1">Detailed performance metrics per social platform.</p>
          </div>
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && (
                  p.id === 'instagram' ? "text-pink-400" : 
                  p.id === 'tiktok' ? "text-cyan-400" : "text-blue-400"
                ))} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {currentData.stats.map((stat: any, i: number) => (
          <div key={i} className="high-tech-card p-6 group relative overflow-hidden">
            <div className={cn(
              "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
              selectedPlatform === 'instagram' ? "bg-pink-500" : 
              selectedPlatform === 'tiktok' ? "bg-cyan-500" : "bg-blue-500"
            )}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn("flex items-center text-xs font-medium", stat.growth.startsWith('+') ? 'text-emerald-400' : 'text-red-400')}>
                {stat.growth}
                {stat.growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white transition-colors">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

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
              <AreaChart data={currentData.chart}>
                <defs>
                  <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentData.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={currentData.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: currentData.color }}
                />
                <Area type="monotone" dataKey="engagement" stroke={currentData.color} fillOpacity={1} fill="url(#colorPlatform)" strokeWidth={3} />
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
              <BarChart data={currentData.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: currentData.color }}
                />
                <Bar dataKey="reach" fill={currentData.color} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="high-tech-card p-6 bg-gradient-to-r from-white/5 to-transparent border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border",
            selectedPlatform === 'instagram' ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : 
            selectedPlatform === 'tiktok' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          )}>
            {selectedPlatform === 'instagram' && <Camera className="w-8 h-8" />}
            {selectedPlatform === 'tiktok' && <Video className="w-8 h-8" />}
            {selectedPlatform === 'linkedin' && <Briefcase className="w-8 h-8" />}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white">Platform Insight</h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mt-1">
              {selectedPlatform === 'instagram' && "Engagement on Reels is up by 22%. Consider increasing the frequency of short-form video content to maintain momentum."}
              {selectedPlatform === 'tiktok' && "Completion rates for educational content are peaking. The 'TechNova Tips' series is driving the majority of new followers."}
              {selectedPlatform === 'linkedin' && "Thought leadership articles are seeing higher repost rates. Focus on B2B networking and professional industry insights."}
            </p>
          </div>
          <button className="w-full md:w-auto px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold text-white transition-all">
            VIEW FULL AUDIT
          </button>
        </div>
      </div>
    </div>
  );
}
