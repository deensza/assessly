"use client";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle2, ChevronLeft, FileCode2, Award } from "lucide-react";
import Link from "next/link";

export default function StudentWorkspace() {
  const [code, setCode] = useState(`def merge_sort(arr):
    # Base case
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    # Your merging logic here...
    return result
`);

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] flex-col">
      {/* Navbar */}
      <div className="h-16 border-b border-[var(--border)] glass-adaptive px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Link href="/student/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5"/>
          </Link>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Merge Sort Optimization</span>
            <span className="text-xs text-slate-400">Dr. Suphi Ucar • Due in 2 days</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center">
            <Play className="w-4 h-4 mr-2 text-indigo-400"/> Run Tests
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 mr-2"/> Submit Solution
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 border-r border-[var(--border)] bg-[var(--background)] p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FileCode2 className="w-6 h-6 mr-3 text-indigo-400"/>
            Problem Description
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4">
            <p>
              Implement the Merge Sort algorithm in Python. Your function <code>merge_sort(arr)</code> should take an unsorted list of integers and return a new list sorted in ascending order.
            </p>
            <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-4 rounded-xl">
              <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">Example 1:</h4>
              <p className="font-mono text-xs text-slate-400">Input: arr = [38, 27, 43, 3, 9, 82, 10]</p>
              <p className="font-mono text-xs text-emerald-400">Output: [3, 9, 10, 27, 38, 43, 82]</p>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <h3 className="font-bold text-sm mb-4 flex items-center uppercase tracking-wider text-slate-400">
              <Award className="w-4 h-4 mr-2"/> Evaluation Criteria
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex justify-between items-center bg-[var(--surface-hover)] px-3 py-2 rounded-lg">
                <span>Correctness (Test Cases)</span> <span className="font-mono text-indigo-400">40%</span>
              </li>
              <li className="flex justify-between items-center bg-[var(--surface-hover)] px-3 py-2 rounded-lg">
                <span>Plagiarism Check</span> <span className="font-mono text-amber-400">20%</span>
              </li>
              <li className="flex justify-between items-center bg-[var(--surface-hover)] px-3 py-2 rounded-lg">
                <span>Structure (AST)</span> <span className="font-mono text-blue-400">20%</span>
              </li>
              <li className="flex justify-between items-center bg-[var(--surface-hover)] px-3 py-2 rounded-lg">
                <span>AI Probability</span> <span className="font-mono text-rose-400">20%</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="h-full w-full">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
