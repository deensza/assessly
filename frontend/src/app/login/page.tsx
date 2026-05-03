"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Mail, Lock, User, ArrowRight, GraduationCap, Landmark, Database, Loader2, Sparkles, BookOpen, Code2 } from "lucide-react";

import { Suspense } from "react";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole && ["student", "instructor", "admin"].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") router.replace("/admin");
      else if (user.role === "instructor") router.replace("/instructor");
      else router.replace("/student");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      const stored = localStorage.getItem("assessly_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "instructor") router.push("/instructor");
        else router.push("/student");
      } else {
        router.push("/student");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "student", label: "Student", icon: <GraduationCap size={20} />, color: "text-blue-500" },
    { value: "instructor", label: "Instructor", icon: <Landmark size={20} />, color: "text-emerald-500" },
    { value: "admin", label: "Admin", icon: <Database size={20} />, color: "text-orange-500" },
  ];

  return (
    <div className="flex-1 flex min-h-screen relative overflow-hidden">
      
      {/* Left Side — Branding Panel */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8e] to-[#4a90e2] relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] border border-white/10 rounded-full"></div>
        <div className="absolute top-[-40px] right-[-40px] w-[220px] h-[220px] border border-white/5 rounded-full"></div>
        <div className="absolute bottom-[-120px] left-[-60px] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-blue-400/10 rounded-full blur-2xl"></div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">ASSESSLY</h2>
              <p className="text-blue-200 text-xs font-medium">Academic Evaluation Platform</p>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Automated<br />Programming<br />
              <span className="text-blue-200">Assessment</span>
            </h1>
            <p className="text-blue-100/70 mt-4 text-sm leading-relaxed max-w-sm">
              A secure, fair, and automated platform for evaluating student programming assignments using advanced strategy patterns.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-xs font-semibold">
              <Code2 size={14} className="text-blue-200" /> Sandbox Execution
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-xs font-semibold">
              <Sparkles size={14} className="text-blue-200" /> AI Detection
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-xs font-semibold">
              <BookOpen size={14} className="text-blue-200" /> Moodle Sync
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-200/50 text-xs">Yaşar University • Computer Engineering Department</p>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] via-white to-[#e8f1fb] px-6 py-12 relative">
        {/* Subtle decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4a90e2]/[0.03] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#357abd]/[0.03] rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#4a90e2] to-[#357abd] rounded-2xl text-white mb-4 shadow-xl shadow-blue-200/40">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">ASSESSLY</h2>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500 mt-2 font-medium text-sm">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Fill in the details to register for Assessly."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100/80 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-fade-in-up">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#4a90e2] transition-colors"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required={!isLogin}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/20 focus:border-[#4a90e2] focus:bg-white transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#4a90e2] transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yasar.edu.tr"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/20 focus:border-[#4a90e2] focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#4a90e2] transition-colors"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/20 focus:border-[#4a90e2] focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="animate-fade-in-up">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
                          role === r.value
                            ? "border-[#4a90e2] bg-[#e8f1fb] text-[#4a90e2] shadow-md shadow-blue-100/50"
                            : "border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className={role === r.value ? "text-[#4a90e2]" : r.color}>{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2.5 animate-fade-in">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c68a0] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-gray-500 hover:text-[#4a90e2] font-medium transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>

          {/* Demo Hint */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-gray-400">
              Demo: <span className="font-semibold text-gray-500">instructor@yasar.edu.tr</span> /{" "}
              <span className="font-semibold text-gray-500">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
