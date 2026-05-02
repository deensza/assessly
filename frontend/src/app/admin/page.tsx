"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Database, Activity, Server, ShieldCheck, HardDrive, Cpu, Search, Trash2, Download, Terminal, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await adminApi.getSandboxConfig();
        setConfig(data);
      } catch (err) {
        setError('Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#f4f7f9] h-[calc(100vh-60px)]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-[#4a90e2] mb-4" />
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-[#f4f7f9] p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IT Administration Dashboard</h1>
        <p className="text-gray-500">Global system monitoring, database maintenance, and resource management.</p>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Real-time Status Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Health</div>
            <div className="text-xl font-bold text-gray-900">Optimal (99.9%)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Server size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sandbox Config</div>
            <div className="text-xl font-bold text-gray-900">{config?.max_containers || 0} Max Containers</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Database size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Database Backup</div>
            <div className="text-xl font-bold text-gray-900">2h Ago</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Database Management Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Database size={18} className="text-[#4a90e2]" />
              Store: assessly.db
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Usage Rate</span>
                  <span>28%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#4a90e2]" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100/50">
                  <span className="text-sm text-gray-600 font-medium">Schema Version</span>
                  <span className="text-sm font-bold text-[#4a90e2]">v2.4.0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-100/50">
                  <span className="text-sm text-gray-600 font-medium">Last Vacuum</span>
                  <span className="text-sm font-bold text-green-600">Apr 11</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="flex items-center justify-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold transition-colors">
                  <Download size={14} /> EXPORT
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-600 transition-colors">
                  <Trash2 size={14} /> PURGE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Logs (Terminal) */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-3 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               </div>
               <div className="h-4 w-[1px] bg-gray-700 mx-2"></div>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Terminal size={14} />
                  <span>system_monitor@assessly: ~/logs</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                LIVE
              </span>
            </div>
          </div>
          <div className="p-6 font-mono text-xs leading-relaxed overflow-hidden flex-1 flex flex-col">
            <div className="space-y-1 opacity-90">
              <div className="text-gray-500">[2026-04-12 01:21:04] <span className="text-green-400">INFO</span> Docker supervisor started (PID: 8842)</div>
              <div className="text-gray-500">[2026-04-12 01:21:05] <span className="text-blue-400">DEBUG</span> Initializing network stack... done.</div>
              <div className="text-gray-500">[2026-04-12 01:21:05] <span className="text-blue-400">DEBUG</span> Pulling execution image: python:3.12-slim</div>
              <div className="text-gray-500">[2026-04-12 01:21:08] <span className="text-green-400">INFO</span> Successfully attached assessly-sandbox_net</div>
              <div className="text-gray-500">[2026-04-12 01:21:10] <span className="text-orange-400">WARN</span> Low memory overhead detected on Node-04</div>
              <div className="text-gray-500">[2026-04-12 01:23:44] <span className="text-green-400">INFO</span> Grading job submitted: SUB_ID_992 (User: 104)</div>
              <div className="text-gray-500">[2026-04-12 01:23:45] <span className="text-blue-400">DEBUG</span> Creating container for submission 992...</div>
              <div className="text-blue-400 animate-pulse mt-2 italic flex items-center gap-2">
                 <span>$ tail -f /var/log/assessly/engine.log</span>
                 <div className="w-2 h-4 bg-blue-400"></div>
              </div>
            </div>
            <div className="flex-1"></div>
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-gray-500 text-[10px]">
               <span>6 active processes</span>
               <span>CPU: 4.2% | RAM: 512MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
