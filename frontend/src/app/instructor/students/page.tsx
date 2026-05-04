"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api";

type StudentRow = {
  id: number;
  name: string;
  email: string;
  courses: string[];
  submissions_count: number;
  completed_submissions: number;
  average_grade: number | null;
  status: "On Track" | "At Risk";
};

type Summary = {
  total_students: number;
  on_track: number;
  at_risk: number;
};

export default function InstructorStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_students: 0,
    on_track: 0,
    at_risk: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        setError(null);

        const data = await coursesApi.students();
        setStudents(data.students || []);
        setSummary(data.summary || {
          total_students: 0,
          on_track: 0,
          at_risk: 0,
        });
      } catch (err) {
        console.error(err);
        setError("Students could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.courses.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMailClick = (student: StudentRow) => {
    alert(`Contact: ${student.email}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#4a90e2]" size={32} />
        <span className="ml-3 text-gray-500 font-medium">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Success</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Monitor real student performance and engagement with Assessly tasks.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 focus:border-[#4a90e2] bg-white w-64 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#e8f1fb] text-[#4a90e2] rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
            <p className="text-2xl font-extrabold text-gray-900">{summary.total_students}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">On Track</p>
            <p className="text-2xl font-extrabold text-gray-900">{summary.on_track}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">At Risk</p>
            <p className="text-2xl font-extrabold text-gray-900">{summary.at_risk}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Courses</th>
              <th className="px-6 py-4 text-center">Submissions</th>
              <th className="px-6 py-4 text-center">Overall Grade</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-800">{student.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{student.email}</div>
                </td>

                <td className="px-6 py-5 text-gray-500">
                  {student.courses.length > 0 ? student.courses.join(", ") : "-"}
                </td>

                <td className="px-6 py-5 text-center font-bold text-gray-700">
                  {student.completed_submissions}/{student.submissions_count}
                </td>

                <td className="px-6 py-5 text-center font-bold text-[#4a90e2]">
                  {student.average_grade === null ? "-" : `${student.average_grade.toFixed(1)}%`}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                      student.status === "On Track"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => handleMailClick(student)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                    title="Contact Student"
                  >
                    <Mail size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No enrolled students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
