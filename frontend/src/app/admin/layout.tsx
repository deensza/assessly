import { LayoutDashboard, Server, ShieldCheck, Database, Network, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar - IT Admin */}
      <div className="w-64 glass-adaptive border-r border-slate-800/60 flex flex-col justify-between sidebar-admin">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/30">
              <ShieldCheck className="w-5 h-5"/>
            </div>
            <span className="font-semibold text-xl tracking-wide text-orange-50">IT Admin</span>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/50 transition-colors group text-orange-400"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              System Status
            </Link>
            <Link
              href="/admin/sandbox"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/50 transition-colors group text-slate-400"
            >
              <Server className="w-5 h-5 mr-3 group-hover:text-amber-400" />
              Docker Sandbox
            </Link>
            <Link
              href="/admin/moodle"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/50 transition-colors group text-slate-400"
            >
              <Network className="w-5 h-5 mr-3 group-hover:text-amber-400" />
              Moodle API Bridge
            </Link>
            <Link
              href="/admin/database"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/50 transition-colors group text-slate-400"
            >
              <Database className="w-5 h-5 mr-3 group-hover:text-amber-400" />
              Database Health
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4">
          <button className="flex w-full items-center px-4 py-2 mt-1 text-sm text-red-500 hover:text-red-400 transition-colors bg-red-500/10 rounded-lg">
            <LogOut className="w-4 h-4 mr-3" /> System Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--background)]">
        {children}
      </div>
    </div>
  );
}
