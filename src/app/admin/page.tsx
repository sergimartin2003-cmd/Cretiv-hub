"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Eye, Zap, LogOut, RefreshCw, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { thumbnailEmojis, thumbnailGradients } from "@/components/ResourceDetailModal";
import type { DbResource } from "@/types/supabase";

type StatusTab = "pending" | "approved" | "rejected";

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function AdminPage() {
  const { user, logout, isSupabase } = useAuth();
  const [resources, setResources]   = useState<DbResource[]>([]);
  const [tab,       setTab]         = useState<StatusTab>("pending");
  const [loading,   setLoading]     = useState(false);
  const [actioning, setActioning]   = useState<string | null>(null);
  const [preview,   setPreview]     = useState<DbResource | null>(null);

  const isAdmin = user?.role === "admin";
  const configured = isSupabaseConfigured();

  const load = useCallback(async () => {
    if (!isAdmin || !configured) return;
    setLoading(true);
    const token = await getToken();
    const res = await fetch(`/api/admin/resources?status=${tab}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setResources(data.resources ?? []);
    setLoading(false);
  }, [tab, isAdmin, configured]);

  useEffect(() => { load(); }, [load]);

  async function action(id: string, status: "approved" | "rejected", badge?: string) {
    setActioning(id);
    const token = await getToken();
    await fetch("/api/admin/resources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status, badge: badge ?? null }),
    });
    setActioning(null);
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-white font-bold text-2xl mb-2">Supabase no configurado</h1>
          <p className="text-[#8b949e] text-sm leading-relaxed">
            Añade las claves en <code className="text-violet-400">.env.local</code> para usar el panel de admin.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-white font-bold text-2xl mb-2">Inicia sesión</h1>
          <p className="text-[#8b949e] text-sm">Necesitas una cuenta con rol admin.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-white font-bold text-2xl mb-2">Sin permisos</h1>
          <p className="text-[#8b949e] text-sm">Tu cuenta no tiene rol de admin.</p>
          <p className="text-[#6e7681] text-xs mt-2">
            Actualiza tu rol en Supabase Dashboard → Table Editor → profiles
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: StatusTab; label: string; icon: React.ReactNode }[] = [
    { key: "pending",  label: "Pendientes", icon: <Clock size={14} />     },
    { key: "approved", label: "Aprobados",  icon: <CheckCircle size={14} /> },
    { key: "rejected", label: "Rechazados", icon: <XCircle size={14} />   },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white">Admin</span>
              <span className="text-[#6e7681] text-sm ml-2">Panel de moderación</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5">
              <ExternalLink size={13} /> Ver sitio
            </a>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold">
              {user.avatar}
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-[#6e7681] hover:text-red-400 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-[#161b22] rounded-xl border border-[#30363d]">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? "bg-[#0d1117] text-white shadow"
                    : "text-[#8b949e] hover:text-white"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white text-sm transition-all"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>

        {/* Resource list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={20} className="animate-spin text-violet-400" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-[#6e7681]">
            No hay recursos en este estado.
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((r) => {
              const grad  = thumbnailGradients[r.thumbnail] ?? "from-violet-600 via-purple-500 to-pink-600";
              const emoji = thumbnailEmojis[r.thumbnail]    ?? "📦";
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-2xl"
                >
                  {/* Thumbnail */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl shrink-0`}>
                    {emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white truncate">{r.title}</span>
                      <span className={`tag shrink-0 ${r.type === "free" ? "tag-free" : "tag-premium"}`}>
                        {r.type === "free" ? "Gratis" : "Premium"}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] truncate">{r.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6e7681]">
                      <span>por <span className="text-violet-400">{r.author_name}</span></span>
                      <span>{r.category}</span>
                      <span>{new Date(r.created_at).toLocaleDateString("es-ES")}</span>
                      {r.download_url && (
                        <a href={r.download_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink size={10} /> Ver enlace
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    {r.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  {tab === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreview(r)}
                        className="p-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:border-white/20 transition-all"
                        aria-label="Preview"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={actioning === r.id}
                        onClick={() => action(r.id, "approved", "new")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Aprobar
                      </button>
                      <button
                        type="button"
                        disabled={actioning === r.id}
                        onClick={() => action(r.id, "rejected")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50"
                      >
                        <XCircle size={13} /> Rechazar
                      </button>
                    </div>
                  )}
                  {tab === "approved" && (
                    <button
                      type="button"
                      disabled={actioning === r.id}
                      onClick={() => action(r.id, "rejected")}
                      className="px-3 py-2 rounded-lg border border-[#30363d] text-[#8b949e] text-xs hover:border-red-500/40 hover:text-red-400 transition-all shrink-0"
                    >
                      Despublicar
                    </button>
                  )}
                  {tab === "rejected" && (
                    <button
                      type="button"
                      disabled={actioning === r.id}
                      onClick={() => action(r.id, "approved")}
                      className="px-3 py-2 rounded-lg border border-[#30363d] text-[#8b949e] text-xs hover:border-green-500/40 hover:text-green-400 transition-all shrink-0"
                    >
                      Aprobar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Preview overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-32 rounded-xl bg-gradient-to-br ${thumbnailGradients[preview.thumbnail] ?? ""} flex items-center justify-center mb-4 text-5xl`}>
              {thumbnailEmojis[preview.thumbnail] ?? "📦"}
            </div>
            <h3 className="text-white font-bold mb-1">{preview.title}</h3>
            <p className="text-[#8b949e] text-sm mb-3">{preview.description}</p>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {preview.tags.map((t) => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { action(preview.id, "approved", "new"); setPreview(null); }}
                className="btn-gradient flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Aprobar
              </button>
              <button
                type="button"
                onClick={() => { action(preview.id, "rejected"); setPreview(null); }}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all"
              >
                <XCircle size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
