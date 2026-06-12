'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Users, 
  Shield, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Lock,
  Mail,
  Camera,
  Video,
  Database,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'api' | 'team' | 'agency';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('api');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-cyan-400" />
          System Settings
        </h1>
        <p className="text-slate-400 mt-1">Configure your agency's engine room and team access.</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex border-b border-white/10 gap-8">
        {[
          { id: 'api', label: 'API Integrations', icon: Key },
          { id: 'team', label: 'Team Management', icon: Users },
          { id: 'agency', label: 'Agency Branding', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
              activeTab === tab.id 
                ? "text-cyan-400" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'api' && <APIIntegrations />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'agency' && <AgencyBranding />}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="high-tech-card p-6 border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              System Status
            </h3>
            <div className="space-y-4">
              <StatusItem label="API Connection" status="Operational" color="text-emerald-400" />
              <StatusItem label="Database Latency" status="12ms" color="text-emerald-400" />
              <StatusItem label="AI Model" status="GPT-4o Ready" color="text-cyan-400" />
            </div>
            <button className="w-full mt-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-3 h-3" /> RUN DIAGNOSTICS
            </button>
          </div>

          <div className="high-tech-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Security Protocol
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All API keys are encrypted using AES-256-GCM. Never share your secret keys with anyone outside the authorized admin team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={cn("text-xs font-bold font-mono", color)}>{status}</span>
    </div>
  );
}

function APIIntegrations() {
  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      <div className="high-tech-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Core AI Services
          </h3>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">CONNECTED</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OpenAI API Key</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value="sk-proj-••••••••••••••••" 
                readOnly
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-400 font-mono outline-none"
              />
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all">
                UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="high-tech-card p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          Social Network Connections
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SocialCard icon={Camera} name="Meta Business API" status="Connected" color="text-pink-400" />
          <SocialCard icon={Video} name="TikTok For Business" status="Action Required" color="text-red-400" />
        </div>
      </div>
    </div>
  );
}

function SocialCard({ icon: Icon, name, status, color }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
          <Icon className={cn("w-5 h-5", status === 'Connected' ? 'text-white' : 'text-slate-500')} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className={cn("text-[10px] font-bold uppercase tracking-tighter", color)}>{status}</p>
        </div>
      </div>
      <button className="text-slate-500 hover:text-white transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function TeamManagement() {
  const members = [
    { name: 'Sarah J.', role: 'Super Admin', email: 'sarah@marketbiz.id', status: 'Online' },
    { name: 'Mike R.', role: 'Social Lead', email: 'mike@marketbiz.id', status: 'Away' },
    { name: 'Alex P.', role: 'Account Manager', email: 'alex@marketbiz.id', status: 'Offline' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      <div className="high-tech-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Agency Members</h3>
          <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all">
            INVITE MEMBER
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((m, i) => (
            <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {m.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{m.role}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-600')}></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{m.status}</span>
                  </div>
                </div>
                <button className="p-2 text-slate-600 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgencyBranding() {
  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      <div className="high-tech-card p-6 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 transition-all cursor-pointer bg-white/[0.02]">
            <Plus className="w-6 h-6 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Logo</span>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Agency Name</label>
              <input 
                value="Marketbiz Digital" 
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Support Email</label>
              <input 
                value="support@marketbiz.id" 
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreHorizontal(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
