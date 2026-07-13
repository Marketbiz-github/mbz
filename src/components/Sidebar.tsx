'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Mail,
  Sparkles,
  Users2,
  Settings,
  LogOut,
  ChevronRight,
  User,
  MessageCircle,
  Search,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Share2, label: 'Sosmed', href: '/sosmed' },
  { icon: Mail, label: 'Email Blast', href: '/email' },
  { icon: MessageCircle, label: 'WA Blast', href: '/wa-blast' },
  { icon: Search, label: 'SEO', href: '/seo' },
  { icon: Users2, label: 'Client', href: '/client' },
  // { icon: CalendarDays, label: 'Social Scheduler', href: '/scheduler' },
  // { icon: Sparkles, label: 'AI Copy Gen', href: '/ai-generator' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { signOut, user, role } = useAuth();

  return (
    <aside className="w-64 h-full border-r border-white/10 bg-black/95 backdrop-blur-2xl flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MarketBiz" className="h-8 w-auto object-contain" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : item.href === '/client'
              ? pathname === '/client' || (pathname?.startsWith('/client/') && !pathname?.startsWith('/client/dashboard') && !pathname?.startsWith('/client/reports') && !pathname?.startsWith('/client/notifications') && !pathname?.startsWith('/client/help'))
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all group",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "group-hover:text-cyan-400")} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {user && (
          <div className="px-3 py-2 mb-2 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.email}</p>
                <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">{role || 'User'}</p>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 p-3 w-full rounded-lg transition-all",
            pathname === '/settings'
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">System Settings</span>
        </Link>
        <button
          onClick={() => {
            signOut();
            onClose?.();
          }}
          className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
