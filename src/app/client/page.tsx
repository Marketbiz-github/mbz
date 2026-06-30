'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter,
  Plus,
  X,
  CheckCircle2,
  BarChart3,
  Mail,
  Globe,
  User,
  Edit2,
  MessageCircle,
  Code,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export interface Client {
  id: any;
  name: string;
  website: string;
  picName: string;
  picEmail: string;
  status: string;
  totalServices: number;
  totalProjects: number;
  services: string[];
  owner_id?: string;
  rawStatus?: string;
}

export default function ClientManagementPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Clients Management | MarketBiz";
  }, []);
  
  const [newClient, setNewClient] = useState({
    name: '',
    website: '',
    picName: '',
    picEmail: '',
    services: [] as string[],
    status: 'active'
  });

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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
          ),
          projects (
            id,
            status
          )
        `);

      if (error) throw error;

      if (data) {
        const mapped: Client[] = data.map((c: any) => {
          // Calculate client status based on project list & global status
          let clientStatus = 'Completed';
          if (c.status === 'inactive') {
            clientStatus = 'Inactive';
          } else if (c.status === 'warning') {
            clientStatus = 'Warning';
          } else {
            const hasActiveProjects = c.projects?.some((p: any) => p.status === 'active');
            clientStatus = hasActiveProjects ? 'Ongoing' : 'Completed';
          }

          // Extract service names
          const servicesList = c.client_services
            ? c.client_services.map((cs: any) => cs.services?.name).filter(Boolean)
            : [];

          return {
            id: c.id,
            name: c.name,
            website: c.website || '',
            picName: c.profiles?.full_name || 'N/A',
            picEmail: c.profiles?.email || 'N/A',
            status: clientStatus,
            totalServices: servicesList.length,
            totalProjects: c.projects?.length || 0,
            services: servicesList,
            owner_id: c.owner_id,
            rawStatus: c.status || 'active'
          };
        });

        setClients(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const toggleServiceNew = (service: string) => {
    setNewClient(prev => ({
      ...prev,
      services: prev.services.includes(service) 
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const toggleServiceEdit = (service: string) => {
    if (!editingClient) return;
    setEditingClient((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        services: prev.services.includes(service) 
          ? prev.services.filter((s: string) => s !== service)
          : [...prev.services, service]
      };
    });
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await fetchClients();
        setShowAddModal(false);
        setNewClient({ name: '', website: '', picName: '', picEmail: '', services: [], status: 'active' });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/client', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingClient,
          status: editingClient.rawStatus
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await fetchClients();
        setShowEditModal(false);
        setEditingClient(null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.picName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ? true : client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Ongoing').length;
  const totalServices = clients.reduce((acc, curr) => acc + curr.totalServices, 0);
  const totalProjects = clients.reduce((acc, curr) => acc + curr.totalProjects, 0);
  
  const completedProjectsCount = clients.reduce((acc, curr) => {
    if (curr.status === 'Completed') return acc + curr.totalProjects;
    return acc + Math.floor(curr.totalProjects / 2);
  }, 0);
  const projectCompletionRate = totalProjects > 0 
    ? Math.round((completedProjectsCount / totalProjects) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Management</h1>
          <p className="text-slate-400 mt-1">Central management for clients and their subscribed services.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ADD NEW CLIENT
        </button>
      </div>

      {/* Section 1: Client Metrics */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <span className="w-1.5 h-3 bg-cyan-400 rounded-xs"></span>
          Metrik Client & Workload
        </div>
        <button 
          onClick={() => setIsHelpModalOpen(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Penjelasan Metrik
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Active Clients</p>
            <h3 className="text-2xl font-bold text-white">{activeClients}</h3>
          </div>
        </div>
        
        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Clients</p>
            <h3 className="text-2xl font-bold text-white">{totalClients}</h3>
          </div>
        </div>

        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Services</p>
            <h3 className="text-2xl font-bold text-white">{totalServices}</h3>
          </div>
        </div>

        <div className="high-tech-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Projects</p>
            <h3 className="text-2xl font-bold text-white">{totalProjects}</h3>
          </div>
        </div>

        <div className="high-tech-card p-6 flex items-center gap-4 col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Project Done %</p>
            <h3 className="text-2xl font-bold text-white">{projectCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Client Table */}
      <div className="high-tech-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Status</option>
              <option value="Ongoing" className="bg-slate-900 text-white">Ongoing</option>
              <option value="Completed" className="bg-slate-900 text-white">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left min-w-[950px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-16">No.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Website</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">PIC</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Workload</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client, index) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-white/4 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/client/${client.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                          {client.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{client.name}</p>
                          <p className="text-xs text-slate-500">
                            <span className={client.status === 'Ongoing' ? "text-cyan-400" : "text-emerald-400"}>
                              • {client.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Globe className="w-4 h-4 text-slate-500" />
                        {client.website || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-500" /> {client.picName || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 ml-6">{client.picEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 uppercase tracking-tighter">Services</p>
                          <p className="text-sm font-bold text-cyan-400">{client.totalServices}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 uppercase tracking-tighter">Projects</p>
                          <p className="text-sm font-bold text-purple-400">{client.totalProjects}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingClient(client);
                            setShowEditModal(true);
                          }}
                          className="p-2 bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            router.push(`/client/${client.id}`); 
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold transition-colors"
                        >
                          DETAILS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                      No clients matched search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-lg high-tech-card bg-slate-900 border-cyan-500/30 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 md:p-8 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                New Client
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <form onSubmit={handleAddClient} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name</label>
                <input 
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="E.g. Ipaymu"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Website</label>
                <input 
                  value={newClient.website}
                  onChange={(e) => setNewClient({...newClient, website: e.target.value})}
                  placeholder="E.g. ipaymu.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PIC Name</label>
                  <input 
                    required
                    value={newClient.picName}
                    onChange={(e) => setNewClient({...newClient, picName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PIC Email</label>
                  <input 
                    required type="email"
                    value={newClient.picEmail}
                    onChange={(e) => setNewClient({...newClient, picEmail: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Status</label>
                <select
                  value={newClient.status}
                  onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  <option value="active" className="bg-slate-900 text-white">Active (Subscribed)</option>
                  <option value="inactive" className="bg-slate-900 text-white">Inactive (Unsubscribed)</option>
                  <option value="warning" className="bg-slate-900 text-white">Warning (Suspended)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Initial Services</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { id: 'Sosmed', icon: BarChart3 },
                    { id: 'Email Blast', icon: Mail },
                    { id: 'WA Blast', icon: MessageCircle },
                    { id: 'SEO', icon: Search },
                    { id: 'Web Development', icon: Code },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleServiceNew(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all",
                        newClient.services.includes(s.id)
                          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                      )}
                    >
                      <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-center">{s.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      SAVING CLIENT...
                    </>
                  ) : (
                    'SAVE CLIENT'
                  )}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEditModal(false)}></div>
          <div className="relative w-full max-w-lg high-tech-card bg-slate-900 border-cyan-500/30 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 md:p-8 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                Edit Client
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <form onSubmit={handleEditClient} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name</label>
                <input 
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Website</label>
                <input 
                  value={editingClient.website}
                  onChange={(e) => setEditingClient({...editingClient, website: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PIC Name</label>
                  <input 
                    required
                    value={editingClient.picName}
                    onChange={(e) => setEditingClient({...editingClient, picName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PIC Email</label>
                  <input 
                    required type="email"
                    value={editingClient.picEmail}
                    onChange={(e) => setEditingClient({...editingClient, picEmail: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Status</label>
                <select
                  value={editingClient.rawStatus || 'active'}
                  onChange={(e) => setEditingClient({...editingClient, rawStatus: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  <option value="active" className="bg-slate-900 text-white">Active (Subscribed)</option>
                  <option value="inactive" className="bg-slate-900 text-white">Inactive (Unsubscribed)</option>
                  <option value="warning" className="bg-slate-900 text-white">Warning (Suspended)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Subscribed Services</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { id: 'Sosmed', icon: BarChart3 },
                    { id: 'Email Blast', icon: Mail },
                    { id: 'WA Blast', icon: MessageCircle },
                    { id: 'SEO', icon: Search },
                    { id: 'Web Development', icon: Code },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleServiceEdit(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all",
                        editingClient.services.includes(s.id)
                          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                      )}
                    >
                      <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-center">{s.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      UPDATING CLIENT...
                    </>
                  ) : (
                    'UPDATE CLIENT'
                  )}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="high-tech-card p-6 max-w-lg w-full space-y-6 relative border-cyan-500/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Penjelasan Metrik Client Management
              </h3>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <p className="font-bold text-cyan-400">1. Active Clients</p>
                <p className="text-slate-400">Jumlah klien yang saat ini memiliki minimal satu proyek berjalan (Ongoing) dengan status aktif.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">2. Total Clients</p>
                <p className="text-slate-400">Jumlah seluruh data klien yang terdaftar di database agensi (termasuk yang aktif, nonaktif, maupun ditangguhkan).</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">3. Total Services</p>
                <p className="text-slate-400">Akumulasi total jenis layanan yang sedang disewa/aktif digunakan oleh seluruh klien yang terdaftar.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">4. Total Projects</p>
                <p className="text-slate-400">Akumulasi total seluruh proyek kerja (baik yang sedang berjalan maupun telah selesai) yang sedang dikelola agensi.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-cyan-400">5. Project Done % (Rasio Penyelesaian)</p>
                <p className="text-slate-400">Persentase rasio proyek yang telah sukses diselesaikan (Completed) dibandingkan dengan total seluruh proyek yang terdaftar.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Pahami & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
