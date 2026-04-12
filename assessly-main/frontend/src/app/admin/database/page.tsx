"use client";
import { Database, Table, HardDrive, ShieldCheck, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminDatabase() {
  const tables = [
    { name: "users", rows: 1245, size: "124 KB", integrity: "Clear" },
    { name: "assignments", rows: 42, size: "56 KB", integrity: "Clear" },
    { name: "submissions", rows: 8420, size: "12.4 MB", integrity: "Clear" },
    { name: "logs", rows: 154200, size: "142.8 MB", integrity: "Clear" },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen text-slate-200">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Database Health Service</h1>
        <p className="text-slate-400 mt-1">Manage SQLite tables and system storage integrity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Table size={16} /> Table Statistics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900/20">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Rows</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {tables.map(t => (
                  <tr key={t.name}>
                    <td className="px-6 py-4 font-bold text-slate-300">{t.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{t.rows}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{t.size}</td>
                    <td className="px-6 py-4"><span className="text-green-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 size={12}/> {t.integrity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center"><ShieldCheck size={24}/></div>
                 <div>
                    <h3 className="text-white font-bold text-lg">Integrity Check</h3>
                    <p className="text-slate-400 text-sm">Last run: 14 mins ago</p>
                 </div>
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition-all">Run Now</button>
           </div>

           <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 px-2">Storage Footprint</h3>
              <div className="space-y-6 px-2">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-slate-300">Database Engine</span><span className="text-slate-400">142 MB</span></div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: '65%'}}></div></div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-slate-300">Submission Assets</span><span className="text-slate-400">2.1 GB</span></div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{width: '24%'}}></div></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
