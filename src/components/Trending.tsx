"use client";

import { TrendingUp, TrendingDown, Minus, Star, Download, ArrowRight } from "lucide-react";
import { trending } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const catTagClass: Record<string, string> = {
  LUTs: "tag-luts", Audio: "tag-audio", Templates: "tag-templates", "AI Tools": "tag-ai",
};

const catEmoji: Record<string, string> = {
  LUTs: "🎞️", Audio: "🎵", Templates: "🗂️", "AI Tools": "🤖",
};

export default function Trending() {
  return (
    <section id="trending" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Trending list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1.5">
                  <span className="gradient-text-pp">Trending</span> esta semana
                </h2>
                <p className="text-[#8b949e] text-sm">Los más descargados ahora mismo</p>
              </div>
              <a
                href="#"
                className="hidden md:flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Ver ranking <ArrowRight size={14} />
              </a>
            </div>

            <ol className="space-y-3">
              {trending.map((item) => (
                <li key={item.pos}>
                  <button
                    type="button"
                    aria-label={`#${item.pos} ${item.title} — ${item.category}`}
                    className="card-glow w-full flex items-center gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-xl cursor-pointer group text-left"
                  >
                    {/* Position */}
                    <div className="w-8 text-center shrink-0">
                      <span className="text-xl font-black text-[#30363d] group-hover:text-[#6e7681] transition-colors tabular-nums">
                        {String(item.pos).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Change */}
                    <div className="shrink-0 w-4" aria-hidden="true">
                      {item.change === "up"   && <TrendingUp   size={14} className="text-green-400" />}
                      {item.change === "down" && <TrendingDown  size={14} className="text-red-400" />}
                      {item.change === "same" && <Minus         size={14} className="text-[#6e7681]" />}
                    </div>

                    {/* Icon */}
                    <div
                      aria-hidden="true"
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600/25 to-pink-600/25 border border-violet-500/15 flex items-center justify-center text-lg shrink-0"
                    >
                      {catEmoji[item.category] ?? "📦"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate mb-1">
                        {item.title}
                      </h4>
                      <span className={`tag ${catTagClass[item.category] ?? "tag-design"}`}>
                        {item.category}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-[#8b949e] shrink-0">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                        {item.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={11} aria-hidden="true" />
                        {formatNumber(item.downloads)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-widest text-[#8b949e]">
                📊 Estadísticas
              </h3>
              <dl className="space-y-3">
                {[
                  { label: "Recursos subidos hoy", value: "+148",   color: "text-green-400" },
                  { label: "Descargas esta semana", value: "892K",   color: "text-violet-400" },
                  { label: "Nuevos creadores",      value: "+2,140", color: "text-cyan-400" },
                  { label: "Colecciones activas",   value: "1,892",  color: "text-pink-400" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-[#8b949e] leading-tight">{s.label}</dt>
                    <dd className={`text-sm font-bold shrink-0 ${s.color}`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Newsletter */}
            <div className="gradient-border">
              <div className="bg-[#161b22] rounded-2xl p-5">
                <div className="text-2xl mb-2.5" aria-hidden="true">💌</div>
                <h3 className="text-white font-bold mb-1.5">Newsletter semanal</h3>
                <p className="text-[#8b949e] text-sm mb-4 leading-relaxed">
                  Los mejores recursos de la semana en tu inbox.
                </p>
                <label htmlFor="newsletter-email" className="sr-only">Tu email</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#6e7681] mb-3 outline-none focus:border-violet-500/50 transition-colors"
                />
                <button type="button" className="w-full btn-gradient py-2.5 rounded-xl text-sm font-bold text-white">
                  Suscribirme gratis
                </button>
                <p className="text-[10px] text-[#6e7681] mt-2.5 text-center">
                  Sin spam · Baja cuando quieras
                </p>
              </div>
            </div>

            {/* Top contributors */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-widest text-[#8b949e]">
                🏆 Top Contribuidores
              </h3>
              <ol className="space-y-3">
                {[
                  { name: "VisualCraft",  uploads: 142, avatar: "VC" },
                  { name: "AudioVault",   uploads: 98,  avatar: "AV" },
                  { name: "AIStudio",     uploads: 87,  avatar: "AI" },
                  { name: "ThumbnailPro", uploads: 76,  avatar: "TP" },
                ].map((user, i) => (
                  <li key={user.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#6e7681] w-4 shrink-0" aria-hidden="true">{i + 1}</span>
                    <div
                      aria-hidden="true"
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0"
                    >
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{user.name}</div>
                      <div className="text-xs text-[#6e7681]">{user.uploads} uploads</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
