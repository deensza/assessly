"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coursesApi, assignmentsApi, Course } from "@/lib/api";
import { CopyPlus, Save, Trash2, Cpu, FileCheck2, Scale, BrainCircuit, Loader2 } from "lucide-react";

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
      } catch (err) { setError('Kurslar yüklenemedi'); }
      finally { setLoading(false); }
    }
    fetchCourses();
  }, []);

  const handlePublish = async () => {
    try {
      setLoading(true);
      await assignmentsApi.create({ course_id: selectedCourseId, title, description,
        due_date: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        supported_languages: selectedLanguages, time_limit_seconds: timeLimit, memory_limit_mb: memoryLimit,
        test_cases: testCases.map(tc => ({ input: tc.input, expected_output: tc.expectedOutput, is_hidden: tc.isHidden, weight: tc.weight })),
      });
      router.push('/instructor');
    } catch (err) { setError('Ödev oluşturulurken hata oluştu'); setLoading(false); }
  };

  const addTestCase = () => setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false, weight: 1 }]);
  const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));
  const handleWeightChange = (field: string, value: string) => setWeights({ ...weights, [field]: parseInt(value) || 0 });
  const totalWeight = weights.correctness + weights.plagiarism + weights.structural + weights.ai;
  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 focus:border-[#4a90e2] transition-all";
  const numCls = "w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-center font-bold outline-none focus:ring-2 focus:ring-[#4a90e2]/30 text-sm transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create New Assignment</h1>
        <p className="text-gray-500 mt-1 font-medium">Define the problem, constraints, and AI analysis strategy weights.</p>
      </div>
      {loading && <div className="flex items-center justify-center p-8"><Loader2 size={32} className="animate-spin text-[#4a90e2]" /></div>}
      {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold border-b border-gray-50 pb-3 text-gray-900">General Details</h2>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course</label>
              <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(Number(e.target.value))} className={inputCls}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assignment Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Merge Sort Implementation" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Limit (sec)</label>
                <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className={inputCls} /></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Problem Description</label>
              <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the algorithm requirements..." className={`${inputCls} resize-y`}></textarea></div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Test Cases</h2>
              <button onClick={addTestCase} className="flex items-center text-sm font-semibold text-[#4a90e2] hover:text-[#357abd]" type="button"><CopyPlus className="w-4 h-4 mr-2"/> Add</button>
            </div>
            <div className="space-y-4">
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex-1 space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Input</label>
                    <textarea rows={2} value={tc.input} onChange={(e) => { const n=[...testCases]; n[idx].input=e.target.value; setTestCases(n); }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 transition-all" placeholder="Input" /></div>
                  <div className="flex-1 space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Expected Output</label>
                    <textarea rows={2} value={tc.expectedOutput} onChange={(e) => { const n=[...testCases]; n[idx].expectedOutput=e.target.value; setTestCases(n); }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/30 transition-all" placeholder="Expected" /></div>
                  <div className="flex flex-col justify-between items-end">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={tc.isHidden} onChange={(e) => { const n=[...testCases]; n[idx].isHidden=e.target.checked; setTestCases(n); }} className="w-4 h-4 rounded text-[#4a90e2]" />
                      <span className="text-gray-600 font-medium">Hidden</span></label>
                    {testCases.length > 1 && <button onClick={() => removeTestCase(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-5 h-5"/></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-[#4a90e2]">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Evaluation Strategy</h2>
            <p className="text-xs text-gray-500 mb-6">Allocate weights summing to 100%.</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between"><div className="flex items-center text-sm text-green-600 font-medium"><FileCheck2 className="w-5 h-5 mr-3"/>Correctness</div><div className="flex items-center"><input type="number" min="0" max="100" value={weights.correctness} onChange={(e) => handleWeightChange('correctness', e.target.value)} className={numCls} /><span className="ml-2 text-gray-400 text-sm">%</span></div></div>
              <div className="flex items-center justify-between"><div className="flex items-center text-sm text-[#ff9800] font-medium"><Scale className="w-5 h-5 mr-3"/>Plagiarism</div><div className="flex items-center"><input type="number" min="0" max="100" value={weights.plagiarism} onChange={(e) => handleWeightChange('plagiarism', e.target.value)} className={numCls} /><span className="ml-2 text-gray-400 text-sm">%</span></div></div>
              <div className="flex items-center justify-between"><div className="flex items-center text-sm text-[#4a90e2] font-medium"><Cpu className="w-5 h-5 mr-3"/>Structural</div><div className="flex items-center"><input type="number" min="0" max="100" value={weights.structural} onChange={(e) => handleWeightChange('structural', e.target.value)} className={numCls} /><span className="ml-2 text-gray-400 text-sm">%</span></div></div>
              <div className="flex items-center justify-between border-b pb-4 border-gray-100"><div className="flex items-center text-sm text-purple-500 font-medium"><BrainCircuit className="w-5 h-5 mr-3"/>AI Detection</div><div className="flex items-center"><input type="number" min="0" max="100" value={weights.ai} onChange={(e) => handleWeightChange('ai', e.target.value)} className={numCls} /><span className="ml-2 text-gray-400 text-sm">%</span></div></div>
              <div className="flex items-center justify-between font-bold pt-2"><span className="text-sm text-gray-700">Total</span><span className={`text-lg ${totalWeight !== 100 ? 'text-red-500' : 'text-green-600'}`}>{totalWeight}%</span></div>
            </div>
          </div>
          <button onClick={handlePublish} disabled={loading} className="w-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c68a0] text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Save className="w-5 h-5 mr-2" /> Publish Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
