"use client";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle2, ChevronLeft, ChevronRight, FileCode2, Award } from "lucide-react";
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
    <div className="flex h-[calc(100vh-60px)] bg-[#f4f7f9] text-[#333] flex-col overflow-hidden">
      {/* Sub Header / Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5"/>
          </Link>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">Merge Sort Optimization</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <span>Dashboard</span>
               <ChevronRight size={12} />
               <span>COMP 3304</span>
               <ChevronRight size={12} />
               <span className="text-primary font-medium">Assignment 1</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors flex items-center shadow-sm">
            <Play className="w-4 h-4 mr-2 text-primary"/> Run Tests
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-[#357abd] text-white rounded text-sm font-medium transition-colors flex items-center shadow-md">
            <CheckCircle2 className="w-4 h-4 mr-2"/> Submit Solution
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 min-w-[350px] bg-white p-8 overflow-y-auto border-r border-gray-200 shadow-inner">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-primary rounded">
              <FileCode2 className="w-6 h-6"/>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Problem Description</h2>
          </div>

          <div className="prose prose-slate prose-sm max-w-none text-gray-600 space-y-4">
            <p>
              Implement the Merge Sort algorithm in Python. Your function <code>merge_sort(arr)</code> should take an unsorted list of integers and return a new list sorted in ascending order.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg border-l-4 border-l-primary">
              <h4 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Example:</h4>
              <p className="font-mono text-xs text-gray-500 bg-white p-2 border border-gray-100 rounded mb-2">Input: [38, 27, 43, 3, 9, 82, 10]</p>
              <p className="font-mono text-xs text-primary bg-blue-50/50 p-2 border border-blue-100 rounded">Output: [3, 9, 10, 27, 38, 43, 82]</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-xs mb-4 flex items-center uppercase tracking-wider text-gray-400">
              <Award className="w-4 h-4 mr-2"/> Evaluation Weights
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Correctness</p>
                <p className="text-lg font-mono font-bold text-primary">40%</p>
              </div>
              <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Plagiarism</p>
                <p className="text-lg font-mono font-bold text-amber-600">20%</p>
              </div>
              <div className="bg-indigo-50/30 p-3 rounded-lg border border-indigo-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Structure</p>
                <p className="text-lg font-mono font-bold text-indigo-600">20%</p>
              </div>
              <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">AI Probability</p>
                <p className="text-lg font-mono font-bold text-rose-600">20%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] border-l border-gray-800">
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
                fontFamily: "'Inter', monospace",
                padding: { top: 20 },
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
