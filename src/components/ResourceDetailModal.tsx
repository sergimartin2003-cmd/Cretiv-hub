"use client";

import { useEffect } from "react";
import { X, CheckCircle, Download, Heart, Share2 } from "lucide-react";
import { Resource } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// ─── Lookup tables (kept in sync with ResourceCard) ──────────────────────────

export const thumbnailGradients: Record<string, string> = {
  luts:      "from-orange-600/30 via-red-500/20 to-pink-600/30",
  motion:    "from-indigo-600/30 via-violet-600/20 to-purple-600/30",
  ai:        "from-pink-600/30 via-rose-500/20 to-red-600/30",
  audio:     "from-green-600/30 via-emerald-500/20 to-teal-600/30",
  templates: "from-yellow-600/30 via-amber-500/20 to-orange-600/30",
  photo:     "from-cyan-600/30 via-blue-500/20 to-indigo-600/30",
  fonts:     "from-purple-600/30 via-violet-500/20 to-indigo-600/30",
  color:     "from-amber-600/30 via-orange-500/20 to-red-600/30",
  stock:     "from-blue-600/30 via-sky-500/20 to-cyan-600/30",
  plugins:   "from-violet-600/30 via-purple-500/20 to-fuchsia-600/30",
  tutorials: "from-emerald-600/30 via-green-500/20 to-teal-600/30",
};

export const thumbnailEmojis: Record<string, string> = {
  luts:      "🎞️",
  motion:    "✨",
  ai:        "🤖",
  audio:     "🎵",
  templates: "🗂️",
  photo:     "📷",
  fonts:     "🔤",
  color:     "🎨",
  stock:     "🖼️",
  plugins:   "🔌",
  tutorials: "📚",
};

// ─── Badge helpers ────────────────────────────────────────────────────────────

import { Flame, Sparkles } from "lucide-react";

function Badge({ type }: { type: "trending" | "new" | "official" }) {
  const styles = {
    trending: { cls: "badge-trending", icon: <Flame size={9} />,      label: "Trending" },
    new:      { cls: "badge-new",      icon: <Sparkles size={9} />,    label: "Nuevo"    },
    official: { cls: "badge-official", icon: <CheckCircle size={9} />, label: "Oficial"  },
  };
  const { cls, icon, label } = styles[type];
  return (
    <span className={`${cls} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
      {icon} {label}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export interface ResourceDetailModalProps {
  resource:   Resource;
  saved:      boolean;
  saveCount:  number;
  onClose:    () => void;
  onSave:     () => void;
  onDownload: () => void;
}

export default function ResourceDetailModal({
  resource, saved, saveCount, onClose, onSave, onDownload,
}: ResourceDetailModalProps) {
  const { success } = useToast();

  const grad  = thumbnailGradients[resource.thumbnail] ?? "from-violet-600/30 via-purple-500/20 to-pink-600/30";
  const emoji = thumbnailEmojis[resource.thumbnail]    ?? "📦";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  function handleShare() {
    const text = `${resource.title} — CretivHub`;
    if (navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() =>
        success("Enlace copiado 🔗", "Pega el enlace donde quieras compartirlo.")
      );
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle: ${resource.title}`}
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Thumbnail header ── */}
        <div className={`relative h-52 bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
          <div className="absolute inset-0 grid-pattern opacity-20" />

          <span className="text-7xl relative z-10 select-none" aria-hidden="true">
            {emoji}
          </span>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
            {resource.badge && <Badge type={resource.badge} />}
          </div>
          <div className="absolute top-4 right-12 z-20">
            <span className={`tag ${resource.type === "free" ? "tag-free" : "tag-premium"} text-xs px-3 py-1`}>
              {resource.type === "free" ? "Gratis" : "Premium"}
            </span>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 z-20 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Title + tags */}
          <div>
            <h2 className="text-white font-bold text-lg leading-snug mb-2">
              {resource.title}
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {resource.tags.map((tag) => (
                <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-[#8b949e] text-sm leading-relaxed">
            {resource.description}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Valoración", value: resource.stars, suffix: "★", cls: "text-yellow-400" },
              { label: "Guardados",  value: formatNumber(saveCount), suffix: "", cls: "text-pink-400" },
              { label: "Descargas",  value: formatNumber(resource.downloads), suffix: "", cls: "text-violet-400" },
            ].map(({ label, value, suffix, cls }) => (
              <div key={label} className="bg-[#0d1117] rounded-xl p-3 text-center border border-[#30363d]">
                <div className={`text-base font-black ${cls}`}>{value}{suffix}</div>
                <div className="text-[10px] text-[#6e7681] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] rounded-xl border border-[#30363d]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {resource.author.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white font-semibold">{resource.author.name}</span>
                {resource.author.verified && (
                  <CheckCircle size={12} className="text-violet-400 shrink-0" aria-label="Verificado" />
                )}
              </div>
              <div className="text-xs text-[#6e7681]">
                {resource.author.verified ? "Autor verificado ✓" : "Creador"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 py-4 border-t border-[#30363d] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? "Quitar de guardados" : "Guardar"}
            className={`p-3 rounded-xl border transition-all duration-200 ${
              saved
                ? "bg-pink-500/15 border-pink-500/40 text-pink-400"
                : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-pink-500/40 hover:text-pink-400"
            }`}
          >
            <Heart size={17} className={saved ? "fill-pink-400" : ""} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir"
            className="p-3 rounded-xl border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-violet-500/40 hover:text-violet-400 transition-all duration-200"
          >
            <Share2 size={17} />
          </button>

          <button
            type="button"
            onClick={() => { onDownload(); onClose(); }}
            className="btn-gradient flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          >
            <Download size={15} />
            {resource.type === "free" ? "Descargar gratis" : "Descargar Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}
