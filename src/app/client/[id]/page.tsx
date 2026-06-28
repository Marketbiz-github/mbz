'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Globe,
  User,
  Mail,
  CheckCircle2,
  Briefcase,
  Calendar,
  ExternalLink,
  Activity,
  History,
  FolderOpen,
  Key,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ClientDetail {
  id: string;
  name: string;
  website: string;
  picName: string;
  picEmail: string;
  status: string;
  services: string[];
  owner_id?: string;
}

interface Project {
  id: string;
  name: string;
  service: string;
  status: string;
  progress: number;
  lastUpdate: string;
  isActiveService: boolean;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const supabase = createClient();
  
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('All');
  const [tempPassword, setTempPassword] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!client || !client.owner_id) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/client/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: client.owner_id,
          name: client.name
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setTempPassword(data.newPassword);
        alert('Password reset successfully! New temporary password is: ' + data.newPassword);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchClientDetails = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Client & PIC Info & Services
        const { data: cData, error: cErr } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            website,
            status,
            owner_id,
            profiles (
              full_name,
              email
            ),
            client_services (
              services (
                name
              )
            )
          `)
          .eq('id', resolvedParams.id)
          .single();

        if (cErr) throw cErr;

        // 2. Fetch Projects
        const { data: pData, error: pErr } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            status,
            updated_at,
            services (
              name
            ),
            webdev_reports (
              progress_percentage
            )
          `)
          .eq('client_id', resolvedParams.id);

        if (pErr) throw pErr;

        if (!isMounted) return;

        let activeServicesList: string[] = [];

        if (cData) {
          const rawServices = cData.client_services as any[];
          activeServicesList = rawServices
            ? rawServices.map((cs: any) => cs.services?.name).filter(Boolean)
            : [];

          let clientStatus = 'Completed';
          if (cData.status === 'inactive') {
            clientStatus = 'Inactive';
          } else if (cData.status === 'warning') {
            clientStatus = 'Warning';
          } else {
            const hasActive = pData ? pData.some((p: any) => p.status === 'active') : false;
            clientStatus = hasActive ? 'Ongoing' : 'Completed';
          }

          const profileData = cData.profiles as unknown as { full_name: string; email: string } | null;

          setClient({
            id: cData.id,
            name: cData.name,
            website: cData.website || '',
            picName: profileData?.full_name || 'N/A',
            picEmail: profileData?.email || 'N/A',
            status: clientStatus,
            services: activeServicesList,
            owner_id: cData.owner_id
          });

          const defaultPassword = `mbz-${cData.name.toLowerCase().replace(/\s+/g, '')}-pwd`;
          setTempPassword(defaultPassword);
        }

        if (pData) {
          const mappedProjects: Project[] = pData.map((proj: any) => {
            const serviceName = proj.services?.name || 'General';
            const isActive = activeServicesList.includes(serviceName);
            
            // Determine progress
            let progress = 65;
            if (proj.status === 'completed') {
              progress = 100;
            } else if (serviceName === 'Web Development') {
              progress = proj.webdev_reports?.[0]?.progress_percentage || 0;
            }

            const dateStr = new Date(proj.updated_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return {
              id: proj.id,
              name: proj.name,
              service: serviceName,
              status: proj.status === 'active' ? 'Active' : 'Completed',
              progress,
              lastUpdate: dateStr,
              isActiveService: isActive
            };
          });

          setProjects(mappedProjects);
        }

      } catch (err: any) {
        console.error('Error fetching client details:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchClientDetails();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-400">Client Not Found</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  // Derive active and completed services
  const activeServices = client.services;
  const allPossibleServices = ['Sosmed', 'Email Blast', 'WA Blast', 'SEO', 'Web Development'];
  const completedServices = allPossibleServices.filter(s => !activeServices.includes(s));

  // Filter projects by sidetab selection
  const filteredProjects = projects.filter(proj => {
    if (selectedService === 'All') return proj.isActiveService;
    return proj.service === selectedService;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/client')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {client.name}
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
              client.status === 'Ongoing' && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
              client.status === 'Completed' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              client.status === 'Inactive' && "bg-red-500/10 text-red-400 border border-red-500/20",
              client.status === 'Warning' && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            )}>
              {client.status}
            </span>
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Globe className="w-4 h-4" /> {client.website}
            {client.website && (
              <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Services (Sidetabs) */}
        <div className="space-y-6">
          {/* PIC Info Card */}
          <div className="high-tech-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> PIC Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Name</p>
                <p className="text-white font-medium text-lg">{client.picName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Email</p>
                <p className="text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" /> {client.picEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Info Card */}
          <div className="high-tech-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Account Credentials
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Username / Email</p>
                <p className="text-white font-medium text-sm select-all">{client.picEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Temporary Password</p>
                <p className="text-amber-400 font-mono text-sm bg-white/5 px-2 py-1 rounded inline-block mt-1 select-all">
                  {tempPassword}
                </p>
              </div>
              <button 
                onClick={handleResetPassword}
                disabled={isResetting}
                className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    RESETTING...
                  </>
                ) : (
                  'RESET PASSWORD'
                )}
              </button>
            </div>
          </div>

          {/* Sidetab: Services */}
          <div className="high-tech-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Active Services
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedService('All')}
                  className={cn(
                    "w-full p-3 rounded-xl flex items-center justify-between border transition-all text-left font-bold text-sm",
                    selectedService === 'All'
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" /> All Active Projects
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">
                    {projects.filter(p => p.isActiveService).length}
                  </span>
                </button>

                {activeServices.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedService(s)}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center justify-between border transition-all text-left font-bold text-sm",
                      selectedService === s
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500" /> {s}
                    </span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">
                      {projects.filter(p => p.service === s).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History / Completed Services */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> Completed Services (History)
              </h3>
              <div className="flex flex-col gap-2">
                {completedServices.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedService(s)}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center justify-between border transition-all text-left text-sm",
                      selectedService === s
                        ? "bg-slate-800 border-white/20 text-white shadow-lg"
                        : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-slate-600" /> {s}
                    </span>
                    <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-slate-400">Archived</span>
                  </button>
                ))}
                {completedServices.length === 0 && (
                  <p className="text-slate-600 text-xs italic">No completed service history.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="high-tech-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> {selectedService === 'All' ? 'Total Active Projects' : `${selectedService} Projects`}
              </h3>
              <p className="text-3xl font-bold text-white mt-2">{filteredProjects.length}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => alert('Downloading PDF...')}
                className="flex-1 sm:flex-initial px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
              <button 
                onClick={() => alert('Downloading Excel...')}
                className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> EXCEL
              </button>
              <button className="flex-1 sm:flex-initial px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-sm font-bold transition-colors">
                + Project
              </button>
            </div>
          </div>

          <div className="high-tech-card overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Showing: {selectedService === 'All' ? 'All Active Projects' : selectedService}
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProjects.map(proj => (
                    <tr key={proj.id} className="hover:bg-white/2 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{proj.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {proj.lastUpdate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-300 border border-white/10">
                          {proj.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold",
                          proj.status === 'Active' ? 'text-cyan-400' : 'text-emerald-400'
                        )}>
                          • {proj.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                proj.progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
                              )}
                              style={{ width: `${proj.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-8">{proj.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                        No active or history projects found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
