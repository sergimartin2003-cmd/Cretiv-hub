"use client";

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User as SbUser, Session as SbSession } from "@supabase/supabase-js";
import {
  type Session as LocalSession,
  loadSession, clearSession, saveSession, type User as LocalUser,
} from "@/lib/auth";

// ─── Unified session type ─────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  role: "user" | "creator" | "admin";
  verified: boolean;
}

interface AuthContextValue {
  user:           AppUser | null;
  session:        LocalSession | null;   // kept for backwards-compat
  isLoggedIn:     boolean;
  isSupabase:     boolean;               // true when using real Supabase auth
  login:          (user: LocalUser, rememberMe: boolean) => void;
  logout:         () => void;
  refreshSession: (user: LocalUser) => void;
  openAuth:       (tab?: "login" | "register") => void;
  closeAuth:      () => void;
  authOpen:       boolean;
  authTab:        "login" | "register";
  setAuthTab:     (tab: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Helper: convert Supabase user + profile → AppUser ───────────────────────

async function fetchAppUser(sbUser: SbUser): Promise<AppUser> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sbUser.id)
    .single();

  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    username: profile?.username ?? sbUser.email?.split("@")[0] ?? "user",
    displayName: profile?.display_name ?? profile?.username ?? sbUser.email?.split("@")[0] ?? "User",
    avatar: profile?.avatar ?? "U",
    role: (profile?.role as AppUser["role"]) ?? "user",
    verified: profile?.verified ?? false,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const useSb = isSupabaseConfigured();

  const [user,     setUser]     = useState<AppUser | null>(null);
  const [session,  setSession]  = useState<LocalSession | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab,  setAuthTab]  = useState<"login" | "register">("register");

  // ── Supabase auth ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!useSb) {
      setSession(loadSession());
      return;
    }

    supabase.auth.getSession().then(({ data: { session: sb } }) => {
      if (sb?.user) fetchAppUser(sb.user).then(setUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sb) => {
      if (sb?.user) {
        const appUser = await fetchAppUser(sb.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [useSb]);

  // ── LocalStorage auth (fallback) ─────────────────────────────────────────────
  const login = useCallback((u: LocalUser, rememberMe: boolean) => {
    if (useSb) return; // handled by Supabase
    saveSession(u, rememberMe);
    setSession(loadSession());
    setAuthOpen(false);
  }, [useSb]);

  const logout = useCallback(async () => {
    if (useSb) {
      await supabase.auth.signOut();
      setUser(null);
    } else {
      clearSession();
      setSession(null);
    }
  }, [useSb]);

  const refreshSession = useCallback((u: LocalUser) => {
    if (useSb) return;
    const current = loadSession();
    if (!current) return;
    saveSession(u, current.rememberMe);
    setSession(loadSession());
  }, [useSb]);

  const openAuth  = useCallback((tab: "login" | "register" = "register") => {
    setAuthTab(tab); setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  // Build backwards-compat AppUser from local session
  const localUser: AppUser | null = session
    ? {
        id: session.userId,
        email: session.email ?? "",
        username: session.username,
        displayName: session.username,
        avatar: session.avatar,
        role: "user",
        verified: false,
      }
    : null;

  const activeUser = useSb ? user : localUser;

  return (
    <AuthContext.Provider value={{
      user:      activeUser,
      session,
      isLoggedIn: !!activeUser,
      isSupabase: useSb,
      login, logout, refreshSession,
      openAuth, closeAuth,
      authOpen, authTab, setAuthTab,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
