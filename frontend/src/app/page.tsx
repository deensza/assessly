import Link from "next/link";
import { GraduationCap, Landmark, ShieldCheck, ArrowRight, Database, LayoutDashboard as BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-8 bg-gradient-to-b from-[#e8f1fb] via-white to-[#f0f4f8] overflow-hidden text-center">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#4a90e2]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#357abd]/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8f1fb] rounded-full text-[#4a90e2] font-bold text-xs uppercase tracking-widest mb-8 border border-[#4a90e2]/10 shadow-sm">
            <ShieldCheck size={16} />
            Academic Evaluation Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Automated Programming <br />
            <span className="bg-gradient-to-r from-[#4a90e2] to-[#357abd] bg-clip-text text-transparent">Assessment System</span>
          </h1>
          <p className="text-xl text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
            A secure, fair, and automated platform for evaluating student programming assignments using advanced strategy patterns.
          </p>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-16 px-8 bg-[#f0f4f8] flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {/* Student Portal */}
          <Link 
            href="/student"
            className="group relative bg-white p-10 rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 overflow-hidden hover:border-[#4a90e2]/20 animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 to-transparent group-hover:from-[#4a90e2]/5 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#e8f1fb] rounded-2xl flex items-center justify-center text-[#4a90e2] mb-8 group-hover:scale-110 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[#4a90e2] group-hover:to-[#357abd] group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-200/50">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Student Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Access your programming assignments, code in our secure IDE, and get instant feedback on your submissions.
              </p>
              <div className="flex items-center text-[#4a90e2] font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Enter Workspace <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          {/* Instructor Portal */}
          <Link 
            href="/instructor"
            className="group relative bg-white p-10 rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 overflow-hidden hover:border-[#4a90e2]/20 animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 to-transparent group-hover:from-[#4a90e2]/5 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#e8f1fb] rounded-2xl flex items-center justify-center text-[#4a90e2] mb-8 group-hover:scale-110 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[#4a90e2] group-hover:to-[#357abd] group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-200/50">
                <Landmark size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Instructor Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Manage courses, create automated assignments, and monitor student progress with detailed strategy analytics.
              </p>
              <div className="flex items-center text-[#4a90e2] font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Open Dashboard <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          {/* IT Admin Portal */}
          <Link 
            href="/admin"
            className="group relative bg-white p-10 rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/30 hover:-translate-y-2 overflow-hidden hover:border-[#ff9800]/20 animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff9800]/0 to-transparent group-hover:from-[#ff9800]/5 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff9800] mb-8 group-hover:scale-110 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[#ff9800] group-hover:to-[#f19716] group-hover:text-white group-hover:shadow-xl group-hover:shadow-orange-200/50">
                <Database size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">IT Admin Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Monitor system health, manage database backups, and oversee Docker sandbox resources across the platform.
              </p>
              <div className="flex items-center text-[#ff9800] font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Manage System <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
