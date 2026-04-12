"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { submissionsApi } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ShieldAlert,
  BrainCircuit,
  Award,
  FileCode2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type TestResult = {
  id: number;
  test_case_id: number;
  actual_output: string;
  passed: boolean;
  execution_time_ms: number | null;
  memory_usage_kb: number | null;
};

type Submission = {
  id: number;
  assignment_id: number;
  student_id: number;
  code: string;
  language: string;
  status: string;
  score_correctness: number | null;
  score_structural: number | null;
  final_score: number | null;
  plagiarism_score: number | null;
  ai_probability: number | null;
  flagged: boolean;
  submitted_at: string;
  test_results: TestResult[];
};

export default function SubmissionResultPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const submissionId = Number(params.id);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSubmission = async () => {
      try {
        const data = await submissionsApi.get(submissionId);
        setSubmission(data.submission);
      } catch (err: any) {
        setError(err.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();

    // Poll if still pending/running
    const interval = setInterval(async () => {
      try {
        const data = await submissionsApi.get(submissionId);
        setSubmission(data.submission);
        if (data.submission.status === "completed" || data.submission.status === "error") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f7f9]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#4a90e2] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading submission results...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f7f9]">
        <div className="text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-700 font-bold text-lg">{error || "Submission not found"}</p>
          <button onClick={() => router.back()} className="mt-4 text-[#4a90e2] font-medium hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const isPending = submission.status === "pending" || submission.status === "running";
  const passed = submission.test_results?.filter((t) => t.passed).length || 0;
  const total = submission.test_results?.length || 0;

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="flex-1 bg-[#f4f7f9] p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Submission #{submission.id}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {submission.language.toUpperCase()} • Submitted{" "}
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {submission.flagged && (
              <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100">
                <AlertTriangle size={14} /> Flagged
              </span>
            )}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight ${
                submission.status === "completed"
                  ? "bg-emerald-50 text-emerald-600"
                  : submission.status === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-[#4a90e2]"
              }`}
            >
              {submission.status}
            </span>
          </div>
        </div>

        {/* Pending State */}
        {isPending && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <Loader2 size={48} className="animate-spin text-[#4a90e2] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Evaluating Your Code...</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your submission is running through the sandbox, test cases, and analysis pipeline. This page will auto-update.
            </p>
          </div>
        )}

        {/* Score Breakdown */}
        {!isPending && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Final Score */}
              <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <Award size={24} className="text-[#4a90e2] mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Final Score
                </p>
                <p className={`text-3xl font-extrabold ${scoreColor(submission.final_score)}`}>
                  {submission.final_score !== null ? `${submission.final_score}` : "—"}
                </p>
              </div>

              {/* Correctness */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Correctness</p>
                <p className={`text-xl font-bold ${scoreColor(submission.score_correctness)}`}>
                  {submission.score_correctness !== null
                    ? `${submission.score_correctness.toFixed(1)}%`
                    : "—"}
                </p>
              </div>

              {/* Structural */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <Zap size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Structural</p>
                <p className="text-xl font-bold text-gray-700">
                  {submission.score_structural !== null
                    ? `${(submission.score_structural * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>

              {/* Plagiarism */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <ShieldAlert size={20} className="text-rose-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Plagiarism</p>
                <p
                  className={`text-xl font-bold ${
                    (submission.plagiarism_score || 0) >= 0.8 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {submission.plagiarism_score !== null
                    ? `${(submission.plagiarism_score * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>

              {/* AI Probability */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <BrainCircuit size={20} className="text-purple-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">AI Prob.</p>
                <p
                  className={`text-xl font-bold ${
                    (submission.ai_probability || 0) >= 0.7 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {submission.ai_probability !== null
                    ? `${(submission.ai_probability * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Test Case Results */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileCode2 size={20} className="text-[#4a90e2]" />
                  Test Case Results
                </h2>
                <span className="text-sm font-bold text-gray-500">
                  <span className="text-emerald-600">{passed}</span> / {total} passed
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {submission.test_results?.map((tr, idx) => (
                  <div
                    key={tr.id}
                    className={`flex items-center px-6 py-4 gap-4 ${
                      tr.passed ? "" : "bg-red-50/30"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tr.passed
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tr.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">
                        Test Case #{idx + 1}
                      </p>
                      {!tr.passed && tr.actual_output && (
                        <p className="text-xs text-red-500 mt-1 font-mono truncate">
                          Got: &quot;{tr.actual_output}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {tr.execution_time_ms !== null && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {tr.execution_time_ms}ms
                        </span>
                      )}
                      <span
                        className={`font-bold ${
                          tr.passed ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {tr.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  </div>
                ))}
                {(!submission.test_results || submission.test_results.length === 0) && (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No test results available.
                  </div>
                )}
              </div>
            </div>

            {/* Submitted Code Preview */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <div className="px-6 py-3 border-b border-gray-800 bg-gray-800/50 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  submission.{submission.language === "python" ? "py" : submission.language === "java" ? "java" : "c"}
                </span>
              </div>
              <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">
                <code>{submission.code}</code>
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
