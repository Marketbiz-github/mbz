'use client';

import React, { useEffect } from 'react';

export default function ClientWABlastPage() {
  useEffect(() => {
    document.title = "WhatsApp Blast Analytics | Client Portal";
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">WA Blast Dashboard</h1>
        <p className="text-slate-400 mt-1">View WhatsApp campaigns, delivery rates, and analytics.</p>
      </div>

      <div className="flex h-64 items-center justify-center border border-white/10 rounded-xl bg-white/5 border-dashed">
        <p className="text-slate-400">WA Blast Module Under Construction</p>
      </div>
    </div>
  );
}
