'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Share2,
  Globe,
  MoreVertical,
  CheckCircle2,
  ChevronLeft,
  Search,
  ChevronRight,
  Image as ImageIcon,
  Type,
  Send,
  CalendarDays,
  Video,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const clients = [
  { id: 1, name: 'TechNova Solutions', pending: 5, scheduled: 12, lastPost: '2 hours ago' },
  { id: 2, name: 'GreenLife Organics', pending: 2, scheduled: 8, lastPost: '5 hours ago' },
  { id: 3, name: 'Urban Styles Inc.', pending: 0, scheduled: 24, lastPost: '1 day ago' },
  { id: 4, name: 'EcoWare Ltd.', pending: 1, scheduled: 4, lastPost: '3 days ago' },
  { id: 5, name: 'Swift Logistics', pending: 8, scheduled: 15, lastPost: '6 hours ago' },
];

const scheduleData = [
  { id: 1, title: 'Summer Collection Launch', platform: 'Instagram', time: '10:00 AM', status: 'Scheduled', color: 'text-pink-400' },
  { id: 2, title: 'Tips for Digital Marketing', platform: 'Twitter', time: '02:30 PM', status: 'Draft', color: 'text-blue-400' },
  { id: 3, title: 'Client Testimonial: MBZ Project', platform: 'Facebook', time: '04:00 PM', status: 'Scheduled', color: 'text-cyan-400' },
];

export default function SchedulerPage() {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // --- RENDER LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Social Scheduler</h1>
            <p className="text-slate-400 mt-1">Manage content calendars across all clients.</p>
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
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Scheduled</p>
              <h3 className="text-2xl font-bold text-white">248</h3>
            </div>
          </div>
          <div className="high-tech-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Awaiting Approval</p>
              <h3 className="text-2xl font-bold text-white">16</h3>
            </div>
          </div>
          <div className="high-tech-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Platforms Connected</p>
              <h3 className="text-2xl font-bold text-white">42</h3>
            </div>
          </div>
        </div>

        <div className="high-tech-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Posts</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Scheduled</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                          {client.name[0]}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-medium",
                        client.pending > 0 ? "text-amber-400" : "text-slate-500"
                      )}>{client.pending} posts</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{client.scheduled} posts</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{client.lastPost}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedClient(client); setView('detail'); }}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all group/btn flex items-center gap-2 ml-auto"
                      >
                        <span className="text-xs font-bold">MANAGE</span>
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

  // --- RENDER CREATE POST VIEW ---
  if (view === 'create') {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('detail')}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Create New Post</h1>
            <p className="text-sm text-slate-400 mt-1">Compose content for <span className="text-white font-bold">{selectedClient?.name}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="high-tech-card p-4 md:p-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Select Platforms</label>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {[
                    { id: 'ig', icon: Share2, label: 'Instagram', color: 'text-pink-400' },
                    { id: 'tt', icon: Video, label: 'TikTok', color: 'text-cyan-400' },
                    { id: 'fb', icon: Globe, label: 'Facebook', color: 'text-blue-400' }
                  ].map((p) => (
                    <button key={p.id} className="p-3 md:p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/50 transition-all flex flex-col items-center gap-2 group">
                      <p.icon className={cn("w-5 h-5 md:w-6 md:h-6", p.color)} />
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 group-hover:text-white">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Media Assets</label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-4 hover:border-cyan-500/30 transition-all cursor-pointer bg-white/[0.02]">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Click or drag to upload</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, MP4 (Max 50MB)</p>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Caption / Script</label>
                <div className="relative">
                  <textarea 
                    placeholder="Write your amazing content here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <button className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-[10px] font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                    <Type className="w-3 h-3" /> AI ENHANCE
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="high-tech-card p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Scheduling Options
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Post Date</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Post Time</label>
                  <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500/50 [color-scheme:dark]" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <button 
                  onClick={() => setView('detail')}
                  className="w-full py-3 bg-cyan-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  SCHEDULE POST
                </button>
                <button className="w-full py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  SAVE AS DRAFT
                </button>
              </div>
            </div>

            <div className="high-tech-card p-6 border-indigo-500/20 bg-indigo-500/5 hidden lg:block">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Preview
              </h4>
              <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-slate-600">
                No media selected
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
                *Preview is an approximation. Actual post layout may vary by platform.
              </p>
            </div>
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
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{selectedClient?.name}</h1>
            <p className="text-sm text-slate-400 mt-1">Content strategy and automated scheduling.</p>
          </div>
        </div>
        <button 
          onClick={() => setView('create')}
          className="flex items-center justify-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          NEW POST
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar Preview */}
        <div className="xl:col-span-2 high-tech-card p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              Content Calendar
            </h3>
            <div className="grid grid-cols-7 w-full md:w-auto gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
                <div key={day} className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-[10px] font-bold text-slate-500">{day}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-lg border border-white/5 flex flex-col p-1 md:p-2 transition-all hover:border-cyan-500/30 cursor-pointer ${i + 1 === 15 ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5'}`}>
                <span className={`text-[10px] md:text-xs font-bold ${i + 1 === 15 ? 'text-cyan-400' : 'text-slate-400'}`}>{i + 1}</span>
                {i + 1 === 15 && (
                  <div className="mt-auto flex gap-0.5 md:gap-1">
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-pink-500"></div>
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-500"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Upcoming Queue
          </h3>
          <div className="space-y-4">
            {scheduleData.map((post) => (
              <div key={post.id} className="high-tech-card p-4 flex gap-4 items-center group cursor-pointer hover:bg-white/5 transition-all">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${post.color}`}>
                  {post.platform === 'Instagram' && <Share2 className="w-5 h-5 md:w-6 md:h-6" />}
                  {post.platform === 'Twitter' && <Globe className="w-5 h-5 md:w-6 md:h-6" />}
                  {post.platform === 'Facebook' && <Globe className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-white truncate">{post.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{post.platform} • {post.time}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${post.status === 'Scheduled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/10'}`}>
                    {post.status}
                  </span>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="high-tech-card p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Quick Tip
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Posts with high-quality images get 40% more engagement. Use the AI Generator to refine your captions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
