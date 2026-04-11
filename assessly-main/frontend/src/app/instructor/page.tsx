import { Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function InstructorDashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Dr. Instructor.</p>
        </div>
        <Link 
          href="/instructor/create" 
          className="bg-primary hover:bg-[#357abd] text-white px-5 py-2.5 rounded font-bold transition-all shadow-md"
        >
          + New Assignment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-b-4 border-b-primary">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">Active Assignments</h3>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="text-3xl font-bold text-gray-800">12</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-b-4 border-b-emerald-500">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">Total Submissions</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xl font-bold text-gray-800">459</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-b-4 border-b-rose-500">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">Plagiarism Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-3xl font-bold text-gray-800">4</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-b-4 border-b-amber-500">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">Pending Reviews</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-gray-800">18</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                <th className="px-8 py-4">Assignment Name</th>
                <th className="px-8 py-4">Submissions</th>
                <th className="px-8 py-4">Avg Score</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-gray-700">Merge Sort Optimization</td>
                <td className="px-8 py-5 text-gray-500 font-mono">120/120</td>
                <td className="px-8 py-5 font-bold text-emerald-600">84.5%</td>
                <td className="px-8 py-5"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight">Completed</span></td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-gray-700">Dynamic Programming: Knapsack</td>
                <td className="px-8 py-5 text-gray-500 font-mono">45/120</td>
                <td className="px-8 py-5 font-bold text-primary">Pending</td>
                <td className="px-8 py-5"><span className="bg-blue-50 text-primary px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight">Active</span></td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-gray-700">Binary Search Trees</td>
                <td className="px-8 py-5 text-gray-500 font-mono">118/120</td>
                <td className="px-8 py-5 font-bold text-emerald-600">91.2%</td>
                <td className="px-8 py-5"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
