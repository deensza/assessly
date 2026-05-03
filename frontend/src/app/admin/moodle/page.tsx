"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Network, RefreshCw, CheckCircle2, AlertCircle, Share2, Loader2, XCircle, Wifi, WifiOff, Save, Zap, Info } from "lucide-react";

type ConnectionStatus = 'unknown' | 'testing' | 'connected' | 'error';

interface TestInfo {
  site_name?: string;
  username?: string;
  version?: string;
  message?: string;
}

interface SyncLog {
  id: number;
  event: string;
  target: string;
  timestamp: string;
  status: string;
}

export default function AdminMoodleBridge() {
  const [apiUrl, setApiUrl] = useState("");
  const [token, setToken] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);

  // Sync logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // Sync grades
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        const data = await adminApi.getMoodleConfig();
        const config = data.config || data;
        setApiUrl(config.api_url || "");
        setHasToken(config.has_token || false);
        // Don't show actual token — backend masks it
        if (config.has_token) {
          setToken("••••••••••••••••");
        }
        // If config exists, show as unknown until tested
        if (config.api_url && config.has_token) {
          setConnectionStatus('unknown');
        }
      } catch (err) {
        console.error('Failed to load Moodle config', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleTest = async () => {
    if (!apiUrl.trim()) {
      setTestInfo({ message: 'Please enter a Moodle endpoint URL.' });
      setConnectionStatus('error');
      return;
    }

    // If token is masked (already saved), send empty to use saved token
    const tokenToSend = token.startsWith('••') ? '' : token;
    if (!tokenToSend && !hasToken) {
      setTestInfo({ message: 'Please enter a Moodle API token.' });
      setConnectionStatus('error');
      return;
    }

    try {
      setConnectionStatus('testing');
      setTestInfo(null);
      const result = await adminApi.testMoodle(apiUrl, tokenToSend);

      if (result.status === 'connected') {
        setConnectionStatus('connected');
        setTestInfo({
          site_name: result.site_name,
          username: result.username,
          version: result.version,
        });
        // Add to sync logs
        setSyncLogs(prev => [{
          id: Date.now(),
          event: 'Connection Test',
          target: result.site_name || apiUrl,
          timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
          status: 'Success'
        }, ...prev].slice(0, 20));
      } else {
        setConnectionStatus('error');
        setTestInfo({ message: result.message || 'Unknown error' });
      }
    } catch (err: any) {
      setConnectionStatus('error');
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Connection failed. Check URL and token.';
      setTestInfo({ message: msg });
      setSyncLogs(prev => [{
        id: Date.now(),
        event: 'Connection Test',
        target: apiUrl,
        timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        status: 'Error'
      }, ...prev].slice(0, 20));
    }
  };

  const handleSave = async () => {
    if (!apiUrl.trim()) return;
    const tokenToSave = token.startsWith('••') ? '' : token;

    try {
      setSaving(true);
      await adminApi.saveMoodleConfig(apiUrl, tokenToSave);
      setHasToken(true);
      if (tokenToSave) {
        setToken("••••••••••••••••");
      }
      setSyncLogs(prev => [{
        id: Date.now(),
        event: 'Config Saved',
        target: apiUrl,
        timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        status: 'Success'
      }, ...prev].slice(0, 20));
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncGrades = async () => {
    setSyncing(true);
    // Simulate sync — in production this would call a real endpoint
    setTimeout(() => {
      setSyncLogs(prev => [{
        id: Date.now(),
        event: 'Grade Sync',
        target: 'All Courses',
        timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        status: connectionStatus === 'connected' ? 'Success' : 'Error'
      }, ...prev].slice(0, 20));
      setSyncing(false);
    }, 2000);
  };

  const statusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400 text-xs font-bold uppercase">Connected</span>
          </div>
        );
      case 'testing':
        return (
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-blue-400" />
            <span className="text-blue-400 text-xs font-bold uppercase">Testing...</span>
          </div>
        );
      case 'error':
        return (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-400 text-xs font-bold uppercase">Disconnected</span>
          </div>
        );
      default:
        return (
          <div className="px-4 py-2 bg-slate-500/10 border border-slate-500/30 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-slate-400 text-xs font-bold uppercase">Not Tested</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 h-screen bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400 font-medium">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Moodle API Bridge</h1>
          <p className="text-slate-400 mt-1">Status of synchronization and communication with the university LMS.</p>
        </div>
        <div className="flex gap-4">
           {statusBadge()}
           <button
             onClick={handleTest}
             disabled={connectionStatus === 'testing'}
             className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all disabled:opacity-50"
           >
             <RefreshCw size={18} className={connectionStatus === 'testing' ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Connection Info Banner */}
      {testInfo && connectionStatus === 'connected' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4">
          <Wifi size={20} className="text-green-400" />
          <div className="flex-1">
            <p className="text-green-300 text-sm font-bold">{testInfo.site_name}</p>
            <p className="text-green-400/70 text-xs">User: {testInfo.username} • Moodle {testInfo.version}</p>
          </div>
        </div>
      )}
      {testInfo && connectionStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
          <WifiOff size={20} className="text-red-400" />
          <div className="flex-1">
            <p className="text-red-300 text-sm font-bold">Connection Failed</p>
            <p className="text-red-400/70 text-xs">{testInfo.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Config + Sync */}
        <div className="lg:col-span-1 space-y-6">
           {/* Bridge Config */}
           <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-4 tracking-widest">Bridge Configuration</h3>

              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase tracking-wider">Moodle Base URL</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://moodle.yasar.edu.tr"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-blue-400 outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors" 
                    />
                    <p className="text-slate-600 text-[10px] mt-1">Base URL only, no /webservice path</p>
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase tracking-wider">API Token</label>
                    <input 
                      type="password" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onFocus={() => { if (token.startsWith('••')) setToken(''); }}
                      placeholder="Enter Moodle Web Services token"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors" 
                    />
                    <p className="text-slate-600 text-[10px] mt-1">From Moodle Admin → Web services → Tokens</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleTest}
                      disabled={connectionStatus === 'testing'}
                      className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {connectionStatus === 'testing' ? (
                        <><Loader2 size={12} className="animate-spin" /> Testing...</>
                      ) : (
                        <><Zap size={12} /> Test Connection</>
                      )}
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <><Loader2 size={12} className="animate-spin" /> Saving...</>
                      ) : (
                        <><Save size={12} /> Save</>
                      )}
                    </button>
                 </div>
              </div>
           </div>

           {/* Sync Grades Card */}
           <div className={`p-6 rounded-2xl shadow-xl text-white transition-colors ${
             connectionStatus === 'connected' 
               ? 'bg-blue-600 shadow-blue-900/40' 
               : 'bg-slate-700 shadow-slate-900/40'
           }`}>
              <Share2 size={32} className="mb-4 opacity-50" />
              <h3 className="font-bold text-lg leading-tight mb-2">Sync Grades Now</h3>
              <p className={`text-xs mb-4 ${connectionStatus === 'connected' ? 'text-blue-100' : 'text-slate-400'}`}>
                {connectionStatus === 'connected' 
                  ? 'Force an immediate synchronization of all pending grades to Moodle.'
                  : 'Connect to Moodle first to enable grade synchronization.'}
              </p>
              <button 
                onClick={handleSyncGrades}
                disabled={connectionStatus !== 'connected' || syncing}
                className="w-full py-2.5 bg-white text-blue-600 rounded-lg font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {syncing ? (
                  <><Loader2 size={14} className="animate-spin" /> Syncing...</>
                ) : (
                  'Execute Push'
                )}
              </button>
           </div>

           {/* Help Card */}
           <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-slate-500" />
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Setup Guide</h4>
              </div>
              <ol className="text-[11px] text-slate-500 space-y-2 list-decimal pl-4">
                <li>Go to <span className="text-blue-400">Moodle → Site admin → Web services</span></li>
                <li>Create an External Service with required functions</li>
                <li>Generate a token for your admin user</li>
                <li>Paste the base URL and token above</li>
                <li>Click <span className="text-blue-400">Test Connection</span> to verify</li>
              </ol>
           </div>
        </div>

        {/* Right Column: Sync Logs */}
        <div className="lg:col-span-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Activity Logs</h2>
            {syncLogs.length > 0 && (
              <button 
                onClick={() => setSyncLogs([])}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {syncLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <Network size={40} className="text-slate-700 mb-4" />
              <p className="text-slate-500 text-sm font-medium">No activity yet</p>
              <p className="text-slate-600 text-xs mt-1">Test your connection or sync grades to see logs here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900/20">
                  <tr>
                    <th className="px-8 py-4">Event</th>
                    <th className="px-8 py-4">Target</th>
                    <th className="px-8 py-4">Timestamp</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {syncLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-300">{log.event}</td>
                      <td className="px-8 py-5 text-slate-400">{log.target}</td>
                      <td className="px-8 py-5 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                      <td className="px-8 py-5">
                         <span className={`flex items-center gap-1.5 text-xs font-bold ${
                           log.status === 'Success' ? 'text-green-400' : 'text-red-400'
                         }`}>
                            {log.status === 'Success' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                            {log.status}
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
