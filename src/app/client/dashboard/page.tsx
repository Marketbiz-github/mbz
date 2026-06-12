'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Eye, 
  ArrowUpRight, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    campaigns: [],
    logs: [],
    stats: {
      reach: 0,
      engagement: 0,
      impressions: 0,
      clicks: 0
    }
  });

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
          // 2. Get campaigns for this client
          const { data: campaigns } = await supabase
            .from('campaigns')
            .select('*')
            .eq('client_id', clientInfo.id);

          if (campaigns && campaigns.length > 0) {
            const campaignIds = campaigns.map(c => c.id);

            // 3. Get performance logs
            const { data: logs } = await supabase
              .from('performance_logs')
              .select('*')
              .in('campaign_id', campaignIds)
              .order('log_date', { ascending: false })
              .limit(100);

            // Calculate aggregate stats
            const stats = (logs || []).reduce((acc: any, log: any) => ({
              reach: acc.reach + (log.reach || 0),
              engagement: acc.engagement + (log.engagement || 0),
              impressions: acc.impressions + (log.impressions || 0),
              clicks: acc.clicks + (log.clicks || 0),
            }), { reach: 0, engagement: 0, impressions: 0, clicks: 0 });

            setData({ campaigns, logs: logs || [], stats, clientName: clientInfo.name });
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
    return <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const statCards = [
    { label: 'Total Reach', value: data.stats.reach.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Impressions', value: data.stats.impressions.toLocaleString(), icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Clicks', value: data.stats.clicks.toLocaleString(), icon: MousePointer2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Engagement', value: data.stats.engagement.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hello, {data.clientName || 'Partner'}!
          </h1>
          <p className="text-slate-400 mt-1">Here's a summary of your active services and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-all">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Download className="w-4 h-4" />
            Download Summary
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Services</h2>
            <button className="text-sm text-indigo-400 hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.campaigns.length > 0 ? data.campaigns.map((campaign: any) => (
              <div key={campaign.id} className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-slate-900 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-indigo-500/20">
                      {campaign.platform}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3">{campaign.name}</h3>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] text-slate-500">
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="text-slate-500">Progress</div>
                  <div className="text-indigo-400 font-bold">75%</div>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-3/4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
              </div>
            )) : (
              <div className="col-span-full p-8 text-center bg-slate-900/30 border border-dashed border-white/10 rounded-2xl">
                <p className="text-slate-500">No active services found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reports Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Recent Logs</h2>
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reach</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {data.logs.length > 0 ? data.logs.slice(0, 10).map((log: any) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <span className="text-sm text-slate-300 font-medium">
                    {new Date(log.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{log.reach.toLocaleString()}</span>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500 text-sm">No recent logs.</div>
              )}
            </div>
            <button className="w-full p-4 text-sm font-bold text-indigo-400 hover:bg-white/5 transition-colors border-t border-white/5">
              Download Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
