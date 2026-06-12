'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// NOTE: Ideally import a charting library like recharts here
// For this prototype, I will structure the UI to accommodate it.

export default function ClientEmailPage() {
  const { clientId } = useParams();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCampaigns() {
      if (!clientId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('client_id', clientId)
        .order('sent_at', { ascending: false });

      if (!error && data) {
        setCampaigns(data);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, [clientId, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-500">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/email" className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">Client Campaign Details</h1>
      </div>

      {/* Analytics Placeholder */}
      <div className="high-tech-card p-6 border-indigo-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400"/> 
            Campaign Performance Overview
        </h3>
        <div className="h-48 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-500 text-sm">
            [Chart Component Placeholder for {campaigns.length} Campaigns]
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="high-tech-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Campaign Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Sent At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Metrics (Opens/Clicks)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-white/5">
                <td className="px-6 py-4 text-sm font-bold text-white">{camp.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{new Date(camp.sent_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-slate-400 capitalize">{camp.status}</td>
                <td className="px-6 py-4 text-sm text-slate-400">
                    {camp.opens} / {camp.clicks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
