"use client";
import { FileCode2, Search, Filter, MoreVertical, CheckCircle2, Clock } from "lucide-react";

export default function InstructorAssignments() {
  const assignments = [
    { id: 1, title: "Merge Sort Optimization", course: "COMP 3304", submissions: 120, avgScore: "84.5%", status: "Completed" },
    { id: 2, title: "Dynamic Programming", course: "COMP 3304", submissions: 45, avgScore: "-", status: "Active" },
    { id: 3, title: "Linked List Deletion", course: "COMP 3328", submissions: 89, avgScore: "76.2%", status: "Completed" },
    { id: 4, title: "Binary Search Trees", course: "COMP 3304", submissions: 118, avgScore: "91.2%", status: "Completed" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments Management</h1>
          <p className="text-gray-500 mt-1">Review and manage all programming assessments across your courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Search assignments..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]" />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors"><Filter size={18} className="text-gray-600" /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              <th className="px-8 py-4">Title</th>
              <th className="px-8 py-4">Course</th>
              <th className="px-8 py-4 text-center">Submissions</th>
              <th className="px-8 py-4 text-center">Avg Score</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {assignments.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-gray-800">{item.title}</td>
                <td className="px-8 py-5 text-gray-500">{item.course}</td>
                <td className="px-8 py-5 text-center font-mono text-gray-600">{item.submissions}</td>
                <td className="px-8 py-5 text-center font-bold text-[#4a90e2]">{item.avgScore}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 w-fit ${
                    item.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-[#4a90e2]'
                  }`}>
                    {item.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-1 hover:bg-gray-100 rounded-md text-gray-400"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
