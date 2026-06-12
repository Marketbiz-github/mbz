'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  RotateCcw, 
  Bot, 
  User as UserIcon,
  MessageSquare,
  Hash,
  Smile
} from 'lucide-react';

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  const generateCopy = () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    setHistory(prev => [...prev, { role: 'user', text: prompt }]);
    
    // Simulate AI thinking and typing
    setTimeout(() => {
      const mockResult = `🚀 Level up your digital game with Marketbiz! 

Our expert team handles:
✅ Social Media Management
✅ Targeted Ad Campaigns
✅ High-Conversion Copywriting

Stop guessing, start growing. DM us for a free audit! 📈

#Marketbiz #DigitalAgency #MarketingTips #GrowthHacking #BusinessAutomation`;
      
      setResult(mockResult);
      setHistory(prev => [...prev, { role: 'ai', text: mockResult }]);
      setIsGenerating(false);
      setPrompt('');
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          AI Copy Generator
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">Powered by MBZ-AI v2</div>
        </h1>
        <p className="text-slate-400 mt-1">Generate high-converting captions and ad copies in seconds.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Chat Interface */}
        <div className="lg:col-span-2 high-tech-card flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">How can I help you today?</h4>
                  <p className="text-sm text-slate-400">Ask me to write a caption for your next post.</p>
                </div>
              </div>
            ) : (
              history.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5' : 'bg-cyan-500 text-black font-medium rounded-tr-none'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                    {msg.role === 'ai' && (
                      <div className="mt-4 flex gap-3 border-t border-white/5 pt-3">
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-400 transition-colors">
                          <RotateCcw className="w-3 h-3" /> Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 space-y-2 w-32">
                  <div className="h-2 bg-slate-700 rounded w-full"></div>
                  <div className="h-2 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-black/40">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), generateCopy())}
                placeholder="Write a promotional caption for Marketbiz services..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-16 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none h-24 transition-all"
              />
              <button 
                onClick={generateCopy}
                disabled={isGenerating || !prompt}
                className="absolute right-3 bottom-3 p-3 bg-cyan-500 rounded-lg text-black hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-4 mt-3">
              <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors">
                <Smile className="w-3.5 h-3.5" /> Emoji Pack
              </button>
              <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors">
                <Hash className="w-3.5 h-3.5" /> Suggest Hashtags
              </button>
              <div className="ml-auto text-[10px] text-slate-600 font-mono">
                Tokens used: 1,240 / 50,000
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
          <div className="high-tech-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Writing Presets
            </h3>
            <div className="space-y-3">
              {['Storyteller', 'Aggressive Sales', 'Professional News', 'Viral Hook', 'Humorous'].map((preset) => (
                <button key={preset} className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all text-sm text-slate-300">
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="high-tech-card p-6 bg-purple-500/5 border-purple-500/20">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Tone Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Excitement</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[85%] shadow-[0_0_8px_#a855f7]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Confidence</span>
                  <span className="text-white">92%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[92%] shadow-[0_0_8px_#06b6d4]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
