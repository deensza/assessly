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
      try { setLoading(true); const data = await adminApi.getSandboxConfig(); setConfig(data); }
      catch (err) { setError('Sandbox konfigürasyonu yüklenemedi'); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    try { await adminApi.updateSandboxConfig(config); alert('Sandbox ayarları kaydedildi'); }
    catch (err) { setError('Kaydedilirken hata oluştu'); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-12 bg-[#f0f4f8]">
      <div className="flex flex-col items-center"><Loader2 size={48} className="animate-spin text-[#ff9800] mb-4" /><p className="text-gray-500 font-medium">Loading...</p></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#f0f4f8] min-h-full animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Docker Sandbox Manager</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor and manage the isolated execution environments.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200/50 text-sm">
          <RefreshCw size={16} /> Prune Unused
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up">
          <div className="w-12 h-12 bg-[#e8f1fb] text-[#4a90e2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Box size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Nodes</p><p className="text-2xl font-extrabold text-gray-900">4 / 8</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Cpu size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Cluster CPU</p><p className="text-2xl font-extrabold text-gray-900">16.4%</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up">
          <div className="w-12 h-12 bg-orange-50 text-[#ff9800] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><HardDrive size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage Used</p><p className="text-2xl font-extrabold text-gray-900">2.4 GB</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Container ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">CPU</th><th className="px-6 py-4">RAM</th><th className="px-6 py-4">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {containers.map(cnt => (
              <tr key={cnt.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-5 font-mono text-[#4a90e2] text-xs">{cnt.id}</td>
                <td className="px-6 py-5 text-gray-800 font-bold">{cnt.name}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${cnt.status === 'Running' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{cnt.status}</span>
                </td>
                <td className="px-6 py-5 font-mono text-gray-500">{cnt.cpu}</td>
                <td className="px-6 py-5 font-mono text-gray-500">{cnt.ram}</td>
                <td className="px-6 py-5 text-gray-400">{cnt.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
