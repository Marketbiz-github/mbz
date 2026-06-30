'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Activity,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  Mail,
  Globe,
  Settings2,
  FileSpreadsheet
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ServiceStat {
  name: string;
  count: number;
  color: string;
}

export default function DashboardSummaryPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [totalClients, setTotalClients] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Dashboard Overview | MarketBiz";
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Clients Count
      const { count: clientsCount, error: clientsErr } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      if (clientsErr) throw clientsErr;
      setTotalClients(clientsCount || 0);

      // 2. Fetch Projects Count
      const { data: projectsData, error: projectsErr } = await supabase
        .from('projects')
        .select('id, services(name)');
      if (projectsErr) throw projectsErr;
      setTotalProjects(projectsData?.length || 0);

      // 3. Fetch Services Count
      const { count: servicesCount, error: servicesErr } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });
      if (servicesErr) throw servicesErr;
      setTotalServices(servicesCount || 0);

      // 4. Fetch Client Users Count (profiles)
      const { count: usersCount, error: usersErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (usersErr) throw usersErr;
      setTotalUsers(usersCount || 0);

      // 5. Group Projects by Service to get stats
      const serviceCounts: Record<string, number> = {};
      projectsData?.forEach((p: any) => {
        const svcName = p.services?.name || 'Other';
        serviceCounts[svcName] = (serviceCounts[svcName] || 0) + 1;
      });

      const colors = ['bg-cyan-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];
      const textColors = ['text-cyan-400', 'text-purple-400', 'text-emerald-400', 'text-amber-400', 'text-indigo-400'];
      const borderColors = ['border-cyan-500/20', 'border-purple-500/20', 'border-emerald-500/20', 'border-amber-500/20', 'border-indigo-500/20'];
      
      const statsList: ServiceStat[] = Object.keys(serviceCounts).map((key, index) => ({
        name: key,
        count: serviceCounts[key],
        color: colors[index % colors.length]
      }));
      setServiceStats(statsList);

      // 6. Generate dynamic recent activity list from actual projects created
      const { data: recentProj, error: recentProjErr } = await supabase
        .from('projects')
        .select('id, name, created_at, clients(name), services(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentProjErr && recentProj) {
        const activities = recentProj.map((p: any) => ({
          id: p.id,
          type: 'project',
          title: `Project "${p.name}" created`,
          description: `Service: ${p.services?.name || 'N/A'} • Client: ${p.clients?.name || 'N/A'}`,
          time: new Date(p.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        setRecentActivities(activities);
      }

    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message || 'Failed to load dashboard overview data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading summary dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="high-tech-card p-6 border-red-500/20 flex flex-col items-center justify-center py-12 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Summary Dashboard</h1>
        <p className="text-slate-400 mt-1">High-level real-time overview of all clients, projects, and active services.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Active Clients */}
        <div className="high-tech-card p-6 flex flex-col gap-4 border-cyan-500/20 bg-linear-to-br from-cyan-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-mono">{totalClients}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Total Active Clients</p>
          </div>
        </div>
        
        {/* Total Active Projects */}
        <div className="high-tech-card p-6 flex flex-col gap-4 border-purple-500/20 bg-linear-to-br from-purple-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-mono">{totalProjects}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Total Active Projects</p>
          </div>
        </div>

        {/* Services Running */}
        <div className="high-tech-card p-6 flex flex-col gap-4 border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-mono">{totalServices}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Services Running</p>
          </div>
        </div>
        
        {/* Total Client Users */}
        <div className="high-tech-card p-6 flex flex-col gap-4 border-amber-500/20 bg-linear-to-br from-amber-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-mono">{totalUsers}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Total Client Users</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients/Projects per Service Distribution */}
        <div className="high-tech-card p-6 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-white">Projects per Service Distribution</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
              Persentase kontribusi jumlah proyek aktif per kategori layanan terhadap total seluruh proyek ({totalProjects} proyek).
              <br />
              <span className="font-mono text-[9px] text-cyan-400">Formula: (Jumlah Proyek Layanan / {totalProjects}) × 100%</span>
            </p>
          </div>
          
          {serviceStats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-white/1 border-dashed min-h-[200px]">
              <p className="text-xs text-slate-500">No services active</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
              {serviceStats.map((stat, i) => {
                const percentage = totalProjects > 0 ? (stat.count / totalProjects) * 100 : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>{stat.name}</span>
                      <span className="font-mono text-white">{stat.count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${stat.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Recent Activities Log */}
        <div className="high-tech-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Recent Projects Log</h3>
          
          {recentActivities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-white/1 border-dashed min-h-[200px]">
              <p className="text-xs text-slate-500">No recent activities found</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center divide-y divide-white/5">
              {recentActivities.map((act, i) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
