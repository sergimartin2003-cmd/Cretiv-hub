"use client";

import { Heart, Package, CheckCircle, ArrowRight } from "lucide-react";
import { collections } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const coverGradients: Record<string, string> = {
  youtube:      "from-red-600/50 via-orange-600/30 to-yellow-600/50",
  aftereffects: "from-violet-600/50 via-indigo-600/30 to-blue-600/50",
  podcast:      "from-green-600/50 via-emerald-600/30 to-teal-600/50",
  retro:        "from-pink-600/50 via-rose-600/30 to-purple-600/50",
};

const coverEmojis: Record<string, string> = {
  youtube:      "▶️",
  aftereffects: "⚡",
  podcast:      "🎙️",
  retro:        "📼",
};

export default function Collections() {
  return (
    <section id="collections" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Colecciones <span className="gradient-text-pp">Curadas</span>
            </h2>
            <p className="text-[#8b949e]">Packs temáticos seleccionados por expertos</p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors duration-200 font-medium"
          >
            Ver todas <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => {
            const grad  = coverGradients[col.cover] ?? "from-violet-600/50 via-purple-600/30 to-pink-600/50";
            const emoji = coverEmojis[col.cover] ?? "📦";

            return (
              <button
                key={col.id}
                type="button"
                aria-label={`Ver colección: ${col.title}`}
                className="card-glow group flex flex-col text-left bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden w-full"
              >
                {/* Cover */}
                <div className={`relative h-36 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                  <div className="absolute inset-0 dot-pattern opacity-20" />
                  <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                    {emoji}
                  </span>
                  {col.official && (
                    <div className="absolute top-3 left-3">
                      <span className="badge-official flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        <CheckCircle size={9} /> Oficial
                      </span>
                    </div>
                  )}
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
  );
}
