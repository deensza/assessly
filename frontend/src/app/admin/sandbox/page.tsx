"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Server, Activity, Cpu, HardDrive, RefreshCw, Box, Loader2 } from "lucide-react";

export default function AdminSandbox() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containers = [
    { id: "cnt-881", name: "python-grader-01", status: "Running", cpu: "1.2%", ram: "45MB", uptime: "2d 4h" },
    { id: "cnt-882", name: "python-grader-02", status: "Running", cpu: "0.5%", ram: "42MB", uptime: "2d 4h" },
    { id: "cnt-883", name: "java-grader-01", status: "Idling", cpu: "0.0%", ram: "115MB", uptime: "1d 12h" },
    { id: "cnt-884", name: "cpp-grader-01", status: "Running", cpu: "14.2%", ram: "68MB", uptime: "5h 20m" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await adminApi.getSandboxConfig();
        setConfig(data);
      } catch (err) {
        setError('Sandbox konfigürasyonu yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    try {
      await adminApi.updateSandboxConfig(config);
      alert('Sandbox ayarları kaydedildi');
    } catch (err) {
      setError('Kaydedilirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 h-screen bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen text-slate-200">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Docker Sandbox Manager</h1>
          <p className="text-slate-400 mt-1">Monitor and manage the isolated execution environments.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-600/20">
          <RefreshCw size={18} /> Prune Unused
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center"><Box size={24} /></div>
           <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p><p className="text-2xl font-bold text-white">4 / 8</p></div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center"><Cpu size={24} /></div>
           <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cluster CPU</p><p className="text-2xl font-bold text-white">16.4%</p></div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center"><HardDrive size={24} /></div>
           <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Used</p><p className="text-2xl font-bold text-white">2.4 GB</p></div>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              <th className="px-8 py-4">Container ID</th>
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">CPU</th>
              <th className="px-8 py-4">RAM</th>
              <th className="px-8 py-4">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {containers.map(cnt => (
              <tr key={cnt.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-8 py-5 font-mono text-blue-400">{cnt.id}</td>
                <td className="px-8 py-5 text-slate-300 font-bold">{cnt.name}</td>
                <td className="px-8 py-5">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${
                     cnt.status === 'Running' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'
                   }`}>
                      {cnt.status}
                   </span>
                </td>
                <td className="px-8 py-5 font-mono text-slate-400">{cnt.cpu}</td>
                <td className="px-8 py-5 font-mono text-slate-400">{cnt.ram}</td>
                <td className="px-8 py-5 text-slate-500">{cnt.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
