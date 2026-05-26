"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 3500, ...opts }: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t.slice(-4), { id, duration, ...opts }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string) =>
    toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) =>
    toast({ type: "error", title, message, duration: 5000 }), [toast]);
  const info = useCallback((title: string, message?: string) =>
    toast({ type: "info", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) =>
    toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// ─── Icons & styles ──────────────────────────────────────────────────────────

const toastStyles: Record<ToastType, { border: string; icon: ReactNode; bg: string }> = {
  success: {
    border: "border-green-500/30",
    bg:     "bg-green-500/10",
    icon:   <CheckCircle size={16} className="text-green-400 shrink-0" />,
  },
  error: {
    border: "border-red-500/30",
    bg:     "bg-red-500/10",
    icon:   <AlertCircle size={16} className="text-red-400 shrink-0" />,
  },
  info: {
    border: "border-violet-500/30",
    bg:     "bg-violet-500/10",
    icon:   <Info size={16} className="text-violet-400 shrink-0" />,
  },
  warning: {
    border: "border-yellow-500/30",
    bg:     "bg-yellow-500/10",
    icon:   <AlertTriangle size={16} className="text-yellow-400 shrink-0" />,
  },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const { border, bg, icon } = toastStyles[t.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border glass shadow-xl min-w-[280px] max-w-sm transition-all duration-300
        ${border} ${bg}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{t.title}</p>
        {t.message && (
          <p className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">{t.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="text-[#6e7681] hover:text-white transition-colors shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;

  return (
    <div
      aria-label="Notificaciones"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
