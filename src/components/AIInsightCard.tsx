'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface AIInsightCardProps {
  reportType: string;
  reportData: any;
  className?: string;
}

export default function AIInsightCard({ reportType, reportData, className }: AIInsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          reportData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insight');
      }

      setInsight(data.insight);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("high-tech-card bg-slate-900/40 p-6 border border-white/10 relative overflow-hidden group transition-all", className)}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-50" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Kesimpulan & Analisis</h3>
            <p className="text-xs text-slate-400 mt-1">Dihasilkan oleh Digital Analyst AI</p>
          </div>
        </div>
        
        {!insight && !loading && (
          <button 
            onClick={generateInsight}
            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer print:hidden"
          >
            <Sparkles className="w-4 h-4" />
            GENERATE INSIGHT
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse">Menganalisis data laporan...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 mt-4">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-400">Gagal Menghasilkan AI Insight</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
            <button onClick={generateInsight} className="text-xs text-white underline mt-2 hover:text-slate-300">Coba Lagi</button>
          </div>
        </div>
      )}

      {insight && (
        <div className="mt-6 p-6 bg-black/20 rounded-xl border border-white/5 
          text-slate-300 text-sm leading-relaxed
          [&>p]:mb-4 last:[&>p]:mb-0
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:space-y-2
          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol]:space-y-2
          [&_li]:leading-relaxed [&_li>strong]:text-emerald-400
          [&_strong]:text-emerald-400 [&_strong]:font-bold 
          [&>h1]:text-indigo-300 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:mt-6 first:[&>h1]:mt-0
          [&>h2]:text-indigo-300 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6 first:[&>h2]:mt-0
          [&>h3]:text-indigo-300 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:mt-4 first:[&>h3]:mt-0
          [&>hr]:border-white/10 [&>hr]:my-6
        ">
          <ReactMarkdown>{insight}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
