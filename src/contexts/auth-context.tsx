"use client";

import { api } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_KEY = "kuriftu_token";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    setToken(t);
    try {
      const { user: u } = await api.me(t);
      const role = (u as User).role ?? ("GUEST" as UserRole);
      setUser({ ...u, role });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    /** Never block the shell forever if a request or effect misbehaves. */
    const safetyMs = 20_000;
    let cancelled = false;
    const safetyId = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, safetyMs);

    void (async () => {
      try {
        await refreshUser();
      } finally {
        if (!cancelled) {
          window.clearTimeout(safetyId);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(safetyId);
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token: tok } = await api.auth.login(email, password);
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    const role = (u as User).role ?? ("GUEST" as UserRole);
    setUser({ ...u, role });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { user: u, token: tok } = await api.auth.register(email, password);
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    const role = (u as User).role ?? ("GUEST" as UserRole);
    setUser({ ...u, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
