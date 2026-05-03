"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, MessageSquare, ChevronDown, LogOut, X, Clock, CheckCircle2, Info } from "lucide-react";

export default function MoodleHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  // Click-outside handler to close popups
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        setShowMessages(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if a path is active
  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      isActive(path)
        ? "bg-white/20 text-white border border-white/30"
        : "text-blue-100 hover:text-white hover:bg-white/10"
    }`;

  const renderNavLinks = () => {
    if (!user) {
      return (
        <Link href="/login" className={linkClass("/login")}>
          Assessly
        </Link>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          <Link href="/admin" className={linkClass("/admin")}>
            Dashboard
          </Link>
          <Link href="/admin/sandbox" className={linkClass("/admin/sandbox")}>
            Sandbox
          </Link>
          <Link href="/admin/moodle" className={linkClass("/admin/moodle")}>
            Moodle
          </Link>
        </>
      );
    }

    if (user.role === "instructor") {
      return (
        <>
          <Link href="/instructor" className={linkClass("/instructor")}>
            Dashboard
          </Link>
          <Link href="/instructor/create" className={linkClass("/instructor/create")}>
            Create Assignment
          </Link>
          <Link href="/instructor/submissions" className={linkClass("/instructor/submissions")}>
            Submissions
          </Link>
        </>
      );
    }

    // Student
    return (
      <>
        <Link href="/student" className={linkClass("/student")}>
          Dashboard
        </Link>
      </>
    );
  };

  // Mock notification data
  const notifications = [
    { id: 1, text: "System initialized successfully", time: "Just now", icon: <CheckCircle2 size={14} className="text-green-500" /> },
    { id: 2, text: "Sandbox images built & ready", time: "2m ago", icon: <Info size={14} className="text-blue-500" /> },
    { id: 3, text: "Database migration complete", time: "5m ago", icon: <CheckCircle2 size={14} className="text-green-500" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#4a90e2] text-white flex items-center justify-between px-6 z-[100] shadow-md">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link
          href={user ? (user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/student") : "/login"}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#4a90e2] font-bold group-hover:scale-110 transition-transform">
            Y
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block">
            ASSESSLY
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {renderNavLinks()}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); setShowDropdown(false); }}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#4a90e2]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 flex items-start gap-3">
                    <div className="mt-0.5">{n.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400">All caught up!</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative" ref={msgRef}>
          <button
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); setShowDropdown(false); }}
            className={`p-2 rounded-full transition-colors ${showMessages ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
            title="Messages"
          >
            <MessageSquare size={20} />
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Messages</span>
                <button onClick={() => setShowMessages(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-8 text-center">
                <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Course discussions will appear here</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-blue-300/30 mx-1"></div>

        {/* User Menu */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); setShowMessages(false); }}
              className="flex items-center gap-2 hover:bg-blue-600 p-1 pr-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
                {getInitials(user.name)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              <ChevronDown
                size={16}
                className={`text-blue-200 transition-transform ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-0 text-gray-800 border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-[#4a90e2] text-[10px] font-bold uppercase rounded-full">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
