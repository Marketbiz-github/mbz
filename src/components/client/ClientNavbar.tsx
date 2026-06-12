'use client';

import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function ClientNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search metrics..." 
            className="bg-transparent border-none outline-none text-xs text-slate-300 placeholder:text-slate-600 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-1"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-white leading-none">Welcome back</p>
            <p className="text-[10px] text-slate-500 mt-1">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-600 to-cyan-500 p-0.5">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
