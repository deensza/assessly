import {
  LayoutDashboard,
  FileCode2,
  Users,
  Settings,
  LogOut,
  PlusCircle
} from "lucide-react";
import Link from "next/link";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <div className="w-64 glass-adaptive border-r border-[var(--border)] flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              A
            </div>
            <span className="font-semibold text-xl tracking-wide">Assessly</span>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            <Link
              href="/instructor"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-[var(--surface-hover)] transition-colors group"
            >
              <LayoutDashboard className="w-5 h-5 mr-3 text-indigo-400 group-hover:text-indigo-500" />
              Dashboard
            </Link>
            <Link
              href="/instructor/create"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-[var(--surface-hover)] transition-colors group text-indigo-400"
            >
              <PlusCircle className="w-5 h-5 mr-3" />
              Create Assignment
            </Link>
            <Link
              href="/instructor/assignments"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-[var(--surface-hover)] transition-colors group"
            >
              <FileCode2 className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-300" />
              Assignments
            </Link>
            <Link
              href="/instructor/students"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-[var(--surface-hover)] transition-colors group"
            >
              <Users className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-300" />
              Students
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4">
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" /> Settings
          </Link>
          <button className="flex w-full items-center px-4 py-2 mt-1 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Logout
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
