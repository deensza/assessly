"use client";

import {
  LayoutDashboard,
  FileCode2,
  Users,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instructor/create", label: "Create Assignment", icon: PlusCircle },
    { href: "/instructor/assignments", label: "Assignments", icon: FileCode2 },
    { href: "/instructor/students", label: "Students", icon: Users },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#f0f4f8] text-gray-800">
      {/* Dark Sidebar */}
      <div className="w-64 sidebar-dark flex flex-col justify-between border-r border-white/5">
        <div>
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a90e2] to-[#357abd] flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20">
              A
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">Assessly Panel</span>
              <p className="text-[10px] text-slate-500 font-medium">Instructor Mode</p>
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
                      ? "bg-[#4a90e2]/15 text-[#4a90e2] font-semibold"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[#4a90e2]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto text-[#4a90e2]/50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mb-4 border-t border-white/5">
          <p className="text-[10px] text-slate-600 text-center font-medium">
            Yasar University • Assessly v2.0
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#f0f4f8] p-8">
        {children}
      </div>
    </div>
  );
}
