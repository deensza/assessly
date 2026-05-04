"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, getToken, setToken, clearToken, setStoredUser } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me()
        .then((data) => {
          setUser(data.user);
          setStoredUser(data.user);
        })
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const data = await authApi.register(name, email, password, role);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
