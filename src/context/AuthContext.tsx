"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Session,
  loadSession,
  clearSession,
  saveSession,
  type User,
} from "@/lib/auth";

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  session:       Session | null;
  isLoggedIn:    boolean;
  login:         (user: User, rememberMe: boolean) => void;
  logout:        () => void;
  /** Open the auth modal from anywhere */
  openAuth:      (tab?: "login" | "register") => void;
  closeAuth:     () => void;
  authOpen:      boolean;
  authTab:       "login" | "register";
  setAuthTab:    (tab: "login" | "register") => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,  setSession]  = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab,  setAuthTab]  = useState<"login" | "register">("register");

  // Hydrate from storage on mount
  useEffect(() => {
    setSession(loadSession());
  }, []);

  const login = useCallback((user: User, rememberMe: boolean) => {
    saveSession(user, rememberMe);
    setSession(loadSession());
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const openAuth = useCallback((tab: "login" | "register" = "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoggedIn: !!session,
        login,
        logout,
        openAuth,
        closeAuth,
        authOpen,
        authTab,
        setAuthTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
