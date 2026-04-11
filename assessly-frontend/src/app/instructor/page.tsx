import { Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function InstructorDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back, Dr. Instructor.</p>
        </div>
        <Link 
          href="/instructor/create" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          New Assignment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-adaptive p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <h3 className="font-medium text-sm">Active Assignments</h3>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold">12</span>
        </div>

        <div className="glass-adaptive p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <h3 className="font-medium text-sm">Total Submissions</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold">459</span>
        </div>

        <div className="glass-adaptive p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <h3 className="font-medium text-sm">Plagiarism Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-3xl font-bold">4</span>
        </div>

        <div className="glass-adaptive p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <h3 className="font-medium text-sm">Pending Reviews</h3>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-3xl font-bold">18</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-adaptive rounded-2xl p-8 mt-8">
        <h2 className="text-xl font-bold mb-6">Recent Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-sm text-slate-400">
                <th className="pb-4 font-medium">Assignment Name</th>
                <th className="pb-4 font-medium">Submissions</th>
                <th className="pb-4 font-medium">Avg Score</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-4 font-medium">Merge Sort Optimization</td>
                <td className="py-4 text-slate-400">120/120</td>
                <td className="py-4 font-medium text-emerald-400">84.5%</td>
                <td className="py-4"><span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">Completed</span></td>
              </tr>
              <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-4 font-medium">Dynamic Programming: Knapsack</td>
                <td className="py-4 text-slate-400">45/120</td>
                <td className="py-4 font-medium text-indigo-400">Pending</td>
                <td className="py-4"><span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-medium">Active</span></td>
              </tr>
              <tr className="hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-4 font-medium">Binary Search Trees</td>
                <td className="py-4 text-slate-400">118/120</td>
                <td className="py-4 font-medium text-emerald-400">91.2%</td>
                <td className="py-4"><span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
