"use client";
import { useState, useEffect } from "react";
import { coursesApi, assignmentsApi, submissionsApi, Course, Assignment, Submission } from "@/lib/api";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileCode2, 
  Award, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight,
  BookOpen,
  AlertCircle,
  XCircle,
  Loader2,
  Lock,
  Eye
} from "lucide-react";
import Link from "next/link";

interface TestResult {
  test_case_id: number;
  input: string;
  expected_output: string;
  actual_output: string | null;
  stderr: string | null;
  passed: boolean;
  error: string | null;
}

export default function StudentPortal() {
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [code, setCode] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Test run state
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<{total: number; passed: number; failed: number} | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const coursesData = await coursesApi.list();
        setCourses(coursesData);
        
        // Her kurs için ödevleri çek
        const allAssignments: Assignment[] = [];
        for (const course of coursesData) {
          try {
            const courseAssignments = await assignmentsApi.list(course.id);
            if (Array.isArray(courseAssignments)) {
              allAssignments.push(...courseAssignments);
            }
          } catch (e) {
            console.error("Error fetching assignments for course", course.id);
          }
        }
        setAssignments(allAssignments);
        
        // Kendi submission'larımı çek
        try {
           const subsData = await submissionsApi.my();
           setMySubmissions(subsData.submissions || []);
        } catch (e) {
           console.error("Error fetching submissions");
        }
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEnroll = async (courseId: number) => {
    try {
      await coursesApi.enroll(courseId);
      const updatedCourses = await coursesApi.list();
      setCourses(updatedCourses);
    } catch (err) {
      setError('Kursa kayıt olurken hata oluştu');
    }
  };

  const handleRunTests = async () => {
    if (!selectedAssignment || !code.trim()) return;
    try {
      setRunningTests(true);
      setTestResults([]);
      setTestSummary(null);
      const result = await submissionsApi.runTests(selectedAssignment.id, code, "python");
      setTestResults(result.results || []);
      setTestSummary(result.summary || null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Test çalıştırılırken hata oluştu';
      setTestResults([]);
      setTestSummary(null);
      alert(msg);
    } finally {
      setRunningTests(false);
    }
  };

  const handleSubmit = async (assignmentId: number, code: string, language: string) => {
    if (!confirm("Are you sure you want to submit? You won't be able to modify your code after submission.")) return;
    try {
      setSubmitting(true);
      await submissionsApi.submit(assignmentId, code, language);
      // Reload submissions
      const subsData = await submissionsApi.my();
      setMySubmissions(subsData.submissions || []);
      setView('dashboard');
      alert("✅ Submission successful! Your code is being evaluated.");
    } catch (err) {
      setError('Kod gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setTestResults([]);
    setTestSummary(null);
    
    // Check if already submitted
    if (assignment.status === 'Submitted' && assignment.submittedCode) {
      setCode(assignment.submittedCode);
      setIsReadOnly(true);
    } else {
      setCode(assignment.initialCode || "# Start coding here...\n");
      setIsReadOnly(false);
    }
    setView('workspace');
  };

  const enrichedAssignments = assignments.map(a => {
    const sub = mySubmissions.find(s => s.assignment_id === a.id);
    const course = courses.find(c => c.id === a.course_id);
    return {
      id: a.id,
      title: a.title,
      course: course?.title || 'Unknown Course',
      dueDate: new Date(a.due_date).toLocaleDateString(),
      status: sub ? 'Submitted' : 'Not Started',
      grade: sub && sub.final_score != null ? `${sub.final_score.toFixed(1)}/100` : null,
      gradeValue: sub?.final_score,
      description: a.description,
      initialCode: "",
      submittedCode: (sub as any)?.code || null,
      submissionId: sub?.id || null
    };
  });

  const filteredEnrichedAssignments = enrichedAssignments.filter(a => 
    a.title.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
    a.course.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#4a90e2] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f4f8] p-8">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white rounded-xl font-bold shadow-lg shadow-blue-200/50">Try Again</button>
      </div>
    );
  }

  if (view === 'workspace' && selectedAssignment) {
    return (
      <div className="flex h-[calc(100vh-56px)] bg-[#f0f4f8] text-gray-800 flex-col overflow-hidden">
        {/* Workspace Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { setView('dashboard'); setTestResults([]); setTestSummary(null); }} className="text-gray-400 hover:text-[#4a90e2] transition-colors p-2 hover:bg-[#e8f1fb] rounded-xl">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{selectedAssignment.title}</span>
                {isReadOnly && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100">
                    <Lock size={10} /> Submitted
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                 <span>{selectedAssignment.course}</span>
                 <ChevronRight size={10} />
                 <span className="text-[#4a90e2]">{isReadOnly ? 'Review Mode' : 'Assignment Workspace'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isReadOnly ? (
              <>
                {selectedAssignment.grade && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl">
                    <Award size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">Grade: {selectedAssignment.grade}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-500 font-medium border border-gray-100">
                  <Eye size={16} /> Read-only
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleRunTests}
                  disabled={runningTests || !code.trim()}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center shadow-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningTests ? (
                    <><Loader2 className="w-4 h-4 mr-2 text-[#4a90e2] animate-spin"/> Running...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2 text-[#4a90e2]"/> Run Tests</>
                  )}
                </button>
                <button 
                  onClick={() => handleSubmit(selectedAssignment.id, code, "python")}
                  disabled={submitting || !code.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c68a0] text-white rounded-xl text-sm font-semibold transition-all flex items-center shadow-lg shadow-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Submitting...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2"/> Submit Solution</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Instructions + Test Results */}
          <div className="w-1/3 min-w-[380px] bg-white overflow-y-auto border-r border-gray-100 flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                <div className="p-3 bg-[#e8f1fb] text-[#4a90e2] rounded-2xl">
                  <FileCode2 className="w-5 h-5"/>
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Instructions</h2>
              </div>

              <div className="prose prose-slate prose-sm max-w-none text-gray-600 space-y-4 leading-relaxed">
                <p>{selectedAssignment.description}</p>
                <div className="bg-[#e8f1fb]/50 border border-[#4a90e2]/10 p-5 rounded-2xl mt-6">
                  <h4 className="font-bold text-[#4a90e2] mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle size={14} /> Constraints:
                  </h4>
                  <ul className="text-xs space-y-2 list-disc pl-4 text-[#357abd] font-medium">
                    <li>Time complexity: O(n log n)</li>
                    <li>Space complexity: O(n)</li>
                    <li>In-place memory limits: 512MB</li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-50">
                <h3 className="font-bold text-xs mb-5 flex items-center uppercase tracking-widest text-gray-400">
                  <Award className="w-4 h-4 mr-2"/> Evaluation Weights
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Functional</p>
                     <p className="text-xl font-extrabold text-gray-900">40%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Plagiarism</p>
                     <p className="text-xl font-extrabold text-gray-900">20%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results Panel */}
            {(testResults.length > 0 || testSummary) && (
              <div className="border-t border-gray-200 bg-gray-50/80 p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Play size={14} className="text-[#4a90e2]" /> Test Results
                  </h3>
                  {testSummary && (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{testSummary.passed} passed</span>
                      <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">{testSummary.failed} failed</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {testResults.map((r, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${r.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {r.passed ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className={`text-xs font-bold ${r.passed ? 'text-green-700' : 'text-red-600'}`}>
                          Test Case #{i + 1} — {r.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono space-y-1">
                        <p className="text-gray-500"><span className="font-bold text-gray-700">Input:</span> {r.input}</p>
                        <p className="text-gray-500"><span className="font-bold text-gray-700">Expected:</span> {r.expected_output}</p>
                        {r.actual_output !== null && (
                          <p className={r.passed ? 'text-green-700' : 'text-red-600'}><span className="font-bold">Got:</span> {r.actual_output || '(empty)'}</p>
                        )}
                        {r.error && <p className="text-red-500"><span className="font-bold">Error:</span> {r.error}</p>}
                        {r.stderr && <p className="text-[#ff9800]"><span className="font-bold">Stderr:</span> {r.stderr}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Code Editor */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => { if (!isReadOnly) setCode(val || ""); }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Inter', 'Fira Code', monospace",
                padding: { top: 20 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                readOnly: isReadOnly,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f0f4f8] p-8 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Assignments</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your programming tasks and track your grades.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 focus:border-[#4a90e2] shadow-sm w-64 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
              <Filter className="text-gray-600" size={20} />
            </button>
          </div>
        </div>

        {/* Assignment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredEnrichedAssignments.map((task) => (
            <div 
              key={task.id} 
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col animate-fade-in-up"
            >
              <div className="p-7 flex-1">
                <div className="flex items-start justify-between mb-5">
                   <div className={`p-3 rounded-xl ${task.status === 'Submitted' ? 'bg-green-50 text-green-600' : 'bg-[#e8f1fb] text-[#4a90e2]'}`}>
                      <BookOpen size={22} />
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                     task.status === 'Submitted' ? 'bg-green-50 text-green-700 border border-green-100' : 
                     task.status === 'In Progress' ? 'bg-orange-50 text-[#ff9800] border border-orange-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                   }`}>
                      {task.status}
                   </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-[#4a90e2] transition-colors">{task.title}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-5">{task.course}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                       <Clock size={14} className="text-gray-400" /> Due Date
                    </span>
                    <span className="font-bold text-gray-700">{task.dueDate}</span>
                  </div>
                  {task.grade && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                         <Award size={14} className="text-[#4a90e2]" /> Grade
                      </span>
                      <span className="font-extrabold text-green-600">{task.grade}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAssignment(task)}
                className="w-full py-4 bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-[#4a90e2] group-hover:to-[#357abd] group-hover:text-white transition-all font-semibold text-sm flex items-center justify-center gap-2 text-gray-600 border-t border-gray-50"
              >
                {task.status === 'Submitted' ? 'Review Submission' : 'Open Workspace'} <ArrowRight size={16} />
              </button>
            </div>
          ))}
          {filteredEnrichedAssignments.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="flex flex-col items-center gap-4">
                <Search size={48} className="text-gray-200" />
                <p className="text-gray-500 font-medium text-lg">No assignments found matching "{studentSearchQuery}"</p>
                <button 
                  onClick={() => setStudentSearchQuery("")}
                  className="text-[#4a90e2] font-bold hover:underline"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
