import Link from "next/link";
import { GraduationCap, Landmark, ShieldCheck, ArrowRight, Database, LayoutDashboard as BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-8 bg-gradient-to-b from-blue-50 to-white overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-8 border border-blue-200">
            <ShieldCheck size={16} />
            Academic Evaluation Platform
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Automated Programming <br />
            <span className="text-primary italic">Assessment System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            A secure, fair, and automated platform for evaluating student programming assignments using advanced strategy patterns.
          </p>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-12 px-8 bg-[#f4f7f9] flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Portal */}
          <Link 
            href="/student"
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden hover:border-[#4a90e2]/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 to-transparent group-hover:from-[#4a90e2]/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#4a90e2] mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#4a90e2] group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200">
                <GraduationCap size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                Access your programming assignments, code in our secure IDE, and get instant feedback on your submissions.
              </p>
              <div className="flex items-center text-[#4a90e2] font-bold gap-2 group-hover:translate-x-3 transition-transform text-lg">
                Enter Workspace <ArrowRight size={20} />
              </div>
            </div>
          </Link>

          {/* Instructor Portal */}
          <Link 
            href="/instructor"
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden hover:border-[#4a90e2]/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 to-transparent group-hover:from-[#4a90e2]/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#4a90e2] mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#4a90e2] group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200">
                <Landmark size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Instructor Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                Manage courses, create automated assignments, and monitor student progress with detailed strategy analytics.
              </p>
              <div className="flex items-center text-[#4a90e2] font-bold gap-2 group-hover:translate-x-3 transition-transform text-lg">
                Open Dashboard <ArrowRight size={20} />
              </div>
            </div>
          </Link>

          {/* IT Admin Portal */}
          <Link 
            href="/admin"
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden hover:border-gray-900/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/0 to-transparent group-hover:from-gray-900/5 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-700 mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-gray-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-gray-200">
                <Database size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">IT Admin Portal</h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                Monitor system health, manage database backups, and oversee Docker sandbox resources across the platform.
              </p>
              <div className="flex items-center text-gray-900 font-bold gap-2 group-hover:translate-x-3 transition-transform text-lg">
                Manage System <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
