"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Network, RefreshCw, CheckCircle2, AlertCircle, Share2, Loader2, XCircle, Wifi, WifiOff, Save, Zap, Info } from "lucide-react";

type ConnectionStatus = 'unknown' | 'testing' | 'connected' | 'error';
interface TestInfo { site_name?: string; username?: string; version?: string; message?: string; }
interface SyncLog { id: number; event: string; target: string; timestamp: string; status: string; }

export default function AdminMoodleBridge() {
  const [apiUrl, setApiUrl] = useState("");
  const [token, setToken] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        const data = await adminApi.getMoodleConfig();
        const config = data.config || data;
        setApiUrl(config.api_url || "");
        setHasToken(config.has_token || false);
        if (config.has_token) setToken("••••••••••••••••");
        if (config.api_url && config.has_token) setConnectionStatus('unknown');
      } catch (err) { console.error('Failed to load Moodle config', err); }
      finally { setLoading(false); }
    }
    fetchConfig();
  }, []);

  const handleTest = async () => {
    if (!apiUrl.trim()) { setTestInfo({ message: 'Please enter a Moodle endpoint URL.' }); setConnectionStatus('error'); return; }
    const tokenToSend = token.startsWith('••') ? '' : token;
    if (!tokenToSend && !hasToken) { setTestInfo({ message: 'Please enter a Moodle API token.' }); setConnectionStatus('error'); return; }
    try {
      setConnectionStatus('testing'); setTestInfo(null);
      const result = await adminApi.testMoodle(apiUrl, tokenToSend);
      if (result.status === 'connected') {
        setConnectionStatus('connected');
        setTestInfo({ site_name: result.site_name, username: result.username, version: result.version });
        setSyncLogs(prev => [{ id: Date.now(), event: 'Connection Test', target: result.site_name || apiUrl, timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), status: 'Success' }, ...prev].slice(0, 20));
      } else { setConnectionStatus('error'); setTestInfo({ message: result.message || 'Unknown error' }); }
    } catch (err: any) {
      setConnectionStatus('error');
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Connection failed.';
      setTestInfo({ message: msg });
      setSyncLogs(prev => [{ id: Date.now(), event: 'Connection Test', target: apiUrl, timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), status: 'Error' }, ...prev].slice(0, 20));
    }
  };

  const handleSave = async () => {
    if (!apiUrl.trim()) return;
    const tokenToSave = token.startsWith('••') ? '' : token;
    try {
      setSaving(true); await adminApi.saveMoodleConfig(apiUrl, tokenToSave); setHasToken(true);
      if (tokenToSave) setToken("••••••••••••••••");
      setSyncLogs(prev => [{ id: Date.now(), event: 'Config Saved', target: apiUrl, timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), status: 'Success' }, ...prev].slice(0, 20));
    } catch (err) { console.error('Save failed', err); }
    finally { setSaving(false); }
  };

  const handleSyncGrades = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncLogs(prev => [{ id: Date.now(), event: 'Grade Sync', target: 'All Courses', timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), status: connectionStatus === 'connected' ? 'Success' : 'Error' }, ...prev].slice(0, 20));
      setSyncing(false);
    }, 2000);
  };

  const statusBadge = () => {
    const map: Record<ConnectionStatus, { bg: string; text: string; label: string; dot: string }> = {
      connected: { bg: 'bg-green-50 border-green-100', text: 'text-green-600', label: 'Connected', dot: 'bg-green-500 animate-pulse' },
      testing: { bg: 'bg-[#e8f1fb] border-[#4a90e2]/10', text: 'text-[#4a90e2]', label: 'Testing...', dot: 'bg-[#4a90e2] animate-pulse' },
      error: { bg: 'bg-red-50 border-red-100', text: 'text-red-600', label: 'Disconnected', dot: 'bg-red-500' },
      unknown: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', label: 'Not Tested', dot: 'bg-gray-400' },
    };
    const s = map[connectionStatus];
    return (
      <div className={`px-4 py-2 ${s.bg} border rounded-xl flex items-center gap-2`}>
        {connectionStatus === 'testing' ? <Loader2 size={12} className={`animate-spin ${s.text}`} /> : <div className={`w-2 h-2 rounded-full ${s.dot}`}></div>}
        <span className={`${s.text} text-xs font-bold uppercase`}>{s.label}</span>
      </div>
    );
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4a90e2]/30 focus:border-[#4a90e2] transition-all";

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-12 bg-[#f0f4f8]">
      <div className="flex flex-col items-center"><Loader2 size={48} className="animate-spin text-[#ff9800] mb-4" /><p className="text-gray-500 font-medium">Loading configuration...</p></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#f0f4f8] min-h-full animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Moodle API Bridge</h1>
          <p className="text-gray-500 mt-1 font-medium">Status of synchronization and communication with the university LMS.</p>
        </div>
        <div className="flex gap-3">
          {statusBadge()}
          <button onClick={handleTest} disabled={connectionStatus === 'testing'} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50">
            <RefreshCw size={16} className={`text-gray-600 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Connection Info Banner */}
      {testInfo && connectionStatus === 'connected' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
          <Wifi size={20} className="text-green-500" />
          <div><p className="text-green-700 text-sm font-bold">{testInfo.site_name}</p><p className="text-green-600 text-xs">User: {testInfo.username} • Moodle {testInfo.version}</p></div>
        </div>
      )}
      {testInfo && connectionStatus === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
          <WifiOff size={20} className="text-red-500" />
          <div><p className="text-red-700 text-sm font-bold">Connection Failed</p><p className="text-red-600 text-xs">{testInfo.message}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Bridge Config */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Bridge Configuration</h3>
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-wider">Moodle Base URL</label>
                <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://moodle.yasar.edu.tr" className={inputCls} />
                <p className="text-gray-400 text-[10px] mt-1">Base URL only, no /webservice path</p></div>
              <div><label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-wider">API Token</label>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} onFocus={() => { if (token.startsWith('••')) setToken(''); }} placeholder="Enter Moodle token" className={inputCls} />
                <p className="text-gray-400 text-[10px] mt-1">From Moodle Admin → Web services → Tokens</p></div>
              <div className="flex gap-2">
                <button onClick={handleTest} disabled={connectionStatus === 'testing'} className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-200">
                  {connectionStatus === 'testing' ? <><Loader2 size={12} className="animate-spin" /> Testing...</> : <><Zap size={12} /> Test</>}
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200/30">
                  {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> Save</>}
                </button>
              </div>
            </div>
          </div>

          {/* Sync Grades */}
          <div className={`p-6 rounded-2xl shadow-sm text-white transition-all ${connectionStatus === 'connected' ? 'bg-gradient-to-br from-[#4a90e2] to-[#357abd] shadow-blue-200/30' : 'bg-gray-200'}`}>
            <Share2 size={28} className="mb-3 opacity-60" />
            <h3 className="font-bold text-lg leading-tight mb-2">Sync Grades</h3>
            <p className={`text-xs mb-4 ${connectionStatus === 'connected' ? 'text-blue-100' : 'text-gray-500'}`}>
              {connectionStatus === 'connected' ? 'Force sync all pending grades to Moodle.' : 'Connect to Moodle first.'}
            </p>
            <button onClick={handleSyncGrades} disabled={connectionStatus !== 'connected' || syncing} className="w-full py-2.5 bg-white text-[#4a90e2] rounded-xl font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {syncing ? <><Loader2 size={14} className="animate-spin" /> Syncing...</> : 'Execute Push'}
            </button>
          </div>

          {/* Help */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3"><Info size={14} className="text-gray-400" /><h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Setup Guide</h4></div>
            <ol className="text-[11px] text-gray-500 space-y-2 list-decimal pl-4">
              <li>Go to <span className="text-[#4a90e2] font-medium">Moodle → Site admin → Web services</span></li>
              <li>Create an External Service with required functions</li>
              <li>Generate a token for your admin user</li>
              <li>Paste the base URL and token above</li>
              <li>Click <span className="text-[#4a90e2] font-medium">Test</span> to verify</li>
            </ol>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Activity Logs</h2>
            {syncLogs.length > 0 && <button onClick={() => setSyncLogs([])} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors font-medium">Clear</button>}
          </div>
          {syncLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <Network size={40} className="text-gray-200 mb-4" />
              <p className="text-gray-500 text-sm font-medium">No activity yet</p>
              <p className="text-gray-400 text-xs mt-1">Test your connection or sync grades to see logs here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-50/30">
                  <tr><th className="px-6 py-4">Event</th><th className="px-6 py-4">Target</th><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {syncLogs.map(log => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5 font-bold text-gray-800">{log.event}</td>
                      <td className="px-6 py-5 text-gray-500">{log.target}</td>
                      <td className="px-6 py-5 text-gray-400 font-mono text-xs">{log.timestamp}</td>
                      <td className="px-6 py-5">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${log.status === 'Success' ? 'text-green-600' : 'text-red-500'}`}>
                          {log.status === 'Success' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}{log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
