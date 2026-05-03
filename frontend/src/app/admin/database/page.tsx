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
    <div className="p-8 space-y-8 bg-[#f0f4f8] min-h-full animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Database Health Service</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage SQLite tables and system storage integrity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Table size={16} className="text-[#ff9800]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Table Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-50/30">
                <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Rows</th><th className="px-6 py-3">Size</th><th className="px-6 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {tables.map(t => (
                  <tr key={t.name} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{t.name}</td>
                    <td className="px-6 py-4 font-mono text-gray-500">{t.rows}</td>
                    <td className="px-6 py-4 font-mono text-gray-500">{t.size}</td>
                    <td className="px-6 py-4"><span className="text-green-600 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 size={12}/> {t.integrity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><ShieldCheck size={24}/></div>
              <div><h3 className="text-gray-900 font-bold text-lg">Integrity Check</h3><p className="text-gray-400 text-sm">Last run: 14 mins ago</p></div>
            </div>
            <button className="bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-100">Run Now</button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6 px-2">Storage Footprint</h3>
            <div className="space-y-5 px-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-gray-700 font-medium">Database Engine</span><span className="text-gray-400">142 MB</span></div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] rounded-full" style={{width: '65%'}}></div></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-gray-700 font-medium">Submission Assets</span><span className="text-gray-400">2.1 GB</span></div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#ff9800] to-[#f19716] rounded-full" style={{width: '24%'}}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
