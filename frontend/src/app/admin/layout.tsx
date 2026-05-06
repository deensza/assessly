"use client";

import { LayoutDashboard, Server, ShieldCheck, Database, Network, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "System Status", icon: LayoutDashboard },
    { href: "/admin/sandbox", label: "Docker Sandbox", icon: Server },
    { href: "/admin/moodle", label: "Moodle API Bridge", icon: Network },
    { href: "/admin/database", label: "Database Health", icon: Database },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex h-[calc(100vh-56px)] bg-[#f0f4f8] text-gray-800">
        {/* Sidebar - IT Admin (Dark with orange accent) */}
        <div className="w-64 sidebar-dark flex flex-col justify-between border-r border-white/5">
          <div>
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff9800] to-[#f19716] flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
                <ShieldCheck className="w-5 h-5"/>
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight">IT Admin</span>
                <p className="text-[10px] text-slate-500 font-medium">System Control</p>
              </div>
            </div>

            <nav className="mt-6 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-[#ff9800]/15 text-[#ff9800] font-semibold"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[#ff9800]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    {item.label}
                    {active && <ChevronRight className="w-4 h-4 ml-auto text-[#ff9800]/50" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 mb-4 border-t border-white/5">
            <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/15 rounded-xl font-medium">
              <LogOut className="w-4 h-4" /> System Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-[#f0f4f8]">
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
