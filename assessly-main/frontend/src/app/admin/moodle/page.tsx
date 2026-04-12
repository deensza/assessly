"use client";
import { Network, Activity, RefreshCw, CheckCircle2, AlertCircle, Share2 } from "lucide-react";

export default function AdminMoodleBridge() {
  const syncLogs = [
    { id: 1045, event: "Course Pull", target: "COMP 3304", timestamp: "Today, 11:20", status: "Success" },
    { id: 1044, event: "Grade Push", target: "Assignment #8", timestamp: "Today, 10:15", status: "Success" },
    { id: 1043, event: "User Sync", target: "Section A", timestamp: "Today, 09:00", status: "Success" },
    { id: 1042, event: "Auth Token Refresh", target: "System", timestamp: "Yesterday, 23:55", status: "Success" },
    { id: 1041, event: "Grade Push", target: "Assignment #7", timestamp: "Yesterday, 20:20", status: "Partial Failure" },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen text-slate-200">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Moodle API Bridge</h1>
          <p className="text-slate-400 mt-1">Status of synchronization and communication with the university LMS.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 text-xs font-bold uppercase">Connected</span>
           </div>
           <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all"><RefreshCw size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-4 tracking-widest">Bridge Configuration</h3>
              <div className="space-y-4">
                 <div><p className="text-[10px] text-slate-500 mb-1">Moodle Endpoint</p><p className="text-sm font-mono text-blue-400 break-all">https://moodle.yasar.edu.tr/webservice/rest/server.php</p></div>
                 <div><p className="text-[10px] text-slate-500 mb-1">Last Handshake</p><p className="text-sm text-slate-300">Oct 12, 01:30:04</p></div>
                 <div><p className="text-[10px] text-slate-500 mb-1">Active Protocols</p><p className="text-sm text-slate-300">REST, XM-RPC, OAuth 2.0</p></div>
              </div>
           </div>
           <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-900/40 text-white">
              <Share2 size={32} className="mb-4 opacity-50" />
              <h3 className="font-bold text-lg leading-tight mb-2">Sync Grades Now</h3>
              <p className="text-blue-100 text-xs mb-4">Force an immediate synchronization of all pending grades to Moodle.</p>
              <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-xs shadow-md">Execute Push</button>
           </div>
        </div>

        <div className="lg:col-span-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Synchronization Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900/20">
                <tr>
                  <th className="px-8 py-4">Event</th>
                  <th className="px-8 py-4">Target Course/Entity</th>
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {syncLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-8 py-5 font-bold text-slate-300">{log.event}</td>
                    <td className="px-8 py-5 text-slate-400">{log.target}</td>
                    <td className="px-8 py-5 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                    <td className="px-8 py-5">
                       <span className={`flex items-center gap-1.5 text-xs font-bold ${
                         log.status === 'Success' ? 'text-green-400' : 'text-amber-400'
                       }`}>
                          {log.status === 'Success' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                          {log.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
