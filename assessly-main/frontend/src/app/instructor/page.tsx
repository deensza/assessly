"use client";

import { useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, Clock, Sliders, Save, Target, ShieldAlert, Cpu, Code2 } from "lucide-react";
import Link from "next/link";

export default function InstructorDashboard() {
  const [weights, setWeights] = useState({
    correctness: 40,
    plagiarism: 20,
    structural: 20,
    ai: 20
  });

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-8 rounded-2xl border border-gray-200 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Welcome back, Dr. Suphi Ucar.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-gray-100">
             <Sliders size={18} /> Global Settings
          </button>
          <Link 
            href="/instructor/create" 
            className="flex items-center gap-2 bg-[#4a90e2] hover:bg-[#357abd] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            + New Assignment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-[#4a90e2] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-widest">Active Assignments</h3>
                <Activity className="w-5 h-5 text-[#4a90e2]" />
              </div>
              <span className="text-3xl font-bold text-gray-900">12</span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-emerald-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-widest">Total Submissions</h3>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900">459</span>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Assignments</h2>
              <button className="text-xs font-bold text-[#4a90e2] hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                    <th className="px-8 py-4">Assignment</th>
                    <th className="px-8 py-4">Avg Score</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="font-bold text-gray-800">Merge Sort Optimization</div>
                       <div className="text-[10px] text-gray-400">COMP 3304 • 120 Submissions</div>
                    </td>
                    <td className="px-8 py-5 font-bold text-emerald-600">84.5%</td>
                    <td className="px-8 py-5"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Completed</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="font-bold text-gray-800">Dynamic Programming</div>
                       <div className="text-[10px] text-gray-400">COMP 3304 • 45 Submissions</div>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#4a90e2]">Pending</td>
                    <td className="px-8 py-5"><span className="bg-blue-50 text-[#4a90e2] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Grading Strategy Policy (Premium Feature) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit sticky top-24">
           <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Target size={20} className="text-[#4a90e2]" /> 
                 Assessly Policy
              </h2>
              <button className="p-2 hover:bg-white rounded-lg text-[#4a90e2] transition-colors" title="Save Policy">
                 <Save size={20} />
              </button>
           </div>
           <div className="p-8 space-y-8">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                 Configure default evaluation weights for all course assignments. Changes apply to new submissions.
              </p>

              <div className="space-y-6">
                 {/* Correctness */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" /> Correctness
                       </label>
                       <span className="text-sm font-bold text-gray-900">{weights.correctness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.correctness}
                      onChange={(e) => setWeights({...weights, correctness: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#4a90e2]"
                    />
                 </div>

                 {/* Plagiarism */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <ShieldAlert size={14} className="text-rose-500" /> Plagiarism
                       </label>
                       <span className="text-sm font-bold text-gray-900">{weights.plagiarism}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.plagiarism}
                      onChange={(e) => setWeights({...weights, plagiarism: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                 </div>

                 {/* Structural */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <Code2 size={14} className="text-amber-500" /> Structural (AST)
                       </label>
                       <span className="text-sm font-bold text-gray-900">{weights.structural}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.structural}
                      onChange={(e) => setWeights({...weights, structural: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                 </div>

                 {/* AI Prob */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <Cpu size={14} className="text-purple-500" /> AI Detection
                       </label>
                       <span className="text-sm font-bold text-gray-900">{weights.ai}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.ai}
                      onChange={(e) => setWeights({...weights, ai: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>
              </div>

              <div className="pt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] text-blue-700 leading-relaxed italic">
                 Total Weight: {weights.correctness + weights.plagiarism + weights.structural + weights.ai}% (Targets 100%)
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
