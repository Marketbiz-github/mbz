'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Bell className="w-8 h-8 text-cyan-400" />
          Notifications
        </h1>
        <p className="text-slate-400 mt-1">Updates and alerts regarding your services and reports.</p>
      </div>

      <div className="flex h-64 items-center justify-center border border-white/10 rounded-xl bg-white/5 border-dashed">
        <p className="text-slate-400">No new notifications.</p>
      </div>
    </div>
  );
}
