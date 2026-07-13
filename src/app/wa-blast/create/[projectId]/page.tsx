'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Play,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

export default function CreateWABlastCampaign() {
  const { projectId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState('Loading...');
  const [campaignName, setCampaignName] = useState('');
  const [templateName, setTemplateName] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
  };

  // Manual Input State
  const [manualRows, setManualRows] = useState([{ name: '', phone: '', status: 'pending', tanggal: getCurrentDateTimeLocal() }]);

  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProject() {
      const { data } = await supabase.from('projects').select('name').eq('id', projectId).single();
      if (data) setProjectName(data.name);
    }
    fetchProject();
  }, [projectId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setParsing(true);
    try {
      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        setError('File is empty or invalid.');
        setParsing(false);
        return;
      }

      const headers = Object.keys(jsonData[0]).map(h => h.trim().toLowerCase());
      setCsvHeaders(headers);

      const hasPhone = headers.some(h => ['phone', 'phone_number', 'whatsapp', 'nomor', 'no_wa'].includes(h));
      if (!hasPhone) {
        setError('File must contain a phone number column (e.g. "phone" or "whatsapp").');
        setParsing(false);
        return;
      }

      setParsedData(jsonData);
    } catch (err) {
      setError('Failed to parse file. Please upload a valid Excel or CSV.');
    } finally {
      setParsing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setParsedData([]);
    setCsvHeaders([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addManualRow = () => {
    setManualRows([...manualRows, { name: '', phone: '', status: 'pending', tanggal: getCurrentDateTimeLocal() }]);
  };

  const updateManualRow = (index: number, field: 'name' | 'phone' | 'status' | 'tanggal', value: string) => {
    const newRows = [...manualRows];
    newRows[index][field] = value;
    setManualRows(newRows);
  };

  const removeManualRow = (index: number) => {
    const newRows = [...manualRows];
    newRows.splice(index, 1);
    setManualRows(newRows);
  };

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      setError('Please enter a campaign name.');
      return;
    }

    let finalDataToProcess: any[] = [];
    let finalHeaders: string[] = [];

    if (activeTab === 'upload') {
      if (parsedData.length === 0) {
        setError('Please upload a valid file with recipient data.');
        return;
      }
      finalDataToProcess = parsedData;
      finalHeaders = csvHeaders;
    } else {
      const validRows = manualRows.filter(r => r.phone.trim() !== '');
      if (validRows.length === 0) {
        setError('Please enter at least one valid phone number.');
        return;
      }
      finalDataToProcess = validRows.map(r => ({ name: r.name, phone: r.phone }));
      finalHeaders = ['name', 'phone'];
    }

    setLoading(true);
    setError('');

    try {
      // 1. Prepare Recipients Data first so we can calculate stats
      const phoneKeys = ['phone', 'phone_number', 'whatsapp', 'no_wa', 'nomor'];
      const nameKeys = ['name', 'nama', 'full_name', 'first_name'];
      const statusKeys = ['status', 'state'];
      const dateKeys = ['tanggal', 'date', 'sent_at', 'waktu'];

      const phoneKey = finalHeaders.find(h => phoneKeys.includes(h)) || finalHeaders[0];
      const nameKey = finalHeaders.find(h => nameKeys.includes(h));
      const statusKey = finalHeaders.find(h => statusKeys.includes(h));
      const dateKey = finalHeaders.find(h => dateKeys.includes(h));

      const validStatuses = ['pending', 'sent', 'delivered', 'read', 'failed'];

      let initialDelivered = 0;
      let initialRead = 0;
      let initialFailed = 0;

      const recipientsToInsert = finalDataToProcess.map(row => {
        const originalPhoneKey = Object.keys(row).find(k => k.trim().toLowerCase() === phoneKey) || phoneKey;
        const originalNameKey = nameKey ? (Object.keys(row).find(k => k.trim().toLowerCase() === nameKey) || nameKey) : null;
        const originalStatusKey = statusKey ? (Object.keys(row).find(k => k.trim().toLowerCase() === statusKey) || statusKey) : null;
        const originalDateKey = dateKey ? (Object.keys(row).find(k => k.trim().toLowerCase() === dateKey) || dateKey) : null;

        const phone = String(row[originalPhoneKey] || '').replace(/[^0-9]/g, '');
        const name = originalNameKey ? row[originalNameKey] : '';
        
        let status = 'pending';
        if (originalStatusKey && row[originalStatusKey]) {
          const rawStatus = String(row[originalStatusKey]).toLowerCase().trim();
          if (validStatuses.includes(rawStatus)) {
            status = rawStatus;
          }
        }
        if (activeTab === 'manual' && row.status && validStatuses.includes(row.status.toLowerCase())) {
          status = row.status.toLowerCase();
        }

        if (status === 'delivered') initialDelivered++;
        if (status === 'read') initialRead++;
        if (status === 'failed') initialFailed++;

        let sentAt = null;
        if (originalDateKey && row[originalDateKey]) {
          const dateVal = row[originalDateKey];
          if (dateVal) {
             const parsedDate = new Date(dateVal);
             if (!isNaN(parsedDate.getTime())) {
               sentAt = parsedDate.toISOString();
             }
          }
        }
        if (activeTab === 'manual' && row.tanggal) {
          const parsedDate = new Date(row.tanggal);
          if (!isNaN(parsedDate.getTime())) {
            sentAt = parsedDate.toISOString();
          }
        }

        const dynamic_data = { ...row };
        delete dynamic_data[originalPhoneKey];
        if (originalNameKey) delete dynamic_data[originalNameKey];
        if (originalStatusKey) delete dynamic_data[originalStatusKey];
        if (originalDateKey) delete dynamic_data[originalDateKey];
        if (activeTab === 'manual') {
          delete dynamic_data['status'];
          delete dynamic_data['tanggal'];
        }

        return {
          phone_number: phone,
          name: name,
          dynamic_data: dynamic_data,
          status: status,
          sent_at: sentAt
        };
      });

      // 2. Create Report (Campaign)
      const { data: reportData, error: reportErr } = await supabase
        .from('wa_blast_reports')
        .insert({
          project_id: projectId,
          campaign_name: campaignName,
          template_name: templateName,
          status: 'running',
          total_sent: recipientsToInsert.length,
          delivered: initialDelivered,
          read: initialRead,
          failed: initialFailed,
          source: 'manual'
        })
        .select()
        .single();

      if (reportErr) throw reportErr;

      // Add report_id to recipients
      const finalRecipients = recipientsToInsert.map(r => ({ ...r, report_id: reportData.id }));

      // 3. Insert Recipients in chunks (if large)
      const chunkSize = 500;
      for (let i = 0; i < finalRecipients.length; i += chunkSize) {
        const chunk = finalRecipients.slice(i, i + chunkSize);
        const { error: recErr } = await supabase
          .from('wa_blast_recipients')
          .insert(chunk);

        if (recErr) throw recErr;
      }

      // 4. Redirect to project detail or report detail
      router.push(`/wa-blast/report/${reportData.id}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the campaign.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href={`/wa-blast/detail/${projectId}`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create Campaign
          </h1>
          <p className="text-slate-400 mt-1">
            Project: <span className="text-emerald-400 font-semibold">{projectName}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="high-tech-card p-6 bg-slate-900/40">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
              Campaign Info
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Campaign Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Promo Merdeka"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Template Name / ID</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. template_promo_v1"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Target Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="high-tech-card p-6 bg-slate-900/40">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
              Recipients Data
            </h3>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer flex gap-2 items-center ${activeTab === 'upload' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Upload Excel / CSV
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer flex gap-2 items-center ${activeTab === 'manual' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <FileText className="w-4 h-4" />
                Manual Input
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div>
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 bg-white/2 hover:bg-emerald-500/5 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-emerald-400 mb-4 transition-colors" />
                    <h4 className="text-base font-bold text-white mb-1">Upload Excel/CSV File</h4>
                    <p className="text-sm text-slate-400 max-w-sm mb-4">
                      Drag and drop your file here, or click to browse. Must contain a phone number column.
                    </p>
                    <button className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                      Select File
                    </button>
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{file.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {(file.size / 1024).toFixed(2)} KB • {parsedData.length} rows found
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Remove File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {parsing ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                      </div>
                    ) : parsedData.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Data Preview (First 5 Rows)</h4>
                        <div className="overflow-x-auto rounded-lg border border-white/10">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-white/5">
                              <tr>
                                {csvHeaders.map((header, i) => (
                                  <th key={i} className="px-4 py-2 font-bold text-slate-300 capitalize">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {parsedData.slice(0, 5).map((row, i) => (
                                <tr key={i} className="bg-slate-900/50">
                                  {csvHeaders.map((header, j) => {
                                    const originalKey = Object.keys(row).find(k => k.trim().toLowerCase() === header) || header;
                                    return <td key={j} className="px-4 py-2 text-slate-400">{row[originalKey]}</td>;
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {parsedData.length > 5 && (
                          <p className="text-xs text-slate-500 mt-2 text-center">...and {parsedData.length - 5} more rows.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Visual Format Example */}
                {!file && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contoh Format Excel Yang Benar</h4>
                    <p className="text-xs text-slate-400 mb-3">Pastikan baris pertama adalah judul kolom. Data yang dibaca hanyalah data input target pesan, bukan laporan status.</p>
                    <div className="overflow-hidden rounded-lg border border-emerald-500/30 overflow-x-auto">
                      <table className="w-full text-left text-xs bg-slate-900 min-w-[600px]">
                        <thead className="bg-emerald-500/10">
                          <tr>
                            <th className="px-4 py-2 font-bold text-emerald-400 border-b border-emerald-500/20 border-r">nama</th>
                            <th className="px-4 py-2 font-bold text-emerald-400 border-b border-emerald-500/20 border-r">phone_number</th>
                            <th className="px-4 py-2 font-bold text-emerald-400 border-b border-emerald-500/20 border-r text-slate-500 italic font-normal">(opsional) status</th>
                            <th className="px-4 py-2 font-bold text-emerald-400 border-b border-emerald-500/20 border-r text-slate-500 italic font-normal">(opsional) tanggal</th>
                            <th className="px-4 py-2 font-bold text-emerald-400 border-b border-emerald-500/20 text-slate-500 italic font-normal">(opsional) info_lain</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          <tr>
                            <td className="px-4 py-2 border-r border-white/5 border-b">Budi Santoso</td>
                            <td className="px-4 py-2 border-r border-white/5 border-b">081234567890</td>
                            <td className="px-4 py-2 border-r border-white/5 border-b text-slate-400">sent</td>
                            <td className="px-4 py-2 border-r border-white/5 border-b text-slate-400">2026-07-13 10:00</td>
                            <td className="px-4 py-2 border-b border-white/5">...</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 border-r border-white/5">Siti Aminah</td>
                            <td className="px-4 py-2 border-r border-white/5">089876543210</td>
                            <td className="px-4 py-2 border-r border-white/5 text-slate-400">pending</td>
                            <td className="px-4 py-2 border-r border-white/5 text-slate-400"></td>
                            <td className="px-4 py-2">...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 px-2">
                  <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama</div>
                  <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">No. WhatsApp</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</div>
                  <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tanggal (Opsional)</div>
                  <div className="col-span-1"></div>
                </div>
                {manualRows.map((row, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={row.name}
                        onChange={(e) => updateManualRow(index, 'name', e.target.value)}
                        placeholder="Nama"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={row.phone}
                        onChange={(e) => updateManualRow(index, 'phone', e.target.value)}
                        placeholder="08123456..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <select 
                        value={row.status}
                        onChange={(e) => updateManualRow(index, 'status', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      >
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="read">Read</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="datetime-local" 
                        value={row.tanggal}
                        onChange={(e) => updateManualRow(index, 'tanggal', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button 
                        onClick={() => removeManualRow(index)}
                        disabled={manualRows.length === 1}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <button
                    onClick={addManualRow}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> TAMBAH BARIS
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              onClick={handleSubmit}
              disabled={loading || (activeTab === 'upload' && (!file || parsedData.length === 0)) || (activeTab === 'manual' && manualRows.every(r => r.phone.trim() === ''))}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-black px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  CREATING CAMPAIGN...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  LAUNCH CAMPAIGN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
