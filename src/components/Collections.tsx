"use client";

import { useState, useEffect } from "react";
import { Heart, Package, CheckCircle, ArrowRight, X, ExternalLink } from "lucide-react";
import { collections } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// ─── Lookup tables ────────────────────────────────────────────────────────────

const coverGradients: Record<string, string> = {
  youtube:      "from-red-600/50 via-orange-600/30 to-yellow-600/50",
  aftereffects: "from-violet-600/50 via-indigo-600/30 to-blue-600/50",
  podcast:      "from-green-600/50 via-emerald-600/30 to-teal-600/50",
  retro:        "from-pink-600/50 via-rose-600/30 to-purple-600/50",
  tiktok:       "from-cyan-600/50 via-pink-600/30 to-rose-600/50",
  branding:     "from-amber-600/50 via-orange-600/30 to-yellow-600/50",
};

const coverEmojis: Record<string, string> = {
  youtube:      "▶️",
  aftereffects: "⚡",
  podcast:      "🎙️",
  retro:        "📼",
  tiktok:       "🎵",
  branding:     "🎨",
};

// Maps each collection to the ExploreSection filter it corresponds to
const collectionFilter: Record<string, string> = {
  youtube:      "Video",
  aftereffects: "Video",
  podcast:      "Audio",
  retro:        "Video",
  tiktok:       "Templates",
  branding:     "Diseño",
};

// Short bullet points per collection
const collectionHighlights: Record<string, string[]> = {
  youtube:      ["LUTs cinematográficos", "Thumbnails listos", "Música sin copyright", "Guía de SEO"],
  aftereffects: ["Transiciones premium", "Animaciones de título", "Motion blur pack", "Plugins suite"],
  podcast:      ["Intros y outros", "Diseños de portada", "Procesado vocal", "Templates descripción"],
  retro:        ["Overlays VHS y glitch", "Fuentes retro", "Filtros de color", "Efectos de sonido"],
  tiktok:       ["Templates verticales", "Efectos de sonido", "Subtítulos animados", "Kit de edición"],
  branding:     ["Paletas de color", "Fuentes display", "UI Kit completo", "Mockups premium"],
};

type Collection = typeof collections[number];

// ─── Collection Detail Modal ──────────────────────────────────────────────────

function CollectionModal({ col, onClose }: { col: Collection; onClose: () => void }) {
  const grad       = coverGradients[col.cover] ?? "from-violet-600/50 via-purple-600/30 to-pink-600/50";
  const emoji      = coverEmojis[col.cover]    ?? "📦";
  const filter     = collectionFilter[col.cover] ?? "Todos";
  const highlights = collectionHighlights[col.cover] ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => { window.removeEventListener("keydown", onKey); unlockScroll(); };
  }, [onClose]);

  function handleExplore() {
    onClose();
    window.dispatchEvent(new CustomEvent("ch:category-filter", { detail: filter }));
    setTimeout(() => {
      const el = document.getElementById("explore");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }, 50);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Colección: ${col.title}`}
      className="fixed inset-0 z-[75] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        <div className={`relative h-40 bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <span className="text-7xl relative z-10 select-none" aria-hidden="true">{emoji}</span>
          {col.official && (
            <div className="absolute top-3 left-3 z-20">
              <span className="badge-official flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                <CheckCircle size={9} /> Colección Oficial
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 z-20 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <h2 className="text-white font-bold text-lg leading-snug mb-1">{col.title}</h2>
            <p className="text-[#8b949e] text-sm leading-relaxed">{col.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Recursos",  value: col.resources,              cls: "text-violet-400" },
              { label: "Guardados", value: formatNumber(col.saves),    cls: "text-pink-400"   },
              { label: "Autor",     value: col.author,                 cls: "text-cyan-400"   },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-[#0d1117] rounded-xl p-3 text-center border border-[#30363d]">
                <div className={`text-sm font-black truncate ${cls}`}>{value}</div>
                <div className="text-[10px] text-[#6e7681] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold mb-2">Incluye</p>
              <ul className="grid grid-cols-2 gap-1.5">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-[#8b949e] bg-[#161b22] rounded-lg px-3 py-2 border border-[#30363d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#30363d] shrink-0">
          <button
            type="button"
            onClick={handleExplore}
            className="btn-gradient w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          >
            <ExternalLink size={15} />
            Explorar colección
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Collections section ──────────────────────────────────────────────────────

function scrollToExplore() {
  const el = document.getElementById("explore");
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
}

export default function Collections() {
  const [selected, setSelected] = useState<Collection | null>(null);

  return (
    <>
      <section id="collections" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Colecciones <span className="gradient-text-pp">Curadas</span>
              </h2>
              <p className="text-[#8b949e]">Packs temáticos seleccionados por expertos</p>
            </div>
            <button
              type="button"
              onClick={scrollToExplore}
              className="hidden md:flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors duration-200 font-medium"
            >
              Ver recursos <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const grad  = coverGradients[col.cover] ?? "from-violet-600/50 via-purple-600/30 to-pink-600/50";
              const emoji = coverEmojis[col.cover]    ?? "📦";

              return (
                <button
                  key={col.id}
                  type="button"
                  aria-label={`Ver colección: ${col.title}`}
                  onClick={() => setSelected(col)}
                  className="card-glow group flex flex-col text-left bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden w-full"
                >
                  {/* Cover */}
                  <div className={`relative h-36 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                    <div className="absolute inset-0 dot-pattern opacity-20" />
                    <span
                      className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500"
                      aria-hidden="true"
                    >
                      {emoji}
                    </span>
                    {col.official && (
                      <div className="absolute top-3 left-3">
                        <span className="badge-official flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle size={9} /> Oficial
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <span className="text-white text-sm font-semibold flex items-center gap-2">
                        Ver colección <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 group-hover:text-violet-300 transition-colors duration-200">
                        {col.title}
                      </h3>
                      <p className="text-[#6e7681] text-xs leading-relaxed line-clamp-2">
                        {col.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#30363d]">
                      <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                        <span className="flex items-center gap-1">
                          <Package size={11} aria-hidden="true" />
                          {col.resources} recursos
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={11} aria-hidden="true" />
                          {formatNumber(col.saves)}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6e7681]">por {col.author}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selected && (
        <CollectionModal col={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
