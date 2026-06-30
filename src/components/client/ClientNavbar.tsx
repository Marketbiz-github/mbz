'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, User, Loader2, FileText, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ClientNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (clientInfo) {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('client_id', clientInfo.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifs();
    
    // Set up realtime listener for notifications
    const notifChannel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchNotifs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, [user, supabase]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim() || !user) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      
      setIsSearching(true);
      setShowDropdown(true);

      try {
        const { data: clientInfo } = await supabase
          .from('clients')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (clientInfo) {
          const { data } = await supabase
            .from('projects')
            .select('id, name, services(name)')
            .eq('client_id', clientInfo.id)
            .ilike('name', `%${searchQuery}%`)
            .limit(5);
            
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user, supabase]);

  const handleResultClick = (result: any) => {
    setShowDropdown(false);
    setSearchQuery('');
    
    let route = '/client/dashboard';
    const serviceName = result.services?.name?.toLowerCase() || '';
    if (serviceName.includes('seo')) route = `/client/seo/detail/${result.id}`;
    else if (serviceName.includes('email')) route = `/client/email/detail/${result.id}`;
    else if (serviceName.includes('sosmed')) route = `/client/sosmed/detail/${result.id}`;
    else if (serviceName.includes('wa')) route = `/client/wa-blast`;
    
    router.push(route);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
      setShowNotifDropdown(false);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:block relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-64 focus-within:border-cyan-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery) setShowDropdown(true); }}
              placeholder="Search metrics..."
              className="bg-transparent border-none outline-none text-xs text-slate-300 placeholder:text-slate-600 w-full"
            />
          </div>
          
          {showDropdown && (searchQuery.trim().length > 0) && (
            <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
              {isSearching ? (
                <div className="px-4 py-3 flex items-center justify-center text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{result.name}</p>
                        <p className="text-[10px] text-slate-500">{result.services?.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-xs text-slate-500">
                  No projects found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifDropdownRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
            )}
          </button>
          
          {showNotifDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto flex flex-col">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-indigo-500/5' : ''}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'report_update' ? 'bg-cyan-500/10 text-cyan-400' :
                        notif.type === 'new_project' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {notif.type === 'report_update' ? <FileText className="w-4 h-4" /> :
                         notif.type === 'new_project' ? <CheckCircle2 className="w-4 h-4" /> :
                         <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs ${!notif.is_read ? 'font-bold text-white' : 'text-slate-300'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-slate-600 mt-2 font-mono">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
