'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Activity,
  History,
  FolderOpen,
  CheckCircle2,
  Briefcase,
  Download,
  Calendar,
  X,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface ClientDetail {
  id: string;
  name: string;
  website: string;
  status: string;
  services: string[];
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

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;

    const fetchClientDetails = async () => {
      if (!user) return;
      setIsLoading(true);
      
      try {
        // 1. Fetch Client Info & Services for this user
        const { data: cData, error: cErr } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            website,
            status,
            client_services (
              service_id,
              services (
                id,
                name
              )
            )
          `)
          .eq('owner_id', user.id)
          .single();

        if (cErr) throw cErr;
        
        if (!cData) {
          if (isMounted) setIsLoading(false);
          return;
        }

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
          .eq('client_id', cData.id);

        if (pErr) throw pErr;

        if (!isMounted) return;

        let activeServicesList: string[] = [];
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

        setClient({
          id: cData.id,
          name: cData.name,
          website: cData.website || '',
          status: clientStatus,
          services: activeServicesList,
        });

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
        console.error('Error fetching dashboard details:', err.message);
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
  }, [user, supabase]);

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
        <h2 className="text-2xl font-bold text-slate-400">Dashboard Not Available</h2>
        <p className="text-sm text-slate-500 mt-2">No client profile is associated with your account.</p>
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
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hello, {client.name}!
        </h1>
        <p className="text-slate-400 mt-1">Here is the summary of your active services and projects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="high-tech-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Account Status</h3>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                client.status === 'Ongoing' ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" :
                client.status === 'Completed' ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                "bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              )}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{client.status}</p>
                <p className="text-xs text-slate-400">Current Status</p>
              </div>
            </div>
            
            {client.website && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Website</p>
                <a href={client.website} target="_blank" rel="noreferrer" className="text-cyan-400 font-medium text-sm hover:underline mt-1 block">
                  {client.website}
                </a>
              </div>
            )}
          </div>

          {/* Sidetab: Services */}
          <div className="high-tech-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Active Services
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
                <Briefcase className="w-4 h-4 text-cyan-400" /> {selectedService === 'All' ? 'Total Active Projects' : `${selectedService} Projects`}
              </h3>
              <p className="text-3xl font-bold text-white mt-2">{filteredProjects.length}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => alert('Downloading PDF...')}
                className="flex-1 sm:flex-initial px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
              <button 
                onClick={() => alert('Downloading Excel...')}
                className="flex-1 sm:flex-initial px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> EXCEL
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
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4 whitespace-nowrap">Project Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Service</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProjects.map(proj => {
                      const getServiceRoute = (serviceName: string) => {
                        switch(serviceName) {
                          case 'SEO': return '/client/seo';
                          case 'Email Blast': return '/client/email';
                          case 'Sosmed': return '/client/sosmed';
                          case 'WA Blast': return '/client/wa-blast';
                          default: return '#';
                        }
                      };
                      return (
                      <tr 
                        key={proj.id} 
                        className="hover:bg-white/2 transition-colors cursor-pointer group"
                        onClick={() => {
                          const route = getServiceRoute(proj.service);
                          if (route !== '#') router.push(route);
                        }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{proj.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3" /> {proj.lastUpdate}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-300 border border-white/10 whitespace-nowrap">
                            {proj.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs font-bold whitespace-nowrap",
                            proj.status === 'Active' ? 'text-cyan-400' : 'text-emerald-400'
                          )}>
                            • {proj.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 min-w-[120px]">
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
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
                    );
                    })}
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
    </div>
  );
}
