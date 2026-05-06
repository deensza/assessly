"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, MoreVertical, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { coursesApi, assignmentsApi, submissionsApi, Assignment } from "@/lib/api";

type AssignmentRow = Assignment & {
  courseTitle: string;
  submissions: number;
  avgScore: number | null;
  status: "Completed" | "Active";
};

export default function InstructorAssignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        setError(null);

        const courses = await coursesApi.list();
        const rows: AssignmentRow[] = [];

        for (const course of courses) {
          const courseAssignments = await assignmentsApi.list(course.id);

          for (const assignment of courseAssignments) {
            let subs: any[] = [];

            try {
              const subsData = await submissionsApi.listByAssignment(assignment.id);
              subs = subsData.submissions || [];
            } catch {
              subs = [];
            }

            const completedSubs = subs.filter((s) => s.status === "completed");
            const avgScore =
              completedSubs.length > 0
                ? completedSubs.reduce((sum, s) => sum + (s.final_score || 0), 0) / completedSubs.length
                : null;

            rows.push({
              ...assignment,
              courseTitle: course.title,
              submissions: subs.length,
              avgScore,
              status: completedSubs.length > 0 ? "Completed" : "Active",
            });
          }
        }

        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAssignments(rows);
      } catch (err) {
        console.error(err);
        setError("Assignments could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#4a90e2]" size={32} />
        <span className="ml-3 text-gray-500 font-medium">Loading assignments...</span>
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Assignments Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Review and manage all programming assessments across your courses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 focus:border-[#4a90e2] bg-white shadow-sm transition-all"
            />
          </div>

          <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-white transition-all shadow-sm hover:shadow-md">
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4 text-center">Submissions</th>
              <th className="px-6 py-4 text-center">Avg Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredAssignments.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-5 font-bold text-gray-800">{item.title}</td>
                <td className="px-6 py-5 text-gray-500">{item.courseTitle}</td>
                <td className="px-6 py-5 text-center font-mono text-gray-600">{item.submissions}</td>
                <td className="px-6 py-5 text-center font-bold text-[#4a90e2]">
                  {item.avgScore === null ? "-" : `${item.avgScore.toFixed(1)}%`}
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 w-fit border ${
                      item.status === "Completed"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-[#e8f1fb] text-[#4a90e2] border-[#4a90e2]/10"
                    }`}
                  >
                    {item.status === "Completed" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <Link
                    href={`/instructor/submissions?assignment_id=${item.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e8f1fb] text-[#4a90e2] text-[10px] font-bold uppercase hover:bg-[#d0e3f7] transition-colors"
                  >
                    View
                    <MoreVertical size={14} />
                  </Link>
                </td>
              </tr>
            ))}

            {filteredAssignments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No assignments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
