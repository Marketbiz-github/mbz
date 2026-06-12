'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  User,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const menuItems = [
  { icon: LayoutDashboard, label: 'Performance Overview', href: '/client/dashboard' },
  { icon: FileText, label: 'Service Reports', href: '/client/reports' },
];

export default function ClientSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { signOut, user, role } = useAuth();

  return (
    <aside className="w-64 h-full border-r border-white/10 bg-slate-950 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white italic">C</div>
          <span className="font-bold text-xl tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
            CLIENT PORTAL
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all group",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-indigo-400")} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {user && (
          <div className="px-3 py-3 mb-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Client Account</p>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/client/help"
          className="flex items-center gap-3 p-3 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Support Help</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
