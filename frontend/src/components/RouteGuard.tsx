"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ("student" | "instructor" | "admin")[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Only run auth checks when the auth context has finished its initial loading
    if (!loading) {
      if (!isAuthenticated || !user) {
        // Not logged in -> redirect to login
        router.replace("/login");
      } else if (!allowedRoles.includes(user.role)) {
        // Logged in but wrong role -> redirect to their own dashboard
        if (user.role === "admin") {
          router.replace("/admin");
        } else if (user.role === "instructor") {
          router.replace("/instructor");
        } else {
          router.replace("/student");
        }
      } else {
        // Authorized!
        setAuthorized(true);
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#4a90e2]" />
          <p className="text-gray-500 font-medium animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
