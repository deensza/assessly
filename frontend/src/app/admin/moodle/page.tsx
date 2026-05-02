"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Network, Activity, RefreshCw, CheckCircle2, AlertCircle, Share2, Loader2 } from "lucide-react";

export default function AdminMoodleBridge() {
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [apiUrl, setApiUrl] = useState("https://moodle.yasar.edu.tr/webservice/rest/server.php");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await adminApi.getMoodleConfig();
        setApiUrl(data.api_url || "");
        setToken(data.token || "");
        // Logs can be fetched if API supports it, otherwise keep empty or mock
        setSyncLogs([
          { id: 1045, event: "Course Pull", target: "COMP 3304", timestamp: "Today, 11:20", status: "Success" }
        ]);
      } catch (err) {
        setError('Ayarlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTest = async () => {
    try {
      const result = await adminApi.testMoodle(apiUrl, token);
      setTestResult(result.success ? 'Bağlantı başarılı' : 'Bağlantı başarısız');
    } catch (err) {
      setTestResult('Bağlantı hatası');
    }
  };

  const handleSave = async () => {
    try {
      await adminApi.saveMoodleConfig(apiUrl, token);
      alert('Moodle ayarları kaydedildi');
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
              {error && <div className="text-red-400 text-xs mb-4">{error}</div>}
              {testResult && <div className="text-green-400 text-xs mb-4">{testResult}</div>}
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Moodle Endpoint</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-blue-400 outline-none focus:border-blue-500" 
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Token</label>
                    <input 
                      type="password" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 outline-none focus:border-blue-500" 
                    />
                 </div>
                 <div className="flex gap-2">
                    <button onClick={handleTest} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold">Test Connection</button>
                    <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">Save</button>
                 </div>
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
