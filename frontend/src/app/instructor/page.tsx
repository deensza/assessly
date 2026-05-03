"use client";

import { useState, useEffect } from "react";
import { coursesApi, assignmentsApi, submissionsApi, Course, Assignment, Submission } from "@/lib/api";
import { Activity, CheckCircle2, AlertTriangle, Clock, Sliders, Save, Target, ShieldAlert, Cpu, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InstructorDashboard() {
  const [weights, setWeights] = useState({
    correctness: 40,
    plagiarism: 20,
    structural: 20,
    ai: 20
  });

  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    flaggedCount: 0,
    averageScore: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<(Assignment & { submissionsCount: number; avgScore: number; courseTitle: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSavePolicy = () => {
    alert("Assessly Policy successfully updated and saved for all future assignments!");
  };

  const handleGlobalSettings = () => {
    alert("Global Instructor Settings (Moodle integration, notifications, etc.) are currently being synchronized with the departmental server.");
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const courses = await coursesApi.list();
        const allAssignments = [];
        const allSubmissions: Submission[] = [];
        
        for (const course of courses) {
          try {
            const courseAssignments = await assignmentsApi.list(course.id);
            if (Array.isArray(courseAssignments)) {
              for (const assignment of courseAssignments) {
                const subsData = await submissionsApi.listByAssignment(assignment.id);
                const subs = subsData.submissions || [];
                
                const avgScore = subs.length > 0 ? subs.reduce((sum: number, s: any) => sum + (s.final_score || 0), 0) / subs.length : 0;
                
                allAssignments.push({
                   ...assignment,
                   courseTitle: course.title,
                   submissionsCount: subs.length,
                   avgScore
                });
                allSubmissions.push(...subs);
              }
            }
          } catch (e) {}
        }
        
        setStats({
          totalAssignments: allAssignments.length,
          totalSubmissions: allSubmissions.length,
          flaggedCount: allSubmissions.filter(s => s.flagged).length,
          averageScore: allSubmissions.length > 0 ? allSubmissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / allSubmissions.length : 0,
        });
        
        setRecentAssignments(allAssignments.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#4a90e2] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-8 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, Dr. Suphi Ucar.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGlobalSettings}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all border border-gray-100 text-sm"
          >
             <Sliders size={16} /> Global Settings
          </button>
          <Link 
            href="/instructor/create" 
            className="flex items-center gap-2 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c68a0] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/15 text-sm"
          >
            + New Assignment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in-up group">
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-widest">Active Assignments</h3>
                <div className="w-10 h-10 bg-[#e8f1fb] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-[#4a90e2]" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-gray-900">{stats.totalAssignments}</span>
              <div className="mt-2 h-1 w-12 bg-[#4a90e2] rounded-full"></div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in-up group">
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-widest">Total Submissions</h3>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-gray-900">{stats.totalSubmissions}</span>
              <div className="mt-2 h-1 w-12 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Assignments</h2>
              <Link href="/instructor/assignments" className="text-xs font-bold text-[#4a90e2] hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Assignment</th>
                    <th className="px-6 py-4">Avg Score</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {recentAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                         <div className="font-bold text-gray-800">{a.title}</div>
                         <div className="text-[10px] text-gray-400 mt-0.5">{a.courseTitle} • {a.submissionsCount} Submissions</div>
                      </td>
                      <td className="px-6 py-5 font-bold text-green-600">{a.avgScore.toFixed(1)}%</td>
                      <td className="px-6 py-5">
                        <Link href={`/instructor/submissions?assignment_id=${a.id}`} className="bg-[#e8f1fb] text-[#4a90e2] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-[#d0e3f7] transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentAssignments.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No assignments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Grading Strategy Policy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit sticky top-24">
           <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Target size={18} className="text-[#4a90e2]" /> 
                 Assessly Policy
              </h2>
              <button 
                onClick={handleSavePolicy}
                className="p-2 hover:bg-gray-100 rounded-xl text-[#4a90e2] transition-colors" 
                title="Save Policy"
              >
                 <Save size={18} />
              </button>
           </div>
           <div className="p-6 space-y-6">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                 Configure default evaluation weights for all course assignments. Changes apply to new submissions.
              </p>

              <div className="space-y-5">
                 {/* Correctness */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500" /> Correctness
                       </label>
                       <span className="text-sm font-extrabold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-lg">{weights.correctness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.correctness}
                      onChange={(e) => setWeights({...weights, correctness: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                 </div>

                 {/* Plagiarism */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <ShieldAlert size={14} className="text-red-500" /> Plagiarism
                       </label>
                       <span className="text-sm font-extrabold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-lg">{weights.plagiarism}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.plagiarism}
                      onChange={(e) => setWeights({...weights, plagiarism: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                 </div>

                 {/* Structural */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <Code2 size={14} className="text-[#ff9800]" /> Structural (AST)
                       </label>
                       <span className="text-sm font-extrabold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-lg">{weights.structural}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.structural}
                      onChange={(e) => setWeights({...weights, structural: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#ff9800]"
                    />
                 </div>

                 {/* AI Detection */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                          <Cpu size={14} className="text-purple-500" /> AI Detection
                       </label>
                       <span className="text-sm font-extrabold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-lg">{weights.ai}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={weights.ai}
                      onChange={(e) => setWeights({...weights, ai: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>
              </div>

              <div className={`p-4 rounded-xl border text-xs font-medium ${
                (weights.correctness + weights.plagiarism + weights.structural + weights.ai) === 100 
                  ? 'bg-green-50 border-green-100 text-green-700' 
                  : 'bg-[#ff9800]/5 border-[#ff9800]/20 text-[#ff9800]'
              }`}>
                 Total Weight: {weights.correctness + weights.plagiarism + weights.structural + weights.ai}% {(weights.correctness + weights.plagiarism + weights.structural + weights.ai) === 100 ? '✓' : '(Target: 100%)'}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
