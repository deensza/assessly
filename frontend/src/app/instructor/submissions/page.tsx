"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { submissionsApi } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  Loader2,
  Eye,
  Filter,
  Users,
} from "lucide-react";

type SubmissionSummary = {
  id: number;
  assignment_id: number;
  student_id: number;
  language: string;
  status: string;
  score_correctness: number | null;
  final_score: number | null;
  plagiarism_score: number | null;
  ai_probability: number | null;
  flagged: boolean;
  submitted_at: string;
};

export default function InstructorSubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#4a90e2]" /></div>}>
      <InstructorSubmissionsContent />
    </Suspense>
  );
}

function InstructorSubmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = Number(searchParams.get("assignment_id")) || 0;
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  useEffect(() => {
    if (!assignmentId) {
      setError("No assignment_id provided in query params.");
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const data = showFlaggedOnly
          ? await submissionsApi.listFlagged(assignmentId)
          : await submissionsApi.listByAssignment(assignmentId);
        setSubmissions(data.submissions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId, showFlaggedOnly]);

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-[#ff9800]";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#4a90e2]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Submissions
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Assignment #{assignmentId} • {submissions.length} submissions
          </p>
        </div>
        <button
          onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            showFlaggedOnly
              ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
          }`}
        >
          <Filter size={16} />
          {showFlaggedOnly ? "Showing Flagged" : "All Submissions"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
          <Users size={16} className="text-[#4a90e2]" />
          <h2 className="font-bold text-gray-800 text-sm">All Student Submissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Lang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Plagiarism</th>
                <th className="px-6 py-4">AI</th>
                <th className="px-6 py-4">Flags</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-blue-50/30 transition-colors ${
                    s.flagged ? "bg-red-50/20" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">#{s.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">Student #{s.student_id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase border border-gray-200">
                      {s.language}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                        s.status === "completed"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : s.status === "error"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-[#e8f1fb] text-[#4a90e2] border-[#4a90e2]/10"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold ${scoreColor(s.final_score)}`}>
                    {s.final_score !== null ? s.final_score.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {s.plagiarism_score !== null ? (
                      <span
                        className={`font-bold ${
                          s.plagiarism_score >= 0.8 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {(s.plagiarism_score * 100).toFixed(0)}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.ai_probability !== null ? (
                      <span
                        className={`font-bold ${
                          s.ai_probability >= 0.7 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {(s.ai_probability * 100).toFixed(0)}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {s.flagged && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                      {(s.plagiarism_score || 0) >= 0.8 && (
                        <ShieldAlert size={14} className="text-red-500" />
                      )}
                      {(s.ai_probability || 0) >= 0.7 && (
                        <BrainCircuit size={14} className="text-purple-500" />
                      )}
                      {!s.flagged && "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/submissions/${s.id}`)}
                      className="p-2 text-[#4a90e2] hover:bg-[#e8f1fb] rounded-xl transition-colors"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400 font-medium">
                    {showFlaggedOnly
                      ? "No flagged submissions found."
                      : "No submissions yet for this assignment."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
