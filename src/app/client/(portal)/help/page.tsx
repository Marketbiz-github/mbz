'use client';

import React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

export default function ClientHelp() {
  const supportChannels = [
    {
      title: 'Email Support',
      description: 'Kirimkan pertanyaan atau kendala Anda via email. Kami akan membalas secepatnya.',
      icon: Mail,
      action: 'Hubungi via Email',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      href: 'mailto:support@marketbiz.net'
    },
    {
      title: 'WhatsApp Support',
      description: 'Chat langsung dengan tim support kami melalui WhatsApp untuk respon cepat.',
      icon: Phone,
      action: 'Hubungi via WA',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: 'https://wa.me/628123456789'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Pusat Bantuan</h1>
        <p className="text-slate-400 mt-1">Kami siap membantu Anda mendapatkan hasil maksimal dari layanan kami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportChannels.map((channel, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-xl ${channel.bg} flex items-center justify-center mb-6`}>
              <channel.icon className={`w-6 h-6 ${channel.color}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{channel.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{channel.description}</p>
            <a 
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {channel.action}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      <div className="p-8 bg-indigo-600 rounded-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Butuh layanan kustom tambahan?</h2>
          <p className="text-indigo-100 mb-6 max-w-md">Tim kami siap membantu Anda mengembangkan skala bisnis dengan solusi marketing yang dirancang khusus.</p>
          <a 
            href="mailto:sales@marketbiz.net"
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-lg"
          >
            Konsultasi dengan Tim
          </a>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 translate-x-1/4 blur-2xl"></div>
      </div>
    </div>
  );
}
