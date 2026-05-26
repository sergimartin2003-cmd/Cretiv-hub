"use client";

import { useEffect, useState } from "react";
import {
  X, User as UserIcon, AtSign, Mail, Calendar, LogOut,
  Heart, Star, Download, Check, Pencil,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { creatorTypeLabels, getSavedResources, getDownloadCount, getUsers, hashPassword } from "@/lib/auth";
import { resources } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { thumbnailEmojis } from "@/components/ResourceDetailModal";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "saved";
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

// thumbnailEmojis imported from ResourceDetailModal (single source of truth)

export default function UserProfileModal({ open, onClose, defaultTab = "profile" }: Props) {
  const { session, logout: authLogout, refreshSession } = useAuth();
  const { info, success, error: toastError } = useToast();

  const [tab,       setTab]       = useState<"profile" | "saved">(defaultTab);
  const [savedIds,  setSavedIds]  = useState<string[]>([]);
  const [downloads, setDownloads] = useState(0);

  // Inline edit state
  const [editing,  setEditing]  = useState(false);
  const [editName, setEditName] = useState("");
  const [editPwd,  setEditPwd]  = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (open && session) {
      setSavedIds(getSavedResources(session.userId));
      setDownloads(getDownloadCount(session.userId));
      setTab(defaultTab);
      setEditing(false);
      setEditName(session.name);
      setEditPwd("");
    }
  }, [open, session, defaultTab]);

  // Escape + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (editing) setEditing(false); else onClose(); } };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose, editing]);

  if (!open || !session) return null;

  const savedResources = resources.filter((r) => savedIds.includes(r.id));

  const joinDate = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : "—";

  function handleLogout() {
    authLogout();
    info("Sesión cerrada", "Hasta pronto 👋");
    onClose();
  }

  async function handleSaveProfile() {
    if (!editName.trim()) { toastError("Nombre requerido", "El nombre no puede estar vacío."); return; }
    if (!session) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const users = getUsers();
    const idx   = users.findIndex((u) => u.id === session.userId);
    if (idx === -1) { setSaving(false); return; }

    users[idx].name = editName.trim();
    // Initials
    users[idx].avatar = editName.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    if (editPwd.length > 0) {
      if (editPwd.length < 8) {
        toastError("Contraseña corta", "Mínimo 8 caracteres.");
        setSaving(false);
        return;
      }
      users[idx].passwordHash = hashPassword(editPwd);
    }
    localStorage.setItem("ch_users", JSON.stringify(users));
    refreshSession(users[idx]);

    setSaving(false);
    setEditing(false);
    setEditPwd("");
    success("Perfil actualizado ✅", "Tus cambios se han guardado.");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de usuario"
      className="fixed inset-0 z-[71] flex items-center justify-center px-4 py-8"
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
              { label: "Guardados",  value: savedIds.length,          icon: Heart    },
              { label: "Descargas",  value: formatNumber(downloads),  icon: Download },
              { label: "Valoración", value: savedIds.length > 0 ? "⭐" : "—", icon: Star },
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
              onClick={() => { setTab(t); setEditing(false); }}
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
              {!editing ? (
                <>
                  {[
                    { icon: UserIcon, label: "Nombre",        value: session.name },
                    { icon: AtSign,   label: "Username",      value: `@${session.username}` },
                    { icon: Mail,     label: "Email",         value: session.email },
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

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#161b22] rounded-xl border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-violet-500/30 transition-all duration-200"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Editar perfil
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
                </>
              ) : (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">Editando perfil</p>

                  <div>
                    <label className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1 block">
                      Nueva contraseña <span className="normal-case text-[#6e7681]">(dejar vacío para no cambiar)</span>
                    </label>
                    <input
                      type="password"
                      value={editPwd}
                      onChange={(e) => setEditPwd(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setEditPwd(""); }}
                      className="flex-1 py-2.5 text-sm text-[#8b949e] border border-[#30363d] rounded-xl hover:text-white hover:border-violet-500/30 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 btn-gradient py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {saving ? "Guardando..." : <><Check size={14} /> Guardar</>}
                    </button>
                  </div>
                </div>
              )}
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
                        {thumbnailEmojis[r.thumbnail] ?? "📦"}
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
