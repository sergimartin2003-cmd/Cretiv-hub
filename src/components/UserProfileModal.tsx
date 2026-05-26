"use client";

import { useEffect, useState } from "react";
import {
  X, User as UserIcon, AtSign, Mail, Calendar, LogOut,
  Heart, Settings, Star, Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { creatorTypeLabels, getSavedResources } from "@/lib/auth";
import { resources } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

const creatorEmoji: Record<string, string> = {
  youtuber:     "▶️",
  photographer: "📷",
  designer:     "🎨",
  podcaster:    "🎙️",
  streamer:     "🎮",
  filmmaker:    "🎬",
  other:        "✨",
};

export default function UserProfileModal({ open, onClose }: Props) {
  const { session, logout: authLogout } = useAuth();
  const { info } = useToast();
  const [tab, setTab] = useState<"profile" | "saved">("profile");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open && session) {
      setSavedIds(getSavedResources(session.userId));
    }
  }, [open, session]);

  // Close on Escape + lock scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !session) return null;

  const savedResources = resources.filter((r) => savedIds.includes(r.id));
  const joinDate = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  function handleLogout() {
    authLogout();
    info("Sesión cerrada", "Hasta pronto 👋");
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de usuario"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] shrink-0">
          <h2 className="text-white font-bold text-sm">Mi cuenta</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-[#6e7681] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <X size={15} />
          </button>
        </div>

        {/* Avatar + info */}
        <div className="px-5 py-5 border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {session.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 text-lg">
                {creatorEmoji[session.creatorType] ?? "✨"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base truncate">{session.name}</h3>
              <p className="text-[#8b949e] text-sm">@{session.username}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-violet-600/15 text-violet-400 border border-violet-500/20 rounded-full">
                {creatorTypeLabels[session.creatorType]}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Guardados",  value: savedIds.length, icon: Heart  },
              { label: "Descargas",  value: 0,               icon: Download },
              { label: "Valoración", value: "—",             icon: Star  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#0d1117] rounded-xl p-3 text-center border border-[#30363d]">
                <div className="text-lg font-black text-white">{value}</div>
                <div className="text-[10px] text-[#6e7681] flex items-center justify-center gap-1 mt-0.5">
                  <Icon size={10} aria-hidden="true" />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 pb-0 gap-1 shrink-0">
          {(["profile", "saved"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                tab === t
                  ? "bg-[#1c2128] text-white border-t border-x border-[#30363d]"
                  : "text-[#6e7681] hover:text-white"
              }`}
            >
              {t === "profile" ? "Perfil" : `Guardados (${savedIds.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto bg-[#1c2128] border-t border-[#30363d]">

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: UserIcon, label: "Nombre",    value: session.name },
                { icon: AtSign,   label: "Username",  value: `@${session.username}` },
                { icon: Mail,     label: "Email",     value: session.email },
                { icon: Calendar, label: "Miembro desde", value: joinDate },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 bg-[#161b22] rounded-xl border border-[#30363d]"
                >
                  <Icon size={15} className="text-[#6e7681] shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-white truncate mt-0.5">{value}</p>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#161b22] rounded-xl border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-violet-500/30 transition-all duration-200"
                >
                  <Settings size={14} aria-hidden="true" />
                  Editar perfil
                  <span className="ml-auto text-[10px] text-[#30363d]">Próximamente</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 rounded-xl border border-red-500/15 text-sm text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200"
                >
                  <LogOut size={14} aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* ── Saved tab ── */}
          {tab === "saved" && (
            <div className="px-5 py-4">
              {savedResources.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Heart size={36} className="text-[#30363d]" />
                  <p className="text-[#8b949e] text-sm font-medium">Aún no tienes guardados</p>
                  <p className="text-[#6e7681] text-xs">
                    Haz clic en el ❤️ de cualquier recurso para guardarlo aquí.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-5 py-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-600/10 transition-all duration-200"
                  >
                    Explorar recursos
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedResources.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-4 py-3 bg-[#161b22] rounded-xl border border-[#30363d] hover:border-violet-500/25 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/10 flex items-center justify-center text-lg shrink-0">
                        {r.thumbnail === "luts" ? "🎞️"
                          : r.thumbnail === "audio" ? "🎵"
                          : r.thumbnail === "ai" ? "🤖"
                          : r.thumbnail === "motion" ? "✨"
                          : r.thumbnail === "templates" ? "🗂️"
                          : "📷"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate group-hover:text-violet-300 transition-colors">
                          {r.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`tag ${r.type === "free" ? "tag-free" : "tag-premium"} py-0`}>
                            {r.type === "free" ? "Gratis" : "Premium"}
                          </span>
                          <span className="text-[10px] text-[#6e7681] flex items-center gap-1">
                            <Star size={9} className="text-yellow-400 fill-yellow-400" />
                            {r.stars}
                          </span>
                          <span className="text-[10px] text-[#6e7681]">
                            {formatNumber(r.downloads)} descargas
                          </span>
                        </div>
                      </div>
                      <Heart size={13} className="text-pink-400 fill-pink-400 shrink-0" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
