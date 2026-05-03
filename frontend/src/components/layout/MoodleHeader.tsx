"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, MessageSquare, ChevronDown, LogOut, X, Clock, CheckCircle2, Info, LayoutDashboard } from "lucide-react";

export default function MoodleHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { 
    logout(); 
    router.push("/"); 
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const notifications = [
    { id: 1, text: "System initialized successfully", time: "Just now", icon: <CheckCircle2 size={14} className="text-green-500" /> },
    { id: 2, text: "Sandbox images built & ready", time: "2m ago", icon: <Info size={14} className="text-[#4a90e2]" /> },
  ];

  const getDashboardUrl = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/student";
  };

  return (
    <header className="sticky top-0 h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 z-[100]">
      {/* Left: Logo */}
      <div className="flex items-center gap-5">
        <Link
          href={user ? getDashboardUrl() : "/"}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#4a90e2] to-[#357abd] rounded-lg flex items-center justify-center text-white font-extrabold text-xs group-hover:scale-105 transition-transform shadow-sm">
            A
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900 hidden sm:block">
            ASSESSLY
          </span>
        </Link>

        <div className="h-5 w-px bg-gray-200 hidden md:block"></div>

        {/* Breadcrumb-style current location */}
        {isAuthenticated && user && pathname !== "/" && (
          <div className="hidden md:flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-medium">
              {user.role === "admin" ? "Admin" : user.role === "instructor" ? "Instructor" : "Student"}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold capitalize">
              {pathname.split("/").pop() || "Dashboard"}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {isAuthenticated && (
          <>
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
                className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={14} /></button>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 flex items-start gap-3 cursor-pointer">
                        <div className="mt-0.5">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-snug font-medium">{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} /> {n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button className="p-2 rounded-lg hover:bg-gray-50 transition-all">
              <MessageSquare size={18} className="text-gray-500" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1.5"></div>
          </>
        )}

        {/* User Menu */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            {pathname === "/" && (
              <Link 
                href={getDashboardUrl()}
                className="mr-2 text-[10px] font-bold uppercase tracking-widest text-[#4a90e2] hover:bg-[#e8f1fb] px-3 py-1.5 rounded-lg transition-all border border-[#4a90e2]/20"
              >
                Dashboard
              </Link>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-lg transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-[#4a90e2] to-[#357abd] rounded-lg flex items-center justify-center text-[10px] font-bold text-white">
                  {getInitials(user.name)}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#e8f1fb] text-[#4a90e2] text-[10px] font-bold uppercase rounded-md tracking-wide">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/login" className="text-sm font-semibold bg-[#4a90e2] text-white px-4 py-2 rounded-lg hover:bg-[#357abd] transition-all shadow-sm shadow-blue-200/50">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
