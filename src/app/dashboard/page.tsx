'use client';

import React from 'react';
import { 
  Users, 
  Briefcase, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardSummaryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Summary Dashboard</h1>
        <p className="text-slate-400 mt-1">High-level overview of all clients and active projects.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="high-tech-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">24</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mt-1">Total Active Clients</p>
          </div>
        </div>
        
        <div className="high-tech-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +5%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">56</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mt-1">Total Active Projects</p>
          </div>
        </div>

        <div className="high-tech-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">12</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mt-1">Services Running</p>
          </div>
        </div>
        
        <div className="high-tech-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">142</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mt-1">Total Client Users</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="high-tech-card p-6 min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-4">Clients per Service</h3>
          <div className="flex h-48 items-center justify-center border border-white/10 rounded-xl bg-white/5 border-dashed">
            <p className="text-slate-400">Chart / Graphic Coming Soon</p>
          </div>
        </div>
        
        <div className="high-tech-card p-6 min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="flex h-48 items-center justify-center border border-white/10 rounded-xl bg-white/5 border-dashed">
            <p className="text-slate-400">Activity Log Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
