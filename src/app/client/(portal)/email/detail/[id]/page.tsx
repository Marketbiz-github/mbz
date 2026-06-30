'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Share2,
  Image as ImageIcon,
  Info,
  Eye,
  Download,
  CheckCircle,
  Loader2,
  Mail,
  Users,
  MessageCircle,
  FileSpreadsheet
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';

interface EmailCampaign {
  id: string;
  project_id: string;
  campaign_name: string;
  sender: string;
  sent_at: string;
  utcid: string;
  status: string;
  recipients: number;
  opens: number;
  clicks: number;
  replies: number;
  unsubscribes: number;
  bounces: number;
  blocks: number;
  opens_excl_apple: number;
  projects?: {
    name: string;
    client_id: string;
    clients?: {
      name: string;
    };
  };
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      document.title = `Campaign: ${campaign.campaign_name} | MarketBiz`;
    } else {
      document.title = "Campaign Report | MarketBiz";
    }
  }, [campaign]);

  useEffect(() => {
    async function fetchCampaignDetails() {
      if (!id || !user) return;
      setLoading(true);
      setError(null);
      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!clientInfo) throw new Error('Client profile not found');

        const { data, error: fetchError } = await supabase
          .from('email_blast_reports')
          .select('*, projects!inner(name, client_id, clients!inner(name))')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (data.projects?.client_id !== clientInfo.id) {
          throw new Error('Access denied. This campaign belongs to another client.');
        }

        setCampaign(data);
      } catch (err: any) {
        console.error('Error fetching campaign details:', err);
        setError(err.message || 'Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    }
    fetchCampaignDetails();
  }, [id, user, supabase]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (!campaign) return;
    const openRate = campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : '0';
    const clickRate = campaign.recipients > 0 ? ((campaign.clicks / campaign.recipients) * 100).toFixed(1) : '0';
    const bounceRate = campaign.recipients > 0 ? ((campaign.bounces / campaign.recipients) * 100).toFixed(1) : '0';
    const blockRate = campaign.recipients > 0 ? ((campaign.blocks / campaign.recipients) * 100).toFixed(1) : '0';

    const csvContent = [
      ["Metric", "Value", "Percentage"],
      ["Campaign Name", campaign.campaign_name, ""],
      ["Sender Email", campaign.sender, ""],
      ["Sent Date", new Date(campaign.sent_at).toLocaleString(), ""],
      ["UTCID", campaign.utcid || "N/A", ""],
      ["Status", campaign.status, ""],
      ["Recipients", campaign.recipients, "100%"],
      ["Opens", campaign.opens, `${openRate}%`],
      ["Clicks", campaign.clicks, `${clickRate}%`],
      ["Replies", campaign.replies, ""],
      ["Unsubscribes", campaign.unsubscribes, ""],
      ["Bounces", campaign.bounces, `${bounceRate}%`],
      ["Blocks", campaign.blocks, `${blockRate}%`],
      ["Opens Excl Apple", campaign.opens_excl_apple, ""]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Campaign_Report_${campaign.campaign_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading campaign report analysis...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="high-tech-card p-8 border-red-500/20 text-center space-y-4 max-w-xl mx-auto my-12">
        <h3 className="text-xl font-bold text-red-400">Error Loading Details</h3>
        <p className="text-sm text-slate-400">{error || 'Campaign report details could not be found.'}</p>
        <button 
          onClick={() => router.push('/client/email')}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
        >
          BACK TO CAMPAIGNS
        </button>
      </div>
    );
  }

  const openRate = campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : '0';
  const clickRate = campaign.recipients > 0 ? ((campaign.clicks / campaign.recipients) * 100).toFixed(1) : '0';
  const openRateExclApple = campaign.recipients > 0 ? ((campaign.opens_excl_apple / campaign.recipients) * 100).toFixed(1) : '0';
  const bounceRate = campaign.recipients > 0 ? ((campaign.bounces / campaign.recipients) * 100).toFixed(1) : '0';
  const blockRate = campaign.recipients > 0 ? ((campaign.blocks / campaign.recipients) * 100).toFixed(1) : '0';

  const chartData = [
    { name: 'Recipients', count: campaign.recipients, fill: '#00F2EA' },
    { name: 'Opens', count: campaign.opens, fill: '#6366F1' },
    { name: 'Clicks', count: campaign.clicks, fill: '#F59E0B' },
    { name: 'Replies', count: campaign.replies, fill: '#E2E8F0' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Back link */}
      <button 
        onClick={() => router.push('/email')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group cursor-pointer print:hidden"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Email Blast
      </button>

      {/* Main Campaign Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Campaign Report: <span className="text-indigo-400">{campaign.projects?.clients?.name}</span>, {campaign.campaign_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
            <span>Sent {new Date(campaign.sent_at).toLocaleString()}</span>
            <span className="text-slate-700">•</span>
            <span>UTCID: {campaign.utcid || 'N/A'}</span>
            <span className="text-slate-700">•</span>
            <span className="text-indigo-400 select-all">{campaign.sender}</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5 backdrop-blur-xl print:hidden">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> PDF
          </button>
          <button 
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-extrabold text-black transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL
          </button>
        </div>
      </div>

      {/* Done sending check indicator */}
      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider bg-white/5 border border-white/5 w-fit px-3 py-1.5 rounded-full">
        <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />
        {campaign.status === 'completed' ? 'Done sending' : campaign.status}
      </div>

      {/* Analytics Dashboard Grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 9-grid metrics cards */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Card: Recipients */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recipients</p>
            <h3 className="text-3xl font-extrabold text-white mt-4">{campaign.recipients.toLocaleString()}</h3>
          </div>

          {/* Card: Replies */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Replies</p>
            <h3 className="text-2xl font-bold text-slate-500 mt-4">
              {campaign.replies > 0 ? campaign.replies.toLocaleString() : 'No Replies'}
            </h3>
          </div>

          {/* Card: Activity time or spacer placeholder */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px] bg-linear-to-br from-indigo-500/5 to-cyan-500/5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Open Rate</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-4">
              {campaign.opens.toLocaleString()} <span className="text-lg font-medium text-slate-500">({openRate}%)</span>
            </h3>
          </div>

          {/* Card: Unsubscribes */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unsubscribes</p>
            <h3 className="text-2xl font-bold text-slate-500 mt-4">
              {campaign.unsubscribes > 0 ? campaign.unsubscribes.toLocaleString() : 'No Unsubscribes'}
            </h3>
          </div>

          {/* Card: Click Rate */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click Rate</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 mt-4">
              {campaign.clicks.toLocaleString()} <span className="text-lg font-medium text-slate-500">({clickRate}%)</span>
            </h3>
          </div>

          {/* Card: Open Rate excluding Apple */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Open Rate excluding Apple</p>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tight">MPP</p>
            </div>
            <h3 className="text-3xl font-extrabold text-indigo-400 mt-4">
              {campaign.opens_excl_apple.toLocaleString()} <span className="text-lg font-medium text-slate-500">({openRateExclApple}%)</span>
            </h3>
          </div>

          {/* Card: Bounces */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bounces</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-4">
              {campaign.bounces.toLocaleString()} <span className="text-lg font-medium text-slate-500">({bounceRate}%)</span>
            </h3>
          </div>

          {/* Card: Blocks */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blocks</p>
            <h3 className="text-3xl font-extrabold text-red-400 mt-4">
              {campaign.blocks.toLocaleString()} <span className="text-lg font-medium text-slate-500">({blockRate}%)</span>
            </h3>
          </div>

          {/* Card: Polls */}
          <div className="high-tech-card p-5 border-white/5 bg-slate-900/30 flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Polls</p>
            <h3 className="text-2xl font-bold text-slate-500 mt-4">No Polls</h3>
          </div>

        </div>

        {/* Right side: Recharts Visualization Chart */}
        <div className="high-tech-card p-6 border-white/5 bg-slate-900/20 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Activity by Time</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Live Data
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff', fontSize: 11 }}
                  cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
