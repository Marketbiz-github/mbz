'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Users,
  Shield,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Mail,
  Camera,
  Video,
  Database,
  Terminal,
  ChevronRight,
  Loader2,
  Check,
  Smartphone,
  Plus,
  X,
  Edit2,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'api' | 'team' | 'agency';

interface SystemSettingsData {
  ai_provider: string;
  ai_api_key: string;
  ai_base_url: string;
  ai_model_name: string;
  google_service_account_email: string;
  google_private_key: string;
  agency_name: string;
  support_email: string;
  support_whatsapp: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('api');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticMsg, setDiagnosticMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Settings states
  const [settings, setSettings] = useState<SystemSettingsData>({
    ai_provider: 'openai',
    ai_api_key: '',
    ai_base_url: 'https://api.openai.com/v1',
    ai_model_name: 'gpt-4o',
    google_service_account_email: '',
    google_private_key: '',
    agency_name: 'Marketbiz Digital',
    support_email: 'support@marketbiz.id',
    support_whatsapp: ''
  });

  useEffect(() => {
    document.title = "Pengaturan Sistem | MarketBiz";
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Gagal mengambil pengaturan sistem');
      const data = await res.json();
      setSettings({
        ai_provider: data.ai_provider || 'openai',
        ai_api_key: data.ai_api_key || '',
        ai_base_url: data.ai_base_url || 'https://api.openai.com/v1',
        ai_model_name: data.ai_model_name || 'gpt-4o',
        google_service_account_email: data.google_service_account_email || '',
        google_private_key: data.google_private_key || '',
        agency_name: data.agency_name || 'Marketbiz Digital',
        support_email: data.support_email || 'support@marketbiz.id',
        support_whatsapp: data.support_whatsapp || ''
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedFields: Partial<SystemSettingsData>) => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Gagal menyimpan pengaturan');
        return;
      }
      const data = await res.json();
      setSettings(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setDiagnosticMsg(null);
    try {
      const res = await fetch('/api/settings/diagnostics');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menjalankan diagnostik');
      }
      
      setDiagnosticMsg({ type: 'success', text: 'Semua sistem terhubung dan berjalan optimal' });
    } catch (err: any) {
      setDiagnosticMsg({ type: 'error', text: err.message || 'Sistem bermasalah' });
    } finally {
      setDiagnosing(false);
      // Don't auto hide message so they can read the error
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-400">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            Pengaturan Sistem
          </h1>
          <p className="text-slate-400 mt-1">Konfigurasi dapur agensi Anda dan koneksi API.</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold animate-bounce">
            <Check className="w-4 h-4" /> PENGATURAN BERHASIL DISIMPAN
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      {/* Settings Navigation */}
      <div className="flex border-b border-white/10 gap-8">
        {[
          { id: 'api', label: 'Integrasi API', icon: Key },
          { id: 'team', label: 'Manajemen Tim', icon: Users },
          { id: 'agency', label: 'Branding Agensi', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative cursor-pointer",
              activeTab === tab.id
                ? "text-cyan-400"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'api' && (
            <APIIntegrations
              settings={settings}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'agency' && (
            <AgencyBranding
              settings={settings}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="high-tech-card p-6 border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Status Sistem
            </h3>
            <div className="space-y-4">
              <StatusItem
                label="Integrasi Inti AI"
                status={settings.ai_api_key ? "Terkonfigurasi" : "Belum Dikonfigurasi"}
                color={settings.ai_api_key ? "text-emerald-400" : "text-amber-400"}
              />
              <StatusItem
                label="API Google Analytics"
                status={settings.google_service_account_email ? "Terkonfigurasi" : "Belum Dikonfigurasi"}
                color={settings.google_service_account_email ? "text-emerald-400" : "text-amber-400"}
              />
              <StatusItem label="Latensi Database" status="15ms" color="text-emerald-400" />
            </div>
            <button 
              onClick={runDiagnostics}
              disabled={diagnosing}
              className="w-full mt-6 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={cn("w-3 h-3", diagnosing && "animate-spin")} /> 
              {diagnosing ? "MENJALANKAN..." : "JALANKAN DIAGNOSTIK"}
            </button>
            
            {diagnosticMsg && (
              <div className={cn(
                "mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2",
                diagnosticMsg.type === 'success' 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              )}>
                {diagnosticMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {diagnosticMsg.text}
              </div>
            )}
          </div>

          <div className="high-tech-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Protokol Keamanan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua kredensial dan kunci disimpan dengan aman di instance Supabase menggunakan konfigurasi Row Level Security (RLS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={cn("text-xs font-bold font-mono", color)}>{status}</span>
    </div>
  );
}

interface ComponentProps {
  settings: SystemSettingsData;
  onSave: (fields: Partial<SystemSettingsData>) => Promise<void>;
  saving: boolean;
}

function APIIntegrations({ settings, onSave, saving }: ComponentProps) {
  // Local state for API inputs
  const [provider, setProvider] = useState(settings.ai_provider);
  const [apiKey, setApiKey] = useState(settings.ai_api_key);
  const [baseUrl, setBaseUrl] = useState(settings.ai_base_url);
  const [modelName, setModelName] = useState(settings.ai_model_name);

  const [gaEmail, setGaEmail] = useState(settings.google_service_account_email);
  const [gaPrivateKey, setGaPrivateKey] = useState(settings.google_private_key);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState<'ga4' | 'gsc'>('ga4');

  const handleSaveAI = () => {
    onSave({
      ai_provider: provider,
      ai_api_key: apiKey,
      ai_base_url: baseUrl,
      ai_model_name: modelName
    });
  };

  const handleSaveGA = () => {
    onSave({
      google_service_account_email: gaEmail,
      google_private_key: gaPrivateKey
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      {/* 1. Google Analytics API Card (FIRST PLACE) */}
      <div className="high-tech-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Google Services (Analytics & GSC)
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/20 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Panduan Integrasi
            </button>
            <span className={cn("text-[10px] border px-2 py-0.5 rounded font-bold",
              gaEmail ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-white/5"
            )}>
              {gaEmail ? "AKTIF" : "NONAKTIF"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Google Service Account</label>
            <input
              type="email"
              value={gaEmail}
              onChange={(e) => setGaEmail(e.target.value)}
              placeholder="marketbiz-service@project-id.iam.gserviceaccount.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
            />
            <div className="text-[10px] text-slate-500 space-y-1 mt-1">
              <p>* Klik tombol <strong>Panduan Integrasi</strong> di atas untuk melihat langkah-langkah detail menghubungkan akun Anda.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Private Key Google (Format PEM)</label>
            <textarea
              value={gaPrivateKey}
              onChange={(e) => setGaPrivateKey(e.target.value)}
              rows={5}
              placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleSaveGA}
            disabled={saving}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SIMPAN KREDENSIAL GOOGLE"}
          </button>
        </div>
      </div>

      {/* 2. AI Services Card (SECOND PLACE) */}
      <div className="high-tech-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Konfigurasi Layanan AI
          </h3>
          <span className={cn("text-[10px] border px-2 py-0.5 rounded font-bold",
            apiKey ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-white/5"
          )}>
            {apiKey ? "AKTIF" : "NONAKTIF"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penyedia AI</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
              >
                <option value="openai" className="bg-slate-950 text-white">OpenAI (Default)</option>
                <option value="gemini" className="bg-slate-950 text-white">Google Gemini</option>
                <option value="openrouter" className="bg-slate-950 text-white">OpenRouter (Flexible)</option>
                <option value="custom" className="bg-slate-950 text-white">Custom Webhook / API</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Model</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4o, gemini-1.5-pro"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base URL API</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://api.openai.com/v1"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Key Rahasia</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          <button
            onClick={handleSaveAI}
            disabled={saving}
            className="w-full py-2.5 bg-linear-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SIMPAN KONFIGURASI AI"}
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-950 border border-white/15 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            
            {/* Sidetabs */}
            <div className="w-full md:w-64 bg-slate-900/50 p-4 border-r border-white/10 shrink-0 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Panduan Integrasi</h3>
                <button onClick={() => setShowHelpModal(false)} className="md:hidden text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setHelpTab('ga4')}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  helpTab === 'ga4' 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                }`}
              >
                Google Analytics 4
              </button>
              <button
                onClick={() => setHelpTab('gsc')}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  helpTab === 'gsc' 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                }`}
              >
                Google Search Console
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto relative">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white hidden md:block cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {helpTab === 'ga4' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Panduan Pengaturan Google Analytics 4
                  </h4>
                  
                  <div className="space-y-6 text-sm text-slate-300">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Buat Google Cloud Project & Service Account</h5>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                          <li>Buka <a href="https://console.cloud.google.com" target="_blank" className="text-cyan-400 hover:underline">Google Cloud Console</a>.</li>
                          <li>Buat Project baru (atau gunakan Project yang sudah ada).</li>
                          <li>Buka <strong>APIs & Services &gt; Library</strong>.</li>
                          <li>Cari <strong>Google Analytics Data API</strong> lalu klik <strong>Enable</strong>.</li>
                          <li>Masuk ke <strong>IAM & Admin &gt; Service Accounts</strong>.</li>
                          <li>Klik <strong>Create Service Account</strong>.</li>
                          <li>Pada langkah Permissions, tidak perlu memilih Role, langsung klik <strong>Continue</strong>.</li>
                          <li>Setelah Service Account dibuat, buka tab <strong>Keys</strong>.</li>
                          <li>Klik <strong>Add Key &gt; Create New Key &gt; JSON</strong>.</li>
                          <li>Simpan file JSON yang diunduh.</li>
                        </ul>
                        <p className="text-[10px] text-slate-500 italic">* Catatan: Satu Service Account dapat digunakan untuk mengakses banyak Properti GA4. Anda tidak perlu membuat Service Account baru untuk setiap proyek.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Konfigurasikan Integrasi Google Analytics di MarketBiz</h5>
                        <p className="text-xs text-slate-400">Isi data dari file JSON yang diunduh ke form Pengaturan Sistem:</p>
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-xs text-slate-400 space-y-2">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="font-bold">Field MarketBiz</span>
                            <span className="font-bold">Ambil dari File JSON</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Email Google Service Account</span>
                            <span className="font-mono text-cyan-400">client_email</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Private Key Google (PEM)</span>
                            <span className="font-mono text-cyan-400">private_key</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Berikan Akses Service Account ke Properti GA4</h5>
                        <p className="text-xs text-slate-400">Masuk ke Google Analytics milik website yang ingin diintegrasikan. Buka: <strong>Admin &gt; Property Access Management &gt; Add Users</strong>.</p>
                        <p className="text-xs text-slate-400">Tambahkan email Service Account yang Anda buat sebagai <strong>Viewer</strong>.</p>
                        <p className="text-[10px] text-slate-500 italic">* Penting: Langkah ini wajib dilakukan untuk setiap Properti GA4 yang ingin dihubungkan.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Ambil ID Properti (Property ID) GA4</h5>
                        <p className="text-xs text-slate-400">Masuk ke: <strong>Google Analytics &gt; Admin &gt; Property Settings</strong>. Salin nilai <strong>Property ID</strong> (contoh: 415877848).</p>
                        <p className="text-xs text-amber-400">⚠️ Jangan menggunakan Measurement ID (G-XXXXXXXXXX). MarketBiz hanya menerima Property ID berupa angka.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Hubungkan Properti GA4 ke Proyek</h5>
                        <p className="text-xs text-slate-400">Buka <strong>SEO Dashboard</strong> proyek bersangkutan, lalu masukkan Property ID yang telah disalin dan simpan perubahan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {helpTab === 'gsc' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Panduan Pengaturan Google Search Console
                  </h4>
                  
                  <div className="space-y-6 text-sm text-slate-300">
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
                      <p className="text-xs text-indigo-200">Asumsi: Anda sudah membuat Service Account Google Cloud sesuai panduan GA4. Kita akan menggunakan Service Account yang sama untuk Search Console.</p>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Enable Google Search Console API</h5>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                          <li>Buka <a href="https://console.cloud.google.com" target="_blank" className="text-indigo-400 hover:underline">Google Cloud Console</a>.</li>
                          <li>Masuk ke proyek yang sama dengan GA4.</li>
                          <li>Buka <strong>APIs & Services &gt; Library</strong>.</li>
                          <li>Cari <strong>Google Search Console API</strong> lalu klik <strong>Enable</strong>.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Berikan Akses Service Account ke Properti GSC</h5>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                          <li>Buka dashboard <a href="https://search.google.com/search-console" target="_blank" className="text-indigo-400 hover:underline">Google Search Console</a>.</li>
                          <li>Pilih properti website Anda.</li>
                          <li>Masuk ke menu <strong>Settings</strong> (Pengaturan) di menu sebelah kiri.</li>
                          <li>Pilih <strong>Users and permissions</strong> (Pengguna dan izin).</li>
                          <li>Klik tombol <strong>Add User</strong> (Tambahkan pengguna).</li>
                          <li>Paste alamat email Service Account yang digunakan (sama seperti GA4).</li>
                          <li>Atur Permission (Izin) menjadi <strong>Restricted</strong> (Terbatas) atau Full.</li>
                          <li>Klik <strong>Add</strong>.</li>
                        </ul>
                        <p className="text-[10px] text-slate-500 italic">* Penting: Langkah ini wajib dilakukan untuk setiap Properti GSC (website) yang ingin ditarik datanya.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-white">Pastikan URL Website Terdaftar Sesuai</h5>
                        <p className="text-xs text-slate-400">Sistem mengambil data GSC berdasarkan URL website yang Anda daftarkan di menu Proyek MarketBiz. Pastikan URL-nya benar-benar cocok (termasuk <code>https://</code> atau awalan <code>www</code>) dengan yang terdaftar di Search Console.</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-3 border border-amber-500/20 bg-amber-500/10 rounded-xl">
                      <h5 className="font-bold text-amber-400 text-xs mb-1">Penting Diketahui</h5>
                      <p className="text-[11px] text-amber-200/70">Setelah API diaktifkan dan akun diundang, Google mungkin memerlukan waktu antara beberapa jam hingga maksimal 48 jam agar data pertama dapat ditarik oleh sistem melalui API dengan normal.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      if (!res.ok) throw new Error('Gagal mengambil daftar admin');
      const data = await res.json();
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert('Semua kolom wajib diisi.');
      return;
    }
    if (password.length < 6) {
      alert('Kata sandi harus minimal 6 karakter.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menambahkan admin baru');
      }

      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (admin: any) => {
    setEditingAdmin(admin);
    setEditFullName(admin.full_name || '');
    setEditEmail(admin.email || '');
    setEditIsActive(admin.is_active !== false); // Default to true if not specified
    setIsEditModalOpen(true);
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    if (!editFullName.trim() || !editEmail.trim()) {
      alert('Semua kolom wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          fullName: editFullName,
          email: editEmail,
          isActive: editIsActive
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal memperbarui admin');
      }

      setIsEditModalOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      <div className="high-tech-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Anggota Agensi</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            TAMBAH ADMIN
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
            <p className="text-xs text-slate-500">Memuat daftar anggota...</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {admins.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Belum ada anggota admin yang terdaftar.</div>
            ) : (
              admins.map((m, i) => (
                <div key={m.id || i} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white uppercase font-mono">
                      {m.full_name ? m.full_name[0] : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {m.full_name || 'Admin Baru'}
                        <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                          m.is_active !== false
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                          {m.is_active !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">{m.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{m.role}</p>
                    </div>
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
                      title="Edit Admin"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Add Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleAddAdmin}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Tambah Administrator Baru</h3>
              <p className="text-xs text-slate-500 mt-1">Daftarkan akun administrator baru untuk dapur agensi Anda.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budis@marketbiz.id"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              TAMBAHKAN ADMIN
            </button>
          </form>
        </div>
      )}

      {/* Modal Edit Admin */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditAdmin}
            className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6"
          >
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingAdmin(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Edit Administrator</h3>
              <p className="text-xs text-slate-500 mt-1">Perbarui detail profil atau nonaktifkan akun administrator ini.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nama Lengkap</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alamat Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="budis@marketbiz.id"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-white block">Status Akun</label>
                  <span className="text-[10px] text-slate-500">Nonaktifkan admin untuk memblokir akses login dasbor.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                    editIsActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                  )}
                >
                  {editIsActive ? "AKTIF" : "NONAKTIF"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-indigo-500 text-black font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              SIMPAN PERUBAHAN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function AgencyBranding({ settings, onSave, saving }: ComponentProps) {
  const [name, setName] = useState(settings.agency_name);
  const [email, setEmail] = useState(settings.support_email);
  const [whatsapp, setWhatsapp] = useState(settings.support_whatsapp);

  const handleSaveBranding = () => {
    onSave({
      agency_name: name,
      support_email: email,
      support_whatsapp: whatsapp
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      <div className="high-tech-card p-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 transition-all cursor-pointer bg-white/[0.02] shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Logo</span>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Agensi</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Dukungan</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp Dukungan</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +628123456789"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveBranding}
          disabled={saving}
          className="w-full py-2.5 bg-linear-to-r from-cyan-500 to-indigo-500 text-black rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SIMPAN INFORMASI BRANDING"}
        </button>
      </div>
    </div>
  );
}
