'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export default function ClientReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReports() {
      if (!user) return;
      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (clientInfo) {
          const { data: campaigns } = await supabase
            .from('campaigns')
            .select('*')
            .eq('client_id', clientInfo.id);
          
          setCampaigns(campaigns || []);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [user, supabase]);

  const handleDownload = (campaignName: string) => {
    alert(`Generating report for ${campaignName}... This will download a PDF/CSV in a real implementation.`);
  };

  if (loading) {
    return <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Service Reports</h1>
        <p className="text-slate-400 mt-1">Access and download performance reports for each of your services.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            Export All
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.length > 0 ? campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{campaign.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5">Report ID: {campaign.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-300 font-medium capitalize">{campaign.platform}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(campaign.start_date).toLocaleDateString()} - Present</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-xs text-slate-300 font-medium capitalize">{campaign.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDownload(campaign.name)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-slate-400 font-medium">No reports available yet.</p>
                      <p className="text-xs text-slate-600">Your performance reports will appear here as data is collected.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
