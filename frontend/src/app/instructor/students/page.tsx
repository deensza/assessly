"use client";
import { Users, Search, Mail, Award, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function InstructorStudents() {
  const students = [
    { id: 1, name: "Deniz Akkaya", idNum: "2021001", completed: 12, avgGrade: "88%", status: "On Track" },
    { id: 2, name: "Ali Sezgin", idNum: "2021045", completed: 11, avgGrade: "94%", status: "On Track" },
    { id: 3, name: "Ayşe Yılmaz", idNum: "2021089", completed: 8, avgGrade: "62%", status: "At Risk" },
    { id: 4, name: "Mehmet Demir", idNum: "2021102", completed: 12, avgGrade: "79%", status: "On Track" },
    { id: 5, name: "Zeynep Kaya", idNum: "2021156", completed: 5, avgGrade: "45%", status: "At Risk" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Success</h1>
          <p className="text-gray-500 mt-1">Monitor student performance and engagement with Assessly tasks.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2] w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#4a90e2] rounded-xl flex items-center justify-center"><Users size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Students</p><p className="text-2xl font-bold text-gray-900">120</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">On Track</p><p className="text-2xl font-bold text-gray-900">108</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><AlertTriangle size={24} /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">At Risk</p><p className="text-2xl font-bold text-gray-900">12</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              <th className="px-8 py-4">Student</th>
              <th className="px-8 py-4">ID Number</th>
              <th className="px-8 py-4 text-center">Tasks Done</th>
              <th className="px-8 py-4 text-center">Overall Grade</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                   <div className="font-bold text-gray-800">{student.name}</div>
                   <div className="text-[10px] text-gray-400">Section A</div>
                </td>
                <td className="px-8 py-5 text-gray-500 font-mono tracking-tight">{student.idNum}</td>
                <td className="px-8 py-5 text-center font-bold text-gray-700">{student.completed}/12</td>
                <td className="px-8 py-5 text-center font-bold text-[#4a90e2]">{student.avgGrade}</td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                     student.status === 'On Track' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                   }`}>
                      {student.status}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400" title="Contact Student"><Mail size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
