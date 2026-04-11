import Link from "next/link";
import { GraduationCap, Landmark, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-8 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-8 border border-blue-200">
            <ShieldCheck size={16} />
            Academic Evaluation Platform
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Automated Programming <br />
            <span className="text-primary italic">Assessment System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A secure, fair, and automated platform for evaluating student programming assignments using advanced strategy patterns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/student" 
              className="flex items-center justify-center gap-3 bg-primary hover:bg-[#357abd] text-white px-10 py-4 rounded-lg font-bold transition-all shadow-xl shadow-blue-500/20 group"
            >
              <GraduationCap className="group-hover:scale-110 transition-transform" />
              Student Portal
            </Link>
            <Link 
              href="/instructor" 
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-10 py-4 rounded-lg font-bold transition-all shadow-md group"
            >
              <Landmark className="group-hover:scale-110 transition-transform" />
              Instructor Portal
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-8 bg-[#f4f7f9]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Secure Sandbox</h3>
            <p className="text-gray-500 leading-relaxed">Runs student code in isolated Docker containers with strict resource limits and no network access.</p>
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Strategy Pattern</h3>
            <p className="text-gray-500 leading-relaxed">Implements dynamic evaluation strategies for plagiarism, structural analysis, and AI probability.</p>
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Moodle Compatible</h3>
            <p className="text-gray-500 leading-relaxed">Designed with a familiar academic interface for seamless integration into existing university workflows.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
