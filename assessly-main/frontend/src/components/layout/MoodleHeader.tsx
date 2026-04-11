"use client";

import Link from "next/link";
import { User, Bell, MessageSquare, ChevronDown } from "lucide-react";

export default function MoodleHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#4a90e2] text-white flex items-center justify-between px-6 z-50 shadow-md">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#4a90e2] font-bold">
            Y
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            YASAR UNIVERSITY
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-blue-100 transition-colors">Home</Link>
          <Link href="/dashboard" className="hover:text-blue-100 transition-colors border-b-2 border-white pb-1">Dashboard</Link>
          <Link href="/courses" className="hover:text-blue-100 transition-colors">My courses</Link>
          <Link href="/archive" className="hover:text-blue-100 transition-colors">Archive System</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-blue-600 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#4a90e2]"></span>
        </button>
        <button className="p-2 hover:bg-blue-600 rounded-full transition-colors">
          <MessageSquare size={20} />
        </button>
        
        <div className="h-8 w-[1px] bg-blue-300/30 mx-2"></div>

        <button className="flex items-center gap-2 hover:bg-blue-600 p-1 pr-2 rounded-lg transition-colors group">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
            DA
          </div>
          <span className="text-sm font-medium hidden sm:block">Deniz Akkaya</span>
          <ChevronDown size={16} className="text-blue-200 group-hover:text-white transition-colors" />
        </button>

        <div className="hidden lg:flex items-center gap-2 ml-4">
          <span className="text-xs text-blue-100 uppercase font-bold tracking-wider">Edit mode</span>
          <div className="w-10 h-5 bg-blue-800 rounded-full relative cursor-pointer shadow-inner">
             <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
