"use client";

import { useEffect } from "react";
import { X, CheckCircle, Download, Heart, Share2, Flame, Sparkles, Star, ArrowDownToLine } from "lucide-react";
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

  const grad  = thumbnailGradients[resource.thumbnail] ?? "from-violet-600 via-purple-500 to-pink-600";
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
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Panel — two-column layout */}
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
        style={{ maxHeight: "min(88vh, 640px)" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left: visual hero ── */}
        <div
          className={`relative sm:w-60 shrink-0 h-52 sm:h-auto bg-gradient-to-br ${grad} flex flex-col items-center justify-center overflow-hidden`}
        >
          {/* grid texture */}
          <div className="absolute inset-0 grid-pattern opacity-20" />

          {/* glow blob */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-44 rounded-full blur-3xl opacity-40 bg-white/20" />
          </div>

          {/* dark gradient bottom */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          {/* emoji */}
          <span className="text-[80px] sm:text-[96px] relative z-10 drop-shadow-2xl select-none leading-none" aria-hidden="true">
            {emoji}
          </span>

          {/* badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            {resource.badge && <Badge type={resource.badge} />}
          </div>

          {/* type tag */}
          <div className="absolute bottom-4 left-4 z-20">
            <span className={`tag text-xs px-3 py-1 ${resource.type === "free" ? "tag-free" : "tag-premium"}`}>
              {resource.type === "free" ? "✦ Gratis" : "⭐ Premium"}
            </span>
          </div>

          {/* downloads watermark */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 text-white/60 text-xs font-medium">
            <ArrowDownToLine size={11} />
            {formatNumber(resource.downloads)}
          </div>
        </div>

        {/* ── Right: info panel ── */}
        <div className="flex-1 bg-[#0d1117] flex flex-col min-h-0">

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-3 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-black text-white leading-tight mb-1">
                {resource.title}
              </h2>
              <p className="text-xs text-[#6e7681]">
                por{" "}
                <span className="text-violet-400 font-medium">{resource.author.name}</span>
                {resource.author.verified && (
                  <CheckCircle size={11} className="inline ml-1 text-violet-400" aria-label="Verificado" />
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#8b949e] hover:text-white transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tags */}
          <div className="px-6 pb-3 flex gap-1.5 flex-wrap shrink-0">
            {resource.tags.map((tag) => (
              <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 min-h-0">

            {/* Description */}
            <p className="text-[#8b949e] text-sm leading-relaxed">
              {resource.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Valoración", value: `${resource.stars}★`, cls: "text-yellow-400", bg: "bg-yellow-500/8" },
                { label: "Guardados",  value: formatNumber(saveCount), cls: "text-pink-400",   bg: "bg-pink-500/8"   },
                { label: "Descargas",  value: formatNumber(resource.downloads), cls: "text-violet-400", bg: "bg-violet-500/8" },
              ].map(({ label, value, cls, bg }) => (
                <div key={label} className={`${bg} border border-white/5 rounded-xl p-3 text-center`}>
                  <div className={`text-base font-black ${cls}`}>{value}</div>
                  <div className="text-[10px] text-[#6e7681] mt-0.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* Rating stars visual */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.round(resource.stars) ? "text-yellow-400 fill-yellow-400" : "text-[#30363d]"}
                  />
                ))}
              </div>
              <span className="text-xs text-[#6e7681]">{resource.stars} de 5</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-[#30363d] flex gap-2.5 shrink-0">
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
    </div>
  );
}
