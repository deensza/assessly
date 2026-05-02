"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coursesApi, assignmentsApi, Course } from "@/lib/api";
import { CopyPlus, Save, Trash2, Cpu, FileCheck2, Scale, BrainCircuit } from "lucide-react";

export default function CreateAssignment() {
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", isHidden: false, weight: 1 }]);
  const [weights, setWeights] = useState({ correctness: 40, plagiarism: 20, structural: 20, ai: 20 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["python", "java", "c"]);
  const [timeLimit, setTimeLimit] = useState(10);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await coursesApi.list();
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      } catch (err) {
        setError('Kurslar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handlePublish = async () => {
    try {
      setLoading(true);
      await assignmentsApi.create({
        course_id: selectedCourseId,
        title,
        description,
        due_date: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        supported_languages: selectedLanguages,
        time_limit_seconds: timeLimit,
        memory_limit_mb: memoryLimit,
        test_cases: testCases.map(tc => ({
          input: tc.input,
          expected_output: tc.expectedOutput,
          is_hidden: tc.isHidden,
          weight: tc.weight,
        })),
      });
      router.push('/instructor');
    } catch (err) {
      setError('Ödev oluşturulurken hata oluştu');
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false, weight: 1 }]);
  };

  const removeTestCase = (index: number) => {
    const newCases = testCases.filter((_, i) => i !== index);
    setTestCases(newCases);
  };

  const handleWeightChange = (field: string, value: string) => {
    setWeights({ ...weights, [field]: parseInt(value) || 0 });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Assignment</h1>
        <p className="text-slate-400 mt-1">Define the problem description, constraints, and AI analysis strategy weights.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Test Cases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-adaptive p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">General Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Course</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assignment Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Merge Sort Implementation"
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (sec)</label>
                <input 
                  type="number" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Problem Description (Markdown supported)</label>
              <textarea 
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the algorithm requirements here..."
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-y"
              ></textarea>
            </div>
          </div>

          <div className="glass-adaptive p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[var(--border)] pb-2">
              <h2 className="text-xl font-semibold">Test Cases</h2>
              <button 
                onClick={addTestCase}
                className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                type="button"
              >
                <CopyPlus className="w-4 h-4 mr-2"/> Add Test Case
              </button>
            </div>
            
            <div className="space-y-4">
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Input</label>
                    <textarea 
                      rows={2} 
                      value={tc.input}
                      onChange={(e) => {
                        const newCases = [...testCases];
                        newCases[idx].input = e.target.value;
                        setTestCases(newCases);
                      }}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono placeholder:font-sans focus:outline-none focus:border-indigo-500"
                      placeholder="Input mapping"
                    ></textarea>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Expected Output</label>
                    <textarea 
                      rows={2} 
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const newCases = [...testCases];
                        newCases[idx].expectedOutput = e.target.value;
                        setTestCases(newCases);
                      }}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono placeholder:font-sans focus:outline-none focus:border-indigo-500"
                      placeholder="Expected result"
                    ></textarea>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tc.isHidden}
                        onChange={(e) => {
                          const newCases = [...testCases];
                          newCases[idx].isHidden = e.target.checked;
                          setTestCases(newCases);
                        }}
                        className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-[var(--surface-hover)]" 
                      />
                      <span className="text-slate-300">Hidden Test</span>
                    </label>
                    {testCases.length > 1 && (
                      <button 
                        onClick={() => removeTestCase(idx)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scoring Strategy & Finalize */}
        <div className="space-y-6">
          <div className="glass-adaptive p-6 rounded-2xl font-medium border-t-4 border-indigo-500 shadow-xl shadow-indigo-500/5">
            <h2 className="text-lg font-bold mb-4">Evaluation Strategy</h2>
            <p className="text-xs text-slate-400 mb-6">Allocate percentage weights for the grading engine categories summing up to 100%.</p>
            
            <div className="space-y-5">
              
              <div className="flex items-center justify-between group">
                <div className="flex items-center text-sm text-emerald-400">
                  <FileCheck2 className="w-5 h-5 mr-3"/>
                  <span>Correctness (Tests)</span>
                </div>
                <div className="flex items-center">
                  <input type="number" min="0" max="100" value={weights.correctness} onChange={(e) => handleWeightChange('correctness', e.target.value)} className="w-16 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-2 py-1 text-center font-bold outline-none" />
                  <span className="ml-2 text-slate-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-amber-400">
                  <Scale className="w-5 h-5 mr-3"/>
                  <span>Plagiarism Score</span>
                </div>
                <div className="flex items-center">
                  <input type="number" min="0" max="100" value={weights.plagiarism} onChange={(e) => handleWeightChange('plagiarism', e.target.value)} className="w-16 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-2 py-1 text-center font-bold outline-none" />
                  <span className="ml-2 text-slate-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-blue-400">
                  <Cpu className="w-5 h-5 mr-3"/>
                  <span>AST Structural Check</span>
                </div>
                <div className="flex items-center">
                  <input type="number" min="0" max="100" value={weights.structural} onChange={(e) => handleWeightChange('structural', e.target.value)} className="w-16 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-2 py-1 text-center font-bold outline-none" />
                  <span className="ml-2 text-slate-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-4 border-[var(--border)]">
                <div className="flex items-center text-sm text-purple-400">
                  <BrainCircuit className="w-5 h-5 mr-3"/>
                  <span>AI Probability Penalty</span>
                </div>
                <div className="flex items-center">
                  <input type="number" min="0" max="100" value={weights.ai} onChange={(e) => handleWeightChange('ai', e.target.value)} className="w-16 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-2 py-1 text-center font-bold outline-none" />
                  <span className="ml-2 text-slate-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-bold pt-2">
                <span className="text-sm">Total Weight</span>
                <span className={`text-lg ${(weights.correctness + weights.plagiarism + weights.structural + weights.ai) !== 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {weights.correctness + weights.plagiarism + weights.structural + weights.ai}%
                </span>
              </div>

            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" /> Publish Assignment
          </button>
        </div>

      </div>
    </div>
  );
}
