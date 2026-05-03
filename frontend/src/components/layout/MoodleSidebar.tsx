"use client";

import { useState, useEffect } from "react";
import { FileText, X, LayoutGrid, Activity, Zap, ShieldCheck } from "lucide-react";

export default function MoodleSidebar() {
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');

  useEffect(() => {
    const updateRole = () => {
      const persona = localStorage.getItem('activePersona');
      if (persona) {
        try {
          const parsed = JSON.parse(persona);
          setRole(parsed.role || 'student');
        } catch (e) {
          console.error("Failed to parse persona", e);
        }
      }
    };
    updateRole();
    window.addEventListener('personaChanged', updateRole);
    return () => window.removeEventListener('personaChanged', updateRole);
  }, []);

  const studentItems = [
    { title: "Week 5 - Lab 5", code: "COMP 3328-GÖMÜLÜ SİSTEMLER", icon: <FileText className="text-[#4a90e2]" /> },
    { title: "Week 10 - Unit Tests with Cov...", code: "COMP 3304-YAZILIM MÜHENDİSLİĞİ", icon: <FileText className="text-pink-500" /> },
    { title: "Week 9 - Team Code Review", code: "COMP 3304-YAZILIM MÜHENDİSLİĞİ", icon: <FileText className="text-pink-500" /> }
  ];

  const adminItems = [
    { title: "Docker Host Reset", code: "SYSTEM SERVICE", icon: <Zap className="text-[#ff9800]" /> },
    { title: "Unauthorized Login Attempt", code: "SECURITY LOG", icon: <ShieldCheck className="text-red-500" /> },
    { title: "Database Backup Completed", code: "MAINTENANCE", icon: <Activity className="text-green-500" /> }
  ];

  const items = role === 'admin' ? adminItems : studentItems;
  const sectionTitle = role === 'admin' ? "System Activity Log" : "Recently accessed items";

  return (
    <aside className="w-[320px] hidden xl:flex flex-col gap-6 p-6 border-l border-gray-100 bg-white min-h-screen">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#e8f1fb] text-[#4a90e2]">
            <LayoutGrid size={18} />
         </div>
         <X size={18} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">{sectionTitle}</h3>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#4a90e2]/20 hover:shadow-md transition-all cursor-pointer group bg-white">
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#4a90e2] transition-colors">{item.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{item.code}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm">
          Show all {role === 'admin' ? 'logs' : 'items'}
        </button>
      </div>

      <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300 font-bold text-lg border border-gray-100">?</div>
        <p className="text-xs text-gray-500 font-medium">Need help with Assessly?</p>
      </div>
    </aside>
  );
}
