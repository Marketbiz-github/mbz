'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter,
  MoreHorizontal,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  BarChart3,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const initialClients = [
  { id: 1, name: 'TechNova Solutions', project: 'Brand Awareness', status: 'Ongoing', manager: 'Sarah J.', budget: '$4,500', services: ['KPI', 'Scheduler', 'Email'] },
  { id: 2, name: 'GreenLife Organics', project: 'Social Media Management', status: 'Completed', manager: 'Mike R.', budget: '$2,800', services: ['KPI', 'Scheduler'] },
  { id: 3, name: 'Urban Styles Inc.', project: 'Influencer Marketing', status: 'Ongoing', manager: 'Sarah J.', budget: '$12,000', services: ['KPI', 'Scheduler'] },
];

export default function CRMPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [clients, setClients] = useState(initialClients);
  const [newClient, setNewClient] = useState({
    name: '',
    project: '',
    manager: 'Sarah J.',
    budget: '',
    services: [] as string[]
  });

  const toggleService = (service: string) => {
    setNewClient(prev => ({
      ...prev,
      services: prev.services.includes(service) 
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const clientToAdd = {
      ...newClient,
      id: clients.length + 1,
      status: 'Ongoing'
    };
    setClients([clientToAdd, ...clients]);
    setShowAddModal(false);
    setNewClient({ name: '', project: '', manager: 'Sarah J.', budget: '', services: [] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Client CRM</h1>
          <p className="text-slate-400 mt-1">Central management for clients and their subscribed services.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ADD NEW CLIENT
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Active Clients</p>
            <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
          </div>
        </div>
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Services</p>
            <h3 className="text-2xl font-bold text-white">
              {clients.reduce((acc, curr) => acc + curr.services.length, 0)}
            </h3>
          </div>
        </div>
        <div className="high-tech-card p-6 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">System Health</p>
            <h3 className="text-2xl font-bold text-white">99.9%</h3>
          </div>
        </div>
      </div>

      {/* Client Table */}
      <div className="high-tech-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Active Services</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
                        {client.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{client.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{client.project}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {client.services.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-lg high-tech-card p-6 md:p-8 bg-slate-900 border-cyan-500/30 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                New Client
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name</label>
                  <input 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="E.g. SpaceX Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
                  <input 
                    required
                    value={newClient.project}
                    onChange={(e) => setNewClient({...newClient, project: e.target.value})}
                    placeholder="E.g. Social Growth Q4"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Services</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                      { id: 'KPI', icon: BarChart3, label: 'KPI' },
                      { id: 'Scheduler', icon: Calendar, label: 'Sched' },
                      { id: 'Email', icon: Mail, label: 'Mail' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all",
                          newClient.services.includes(s.id)
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                            : "bg-white/5 border-white/10 text-slate-500"
                        )}
                      >
                        <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl shadow-lg hover:bg-cyan-400 transition-all active:scale-95"
                >
                  ACTIVATE CLIENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
