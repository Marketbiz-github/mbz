'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/';
  // `/client` is the admin page, `/client/*` is the client portal
  const isClientPortal = 
    pathname?.startsWith('/client/dashboard') ||
    pathname?.startsWith('/client/reports') ||
    pathname?.startsWith('/client/notifications') ||
    pathname?.startsWith('/client/help') ||
    pathname?.startsWith('/client/seo') ||
    pathname?.startsWith('/client/sosmed') ||
    pathname?.startsWith('/client/email') ||
    pathname?.startsWith('/client/wa-blast');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <AuthProvider>
          {isLoginPage || isClientPortal ? (
            children
          ) : (
            <div className="flex min-h-screen relative">
              {/* Mobile Header */}
              <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/10 z-60 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center font-bold text-black italic text-sm">M</div>
                  <span className="font-bold text-lg tracking-tight text-white">MARKETBIZ</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  {isSidebarOpen ? <X /> : <Menu />}
                </button>
              </div>

              {/* Sidebar Overlay for Mobile */}
              {isSidebarOpen && (
                <div 
                  className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-70"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>
              )}

              {/* Sidebar Container */}
              <div className={`
                fixed inset-y-0 left-0 z-80 transition-transform duration-300 transform lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </div>

              {/* Main Content */}
              <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 relative overflow-x-hidden w-full">
                {/* Background glow effects */}
                <div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-cyan-500/5 rounded-full blur-[80px] md:blur-[120px] -z-10"></div>
                <div className="fixed bottom-0 left-0 lg:left-64 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-purple-500/5 rounded-full blur-[70px] md:blur-[100px] -z-10"></div>
                
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
