'use client';

import React from 'react';
import { HelpCircle, MessageSquare, Mail, Phone, ExternalLink } from 'lucide-react';

export default function ClientHelp() {
  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      icon: MessageSquare,
      action: 'Start Chat',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours.',
      icon: Mail,
      action: 'Send Email',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Knowledge Base',
      description: 'Browse our documentation for quick answers.',
      icon: HelpCircle,
      action: 'Open Docs',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Support & Help</h1>
        <p className="text-slate-400 mt-1">We're here to help you get the most out of our services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportChannels.map((channel, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-xl ${channel.bg} flex items-center justify-center mb-6`}>
              <channel.icon className={`w-6 h-6 ${channel.color}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{channel.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{channel.description}</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2">
              {channel.action}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-8 bg-indigo-600 rounded-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Need a custom service?</h2>
          <p className="text-indigo-100 mb-6 max-w-md">Our team is ready to help you scale your business with tailored marketing solutions.</p>
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-lg">
            Schedule a Strategy Call
          </button>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 translate-x-1/4 blur-2xl"></div>
      </div>
    </div>
  );
}
