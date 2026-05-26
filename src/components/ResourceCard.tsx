"use client";

import { useState, useEffect } from "react";
import { Star, Download, Heart, ExternalLink, CheckCircle, Flame, Sparkles } from "lucide-react";
import { Resource } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isResourceSaved, toggleSavedResource } from "@/lib/auth";

const thumbnailGradients: Record<string, string> = {
  luts:      "from-orange-600/30 via-red-500/20 to-pink-600/30",
  motion:    "from-indigo-600/30 via-violet-600/20 to-purple-600/30",
  ai:        "from-pink-600/30 via-rose-500/20 to-red-600/30",
  audio:     "from-green-600/30 via-emerald-500/20 to-teal-600/30",
  templates: "from-yellow-600/30 via-amber-500/20 to-orange-600/30",
  photo:     "from-cyan-600/30 via-blue-500/20 to-indigo-600/30",
};

const thumbnailEmojis: Record<string, string> = {
  luts: "🎞️", motion: "✨", ai: "🤖", audio: "🎵", templates: "🗂️", photo: "📷",
};

function Badge({ type }: { type: "trending" | "new" | "official" }) {
  const styles = {
    trending: { cls: "badge-trending", icon: <Flame size={9} />,        label: "Trending" },
    new:      { cls: "badge-new",      icon: <Sparkles size={9} />,      label: "Nuevo"    },
    official: { cls: "badge-official", icon: <CheckCircle size={9} />,   label: "Oficial"  },
  };
  const { cls, icon, label } = styles[type];
  return (
    <span className={`${cls} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
      {icon} {label}
    </span>
  );
}

export default function ResourceCard({ resource }: { resource: Resource }) {
  const { isLoggedIn, session, openAuth } = useAuth();
  const { success, info } = useToast();

  // Optimistic UI: start from localStorage if user is logged in
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(resource.saves);

  // Sync saved state when session changes
  useEffect(() => {
    if (session) {
      setSaved(isResourceSaved(session.userId, resource.id));
    } else {
      setSaved(false);
    }
  }, [session, resource.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !session) {
      openAuth("register");
      info("Crea una cuenta gratis", "Guarda tus recursos favoritos y accede desde cualquier lugar.");
      return;
    }

    const nowSaved = toggleSavedResource(session.userId, resource.id);
    setSaved(nowSaved);
    setSaveCount((c) => (nowSaved ? c + 1 : c - 1));

    if (nowSaved) {
      success("Recurso guardado ❤️", `"${resource.title}" añadido a tus guardados`);
    } else {
      info("Recurso eliminado", `"${resource.title}" quitado de guardados`);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      openAuth("register");
      info("Inicia sesión para descargar", "Crea una cuenta gratis para acceder a todos los recursos.");
      return;
    }

    // Placeholder — real download would use a URL from DB
    success("Descarga iniciada ⬇️", resource.title);
  };

  const grad  = thumbnailGradients[resource.thumbnail] ?? "from-violet-600/30 via-purple-500/20 to-pink-600/30";
  const emoji = thumbnailEmojis[resource.thumbnail] ?? "📦";

  return (
    <div className="card-glow group flex flex-col bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">

      {/* Thumbnail */}
      <div className={`relative h-44 bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden shrink-0`}>
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <span
          className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500 select-none"
          aria-hidden="true"
        >
          {emoji}
        </span>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {resource.badge && <Badge type={resource.badge} />}
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className={`tag ${resource.type === "free" ? "tag-free" : "tag-premium"}`}>
            {resource.type === "free" ? "Gratis" : "Premium"}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
          <button
            type="button"
            aria-label="Ver detalles del recurso"
            className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-colors duration-200"
          >
            <ExternalLink size={15} />
          </button>
          <button
            type="button"
            aria-label={`Descargar ${resource.title}`}
            onClick={handleDownload}
            className="btn-gradient px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5"
          >
            <Download size={13} />
            Descargar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
          ))}
        </div>

        {/* Title & desc */}
        <div className="flex-1 min-h-0">
          <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 group-hover:text-violet-300 transition-colors duration-200 line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-[#6e7681] text-xs leading-relaxed line-clamp-2">
            {resource.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#30363d] mt-auto">

          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              aria-hidden="true"
              className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            >
              {resource.author.avatar}
            </div>
            <span className="text-xs text-[#8b949e] truncate flex items-center gap-1">
              {resource.author.name}
              {resource.author.verified && (
                <CheckCircle size={10} className="text-violet-400 shrink-0" aria-label="Verificado" />
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-1 text-[#8b949e] text-xs"
              aria-label={`Valoración: ${resource.stars}`}
            >
              <Star size={11} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
              {resource.stars}
            </div>
            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? "Quitar de guardados" : "Guardar recurso"}
              aria-pressed={saved}
              className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                saved ? "text-pink-400" : "text-[#8b949e] hover:text-pink-400"
              }`}
            >
              <Heart
                size={11}
                className={`transition-all duration-200 ${saved ? "fill-pink-400 scale-110" : ""}`}
                aria-hidden="true"
              />
              {formatNumber(saveCount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
