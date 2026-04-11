"use client";
import { Server, Cpu, HardDrive, Network, Activity, Container, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center">
            Infrastructure Overview
          </h1>
          <p className="text-slate-400 mt-2">Welcome Murat (IT Admin). Monitor server health, Moodle integration, and Docker execution engines.</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-orange-600/20 text-sm flex items-center">
          <Activity className="w-4 h-4 mr-2"/> Restart All Nodes
        </button>
      </div>

      {/* Hardware Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#151821] border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full"/>
          <div className="flex items-center text-slate-400 mb-4">
            <Cpu className="w-5 h-5 mr-2 text-blue-400"/> Processing (CPU)
          </div>
          <div className="text-3xl font-bold mb-2">34%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "34%" }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-3 text-right">Intel Xeon E-2288G</div>
        </div>

        <div className="bg-[#151821] border border-amber-900/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.05)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full"/>
          <div className="flex items-center text-slate-400 mb-4">
            <Server className="w-5 h-5 mr-2 text-amber-400"/> Memory (RAM)
          </div>
          <div className="text-3xl font-bold text-amber-50 mb-2">12.4 / 32 GB</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "38%" }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-3 text-right">Swap usage: 0%</div>
        </div>

        <div className="bg-[#151821] border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full"/>
          <div className="flex items-center text-slate-400 mb-4">
            <HardDrive className="w-5 h-5 mr-2 text-emerald-400"/> Storage Limit
          </div>
          <div className="text-3xl font-bold mb-2">412 GB</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "68%" }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-3 text-right">68% of 1TB allocated</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Docker Sandbox Status */}
        <div className="glass-adaptive p-6 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center">
              <Container className="w-5 h-5 mr-2 text-indigo-400"/> Docker Sandbox Environments
            </h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">Active</span>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-[var(--background)] border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wide">python:3.9-slim (assessly-runner-py)</span>
                <span className="text-xs text-slate-500">Image size: 114MB • Ready instances: 4</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
            </div>

            <div className="p-3 bg-[var(--background)] border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wide">gcc:latest (assessly-runner-c)</span>
                <span className="text-xs text-slate-500">Image size: 1.2GB • Ready instances: 2</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
            </div>

            <div className="p-3 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wide text-rose-400">node:18-alpine (assessly-runner-js)</span>
                <span className="text-xs text-slate-500 text-rose-500">Error allocating memory. Check Swap.</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-500"/>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">View detailed container logs →</button>
          </div>
        </div>

        {/* LMS Moodle Integration Logs */}
        <div className="glass-adaptive p-6 rounded-2xl border-l-4 border-orange-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center">
              <Network className="w-5 h-5 mr-2 text-orange-400"/> Moodle API Traffic
            </h2>
            <div className="flex space-x-2 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400">Connection OK</span>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-slate-400 overflow-hidden h-48 flex flex-col space-y-2 relative border border-slate-800">
             <div className="text-emerald-400">[2023-04-09 14:15:02] POST /api/moodle/sync 200 OK - 145ms</div>
             <div className="text-blue-400">[2023-04-09 14:12:45] Webhook triggered from elearning.university.edu</div>
             <div className="text-emerald-400">[2023-04-09 14:10:11] GET /api/moodle/users 200 OK - 42ms</div>
             <div className="text-rose-400">[2023-04-09 13:59:20] POST /api/moodle/grades 401 Unauthorized - Invalid Moodle Token</div>
             <div className="text-slate-500">... Auth handshake regenerated context ...</div>
             <div className="text-emerald-400">[2023-04-09 13:45:00] Scheduled sync completed. 120 submissions imported.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
