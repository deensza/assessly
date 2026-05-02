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
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function StudentPortal() {
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [code, setCode] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (assignmentId: number, code: string, language: string) => {
    try {
      const result = await submissionsApi.submit(assignmentId, code, language);
      setView('dashboard');
      // Reload submissions
      const subsData = await submissionsApi.my();
      setMySubmissions(subsData.submissions || []);
      alert("Submission successful!");
    } catch (err) {
      setError('Kod gönderilirken hata oluştu');
    }
  };

  const handleOpenAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setCode(assignment.initialCode || "# Start coding here...");
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
      grade: sub?.final_score !== null ? `${sub?.final_score?.toFixed(1)}/100` : null,
      description: a.description,
      initialCode: ""
    };
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#4a90e2] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f7f9] p-8">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#4a90e2] text-white rounded-lg font-bold">Try Again</button>
      </div>
    );
  }

  if (view === 'workspace' && selectedAssignment) {
    return (
      <div className="flex h-[calc(100vh-60px)] bg-[#f4f7f9] text-[#333] flex-col overflow-hidden">
        {/* Workspace Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-[#4a90e2] transition-colors p-2 hover:bg-gray-50 rounded-lg">
              <ChevronLeft className="w-6 h-6"/>
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{selectedAssignment.title}</span>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                 <span>{selectedAssignment.course}</span>
                 <ChevronRight size={10} />
                 <span className="text-[#4a90e2]">Assignment Workspace</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center shadow-sm text-gray-700">
              <Play className="w-4 h-4 mr-2 text-[#4a90e2]"/> Run Tests
            </button>
            <button 
              onClick={() => handleSubmit(selectedAssignment.id, code, "python")}
              className="px-4 py-2 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-xl text-sm font-bold transition-colors flex items-center shadow-lg shadow-blue-500/20"
            >
              <CheckCircle2 className="w-4 h-4 mr-2"/> Submit Solution
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 min-w-[380px] bg-white p-8 overflow-y-auto border-r border-gray-100 shadow-inner">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
              <div className="p-3 bg-blue-50 text-[#4a90e2] rounded-2xl">
                <FileCode2 className="w-6 h-6"/>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Instructions</h2>
            </div>

            <div className="prose prose-slate prose-sm max-w-none text-gray-600 space-y-4 leading-relaxed">
              <p>{selectedAssignment.description}</p>
              <div className="bg-blue-50/50 border border-blue-100/50 p-6 rounded-2xl mt-6">
                <h4 className="font-bold text-[#4a90e2] mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle size={14} /> Constraints:
                </h4>
                <ul className="text-xs space-y-2 list-disc pl-4 text-blue-800/70 italic font-medium">
                  <li>Time complexity: O(n log n)</li>
                  <li>Space complexity: O(n)</li>
                  <li>In-place memory limits: 512MB</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50">
              <h3 className="font-bold text-xs mb-6 flex items-center uppercase tracking-widest text-gray-400">
                <Award className="w-4 h-4 mr-2"/> Evaluation Weights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Functional</p>
                   <p className="text-xl font-bold text-gray-900">40%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Plagiarism</p>
                   <p className="text-xl font-bold text-gray-900">20%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Inter', monospace",
                padding: { top: 20 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f4f7f9] p-8 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Assignments</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your programming tasks and track your grades.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2] shadow-sm w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <Filter className="text-gray-600" size={20} />
            </button>
          </div>
        </div>

        {/* Assignment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrichedAssignments.map((task) => (
            <div 
              key={task.id} 
              className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                   <div className={`p-3 rounded-2xl ${task.status === 'Submitted' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#4a90e2]'}`}>
                      <BookOpen size={24} />
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                     task.status === 'Submitted' ? 'bg-green-100 text-green-700' : 
                     task.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                   }`}>
                      {task.status}
                   </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#4a90e2] transition-colors">{task.title}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-6">{task.course}</p>
                
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                       <Clock size={16} className="text-gray-400" /> Due Date
                    </span>
                    <span className="font-bold text-gray-700">{task.dueDate}</span>
                  </div>
                  {task.grade && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                         <Award size={16} className="text-[#4a90e2]" /> Grade
                      </span>
                      <span className="font-extrabold text-green-600">{task.grade}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAssignment(task)}
                className="w-full py-5 bg-gray-50 group-hover:bg-[#4a90e2] group-hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                {task.status === 'Submitted' ? 'Review Submission' : 'Open Workspace'} <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
