'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Users, 
  Mail, 
  CheckCircle2, 
  BarChart3, 
  Plus, 
  MoreVertical,
  ChevronRight,
  Eye,
  MousePointer2,
  Trash2,
  Settings2
} from 'lucide-react';

const campaigns = [
  { id: 1, name: 'Q4 Product Launch', sent: '12,450', opens: '64%', clicks: '12%', status: 'Active', date: 'Oct 24, 2023' },
  { id: 2, name: 'Newsletter Weekly #42', sent: '8,200', opens: '42%', clicks: '5.4%', status: 'Draft', date: 'Oct 26, 2023' },
  { id: 3, name: 'Re-engagement Blast', sent: '5,000', opens: '18%', clicks: '2.1%', status: 'Completed', date: 'Oct 15, 2023' },
];

export default function EmailPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email Platform</h1>
          <p className="text-slate-400 mt-1">Broadcast personalized emails and track engagement.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link 
            href="/crm"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <Settings2 className="w-4 h-4" />
            MANAGE CLIENTS
          </Link>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Send className="w-5 h-5" />
            CREATE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="high-tech-card p-6 border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audience</span>
          </div>
          <h3 className="text-2xl font-bold text-white">24.5K</h3>
          <p className="text-xs text-slate-400 mt-1">Total Subscribers</p>
        </div>
        <div className="high-tech-card p-6 border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Open</span>
          </div>
          <h3 className="text-2xl font-bold text-white">48.2%</h3>
          <p className="text-xs text-slate-400 mt-1">+4.2% from last month</p>
        </div>
        <div className="high-tech-card p-6 border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MousePointer2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Click</span>
          </div>
          <h3 className="text-2xl font-bold text-white">8.4%</h3>
          <p className="text-xs text-slate-400 mt-1">+1.5% from last month</p>
        </div>
        <div className="high-tech-card p-6 border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sent</span>
          </div>
          <h3 className="text-2xl font-bold text-white">128K</h3>
          <p className="text-xs text-slate-400 mt-1">Total Emails Sent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Recent Campaigns
          </h3>
          <div className="high-tech-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Campaign</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Performance</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{camp.sent} Recipients • {camp.date}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Opens</p>
                            <p className="text-sm font-bold text-emerald-400">{camp.opens}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Clicks</p>
                            <p className="text-sm font-bold text-cyan-400">{camp.clicks}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          camp.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          camp.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-white/10'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Quick Lists
          </h3>
          <div className="space-y-4">
            {[
              { name: 'High Spenders', count: '1,240', color: 'border-cyan-500/30' },
              { name: 'Newsletter Opt-ins', count: '18,500', color: 'border-purple-500/30' },
              { name: 'Inactive Users', count: '3,200', color: 'border-red-500/30' },
            ].map((list, i) => (
              <div key={i} className={`high-tech-card p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all ${list.color}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{list.name}</h4>
                    <p className="text-xs text-slate-500">{list.count} contacts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>

          <div className="high-tech-card p-6 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Pro Tip
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Use A/B testing for subject lines to increase your open rates by up to 25%.
            </p>
            <button className="mt-4 text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-300 transition-colors">
              Learn More <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
