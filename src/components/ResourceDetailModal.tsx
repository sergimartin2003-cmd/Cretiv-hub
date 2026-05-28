"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle, Download, Heart, Share2,
  Flame, Sparkles, Star, ArrowDownToLine,
} from "lucide-react";
import { Resource } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// ─── Lookup tables ────────────────────────────────────────────────────────────

export const thumbnailGradients: Record<string, string> = {
  luts:      "from-orange-600 via-red-500 to-pink-600",
  motion:    "from-indigo-600 via-violet-600 to-purple-600",
  ai:        "from-pink-600 via-rose-500 to-red-600",
  audio:     "from-green-600 via-emerald-500 to-teal-600",
  templates: "from-yellow-600 via-amber-500 to-orange-600",
  photo:     "from-cyan-600 via-blue-500 to-indigo-600",
  fonts:     "from-purple-600 via-violet-500 to-indigo-600",
  color:     "from-amber-600 via-orange-500 to-red-600",
  stock:     "from-blue-600 via-sky-500 to-cyan-600",
  plugins:   "from-violet-600 via-purple-500 to-fuchsia-600",
  tutorials: "from-emerald-600 via-green-500 to-teal-600",
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

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ type }: { type: "trending" | "new" | "official" }) {
  const styles = {
    trending: { cls: "badge-trending", icon: <Flame size={10} />,      label: "Trending" },
    new:      { cls: "badge-new",      icon: <Sparkles size={10} />,    label: "Nuevo"    },
    official: { cls: "badge-official", icon: <CheckCircle size={10} />, label: "Oficial"  },
  };
  const { cls, icon, label } = styles[type];
  return (
    <span className={`${cls} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold`}>
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
  const [mounted, setMounted] = useState(false);

  const grad  = thumbnailGradients[resource.thumbnail] ?? "from-violet-600 via-purple-500 to-pink-600";
  const emoji = thumbnailEmojis[resource.thumbnail]    ?? "📦";

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `${resource.title} — CretivHub`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() =>
        success("Enlace copiado 🔗", "Pega el enlace donde quieras compartirlo.")
      );
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle: ${resource.title}`}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Card — horizontal split on wide screens, stacked on mobile */}
      <div
        className="relative z-10 flex flex-col xs:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ width: "min(680px, calc(100vw - 2rem))", maxHeight: "min(600px, calc(100vh - 3rem))" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── LEFT/TOP: gradient hero ── */}
        <div
          className={`relative bg-gradient-to-br ${grad} flex flex-col items-center justify-center overflow-hidden`}
          style={{ flexShrink: 0, width: "clamp(140px, 30vw, 220px)", minHeight: "160px" }}
        >
          {/* grid texture */}
          <div className="absolute inset-0 grid-pattern opacity-25" />

          {/* glow */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-40 h-40 rounded-full blur-3xl opacity-50 bg-white/25" />
          </div>

          {/* bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          {/* big emoji */}
          <span
            className="relative z-10 select-none drop-shadow-2xl"
            style={{ fontSize: "88px", lineHeight: 1 }}
            aria-hidden="true"
          >
            {emoji}
          </span>

          {/* badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
            {resource.badge && <Badge type={resource.badge} />}
          </div>

          {/* type */}
          <div className="absolute bottom-4 left-4 z-20">
            <span className={`tag text-xs px-2.5 py-1 ${resource.type === "free" ? "tag-free" : "tag-premium"}`}>
              {resource.type === "free" ? "Gratis" : "Premium"}
            </span>
          </div>

          {/* downloads */}
          <div className="absolute bottom-4 right-3 z-20 flex items-center gap-1 text-white/60 text-xs font-medium">
            <ArrowDownToLine size={10} />
            {formatNumber(resource.downloads)}
          </div>
        </div>

        {/* ── RIGHT: info panel ── */}
        <div
          className="flex flex-col min-w-0"
          style={{ flex: 1, backgroundColor: "#0d1117" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-lg font-black text-white leading-tight mb-1 truncate">
                {resource.title}
              </h2>
              <p className="text-xs" style={{ color: "#6e7681" }}>
                por{" "}
                <span className="font-medium" style={{ color: "#a78bfa" }}>
                  {resource.author.name}
                </span>
                {resource.author.verified && (
                  <CheckCircle size={11} className="inline ml-1 text-violet-400" aria-label="Verificado" />
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex-shrink-0 p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tags */}
          <div className="px-5 pb-3 flex gap-1.5 flex-wrap flex-shrink-0">
            {resource.tags.map((tag) => (
              <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4" style={{ minHeight: 0 }}>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: "#8b949e" }}>
              {resource.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Valoración", value: `${resource.stars}★`, color: "#facc15", bg: "rgba(250,204,21,0.08)" },
                { label: "Guardados",  value: formatNumber(saveCount),              color: "#f472b6", bg: "rgba(244,114,182,0.08)" },
                { label: "Descargas",  value: formatNumber(resource.downloads),     color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center border border-white/5"
                  style={{ backgroundColor: bg }}
                >
                  <div className="text-sm font-black" style={{ color }}>{value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#6e7681" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Stars visual */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.round(resource.stars) ? "text-yellow-400 fill-yellow-400" : "text-white/10 fill-white/10"}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: "#6e7681" }}>{resource.stars} / 5</span>
            </div>
          </div>

          {/* Footer actions */}
          <div
            className="flex-shrink-0 flex gap-2 px-5 py-4"
            style={{ borderTop: "1px solid rgba(48,54,61,1)" }}
          >
            <button
              type="button"
              onClick={onSave}
              aria-label={saved ? "Quitar de guardados" : "Guardar"}
              className="flex-shrink-0 p-3 rounded-xl border transition-all duration-200"
              style={saved
                ? { backgroundColor: "rgba(236,72,153,0.15)", borderColor: "rgba(236,72,153,0.4)", color: "#f472b6" }
                : { backgroundColor: "#161b22", borderColor: "#30363d", color: "#8b949e" }
              }
            >
              <Heart size={16} className={saved ? "fill-pink-400" : ""} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartir"
              className="flex-shrink-0 p-3 rounded-xl border transition-all duration-200"
              style={{ backgroundColor: "#161b22", borderColor: "#30363d", color: "#8b949e" }}
            >
              <Share2 size={16} />
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
    </div>,
    document.body
  );
}
