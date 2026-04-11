"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, Bell, MessageSquare, ChevronDown, Monitor, Database, ShieldCheck } from "lucide-react";

type Persona = {
  name: string;
  role: 'student' | 'instructor' | 'admin';
  initials: string;
};

const personas: Persona[] = [
  { name: "Deniz Akkaya", role: "student", initials: "DA" },
  { name: "Dr. Suphi Ucar", role: "instructor", initials: "SU" },
  { name: "Ali Sezgin", role: "admin", initials: "AS" }
];

export default function MoodleHeader() {
  const [activePersona, setActivePersona] = useState<Persona>(personas[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initial load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('activePersona');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = personas.find(p => p.name === parsed.name);
        if (match) setActivePersona(match);
      } catch (e) {
        console.error("Error loading persona", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('activePersona', JSON.stringify(activePersona));
    window.dispatchEvent(new Event('personaChanged'));
    
    // Automatic redirection logic when switching roles
    if (pathname.includes('/student') || pathname.includes('/instructor') || pathname.includes('/admin')) {
        if (activePersona.role === 'admin' && !pathname.startsWith('/admin')) {
            router.push('/admin');
        } else if (activePersona.role === 'instructor' && !pathname.startsWith('/instructor')) {
            router.push('/instructor');
        } else if (activePersona.role === 'student' && !pathname.startsWith('/student')) {
            router.push('/student');
        }
    }
  }, [activePersona, pathname, router, isLoaded]);

  const renderNavLinks = () => {
    const commonPrefix = (
      <>
        <Link href="/blank" className="hover:text-blue-100 transition-colors">Home</Link>
      </>
    );

    if (activePersona.role === 'admin') {
      return (
        <>
          {commonPrefix}
          <div className="text-blue-200 cursor-default px-2">Database</div>
          <Link 
            href="/admin" 
            className="bg-white/10 px-3 py-1 rounded-md font-bold border border-white/20 hover:bg-white/20 transition-all"
          >
            Assessly
          </Link>
          <div className="text-blue-200 cursor-default px-2">Archive System</div>
          <div className="text-blue-200 cursor-default px-2">Maintenance</div>
        </>
      );
    }

    return (
      <>
        {commonPrefix}
        <div className="text-blue-200 cursor-default px-2">Dashboard</div>
        <Link 
          href={activePersona.role === 'instructor' ? '/instructor' : '/student'} 
          className="bg-white/10 px-3 py-1 rounded-md font-bold border border-white/20 hover:bg-white/20 transition-all"
        >
          Assessly
        </Link>
        <div className="text-blue-200 cursor-default px-2">My courses</div>
        <div className="text-blue-200 cursor-default px-2">Archive System</div>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#4a90e2] text-white flex items-center justify-between px-6 z-[100] shadow-md">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-default">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#4a90e2] font-bold">
            Y
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            YASAR UNIVERSITY
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {renderNavLinks()}
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

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-blue-600 p-1 pr-2 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden">
              {activePersona.initials}
            </div>
            <span className="text-sm font-medium hidden sm:block">{activePersona.name}</span>
            <ChevronDown size={16} className={`text-blue-200 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch User</div>
              {personas.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setActivePersona(p);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${activePersona.name === p.name ? 'bg-blue-50 text-[#4a90e2]' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${activePersona.name === p.name ? 'bg-[#4a90e2] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {p.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-none">{p.name}</span>
                    <span className="text-[10px] opacity-70 mt-1 capitalize">{p.role === 'admin' ? 'IT Administrator' : p.role}</span>
                  </div>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-4">
          <span className="text-xs text-blue-100 uppercase font-bold tracking-wider">Edit mode</span>
          <div className="w-10 h-5 bg-blue-800 rounded-full relative cursor-pointer shadow-inner">
             <div className={`absolute transition-all duration-200 top-1 w-3 h-3 bg-white rounded-full ${activePersona.role === 'student' ? 'left-1' : 'left-6 bg-blue-400'}`}></div>
          </div>
        </div>
      </div>
    </header>
  );
}
