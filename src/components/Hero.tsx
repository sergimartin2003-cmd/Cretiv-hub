"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Star, Users, Package, Sparkles, Play, Search, X, Zap, Shield, Globe } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const popularSearches = ["Cinematic LUTs", "Lofi music", "Motion templates", "AI tools", "Lightroom presets"];
const words = ["Vídeo", "Diseño", "Audio", "Motion", "Fotografía", "Contenido"];
const stats = [
  { label: "Recursos",  value: 12000, icon: Package },
  { label: "Creadores", value: 58000, icon: Users   },
  { label: "Rating",    value: 4.9,   icon: Star    },
];

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref     = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps     = 60;
          const increment = target / steps;
          let current     = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
          }, 2000 / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const display =
    target >= 1000     ? formatNumber(count)
    : Number.isInteger(target) ? count.toString()
    : count.toFixed(1);

  return <span ref={ref}>{display}</span>;
}

// ─── Demo modal ───────────────────────────────────────────────────────────────

const features = [
  {
    icon: "🎞️",
    title: "20+ categorías de recursos",
    desc: "LUTs, motion graphics, audio, templates, fuentes, plugins y mucho más — todo en un solo lugar.",
  },
  {
    icon: "🤖",
    title: "Herramientas con IA",
    desc: "Elimina fondos, genera prompts para Midjourney, automatiza tu flujo de trabajo creativo.",
  },
  {
    icon: "❤️",
    title: "Guarda lo que te gusta",
    desc: "Crea tu biblioteca personal. Accede a tus recursos favoritos cuando quieras desde tu perfil.",
  },
  {
    icon: "🔍",
    title: "Búsqueda inteligente",
    desc: "Encuentra cualquier recurso al instante. Filtra por categoría, tipo, valoración o popularidad.",
  },
  {
    icon: "🏆",
    title: "Trending en tiempo real",
    desc: "Descubre qué están usando ahora mismo los creadores más exitosos de la comunidad.",
  },
  {
    icon: "🚀",
    title: "Siempre gratis",
    desc: "Miles de recursos gratuitos listos para descargar. Sin suscripción obligatoria.",
  },
];

function DemoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Demo de CretivHub"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-white">¿Qué es CretivHub?</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-[#6e7681] hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[#8b949e] text-sm mb-6 leading-relaxed">
            La plataforma definitiva para creadores de contenido. Accede a miles de recursos
            profesionales — LUTs, música, templates, fuentes, plugins de IA y mucho más.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-violet-500/30 transition-all duration-200"
              >
                <span className="text-2xl shrink-0" aria-hidden="true">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-[#6e7681] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap text-xs text-[#6e7681]">
            {[
              { icon: Shield, text: "Recursos verificados" },
              { icon: Globe,  text: "Comunidad global"     },
              { icon: Zap,    text: "Actualizado a diario" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon size={11} className="text-violet-400" /> {text}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#30363d] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              const el = document.getElementById("explore");
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
            }}
            className="btn-gradient flex-1 py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            Empezar a explorar
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);
  const [demoOpen,  setDemoOpen]  = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setWordIndex((i) => (i + 1) % words.length); setVisible(true); }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Backgrounds */}
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117]" />
        <div className="orb w-[500px] h-[500px] bg-violet-600 top-0 left-1/2 -translate-x-1/2" />
        <div className="orb w-[350px] h-[350px] bg-pink-600 top-1/3 right-0 translate-x-1/3" />
        <div className="orb w-[280px] h-[280px] bg-cyan-600 bottom-1/4 left-0 -translate-x-1/4" />

        {/* Badge */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm">
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-[#8b949e]">La plataforma #1 para creadores de contenido</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-400 rounded-full tracking-wider">NUEVO</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 leading-[1.08]">
            El repositorio definitivo
            <br />
            <span className="inline-flex items-baseline gap-3 flex-wrap justify-center">
              <span className="text-[#8b949e] font-black">para</span>
              <span
                className={`gradient-text transition-all duration-300 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                }`}
                style={{ display: "inline-block", minWidth: "200px", textAlign: "left" }}
              >
                {words[wordIndex]}
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#8b949e] max-w-2xl mx-auto mb-10 leading-relaxed">
            Miles de recursos premium, templates, herramientas y assets
            organizados para llevar tu contenido al siguiente nivel.
          </p>

          {/* Hero Search Bar */}
          <div className="w-full max-w-2xl mx-auto mb-6">
            <button
              type="button"
              aria-label="Abrir buscador"
              onClick={() => window.dispatchEvent(new CustomEvent("ch:open-search"))}
              className="w-full flex items-center gap-3 px-5 py-4 glass border border-[#30363d] rounded-2xl hover:border-violet-500/50 transition-all duration-300 group shadow-xl text-left"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:from-violet-600/30 group-hover:to-pink-600/30 transition-all duration-300">
                <Search size={16} className="text-violet-400" />
              </div>
              <span className="flex-1 text-[#6e7681] text-base group-hover:text-[#8b949e] transition-colors duration-200">
                Busca recursos, templates, música, LUTs...
              </span>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[#0d1117] rounded-lg border border-[#30363d] text-[11px] text-[#6e7681] font-mono shrink-0">
                Ctrl K
              </div>
            </button>

            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
              <span className="text-xs text-[#6e7681]">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  aria-label={`Buscar ${term}`}
                  onClick={() => window.dispatchEvent(new CustomEvent("ch:open-search", { detail: term }))}
                  className="text-xs px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-full text-[#8b949e] hover:text-white hover:border-violet-500/40 hover:bg-[#1c2128] transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <a
              href="#explore"
              className="btn-gradient inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl shadow-[0_0_24px_rgba(124,58,237,0.35)]"
            >
              <Sparkles size={15} />
              Explorar todo
              <ArrowRight size={15} />
            </a>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#e6edf3] bg-[#161b22] border border-[#30363d] rounded-xl hover:border-violet-500/50 hover:bg-[#1c2128] transition-all duration-300"
            >
              <Play size={14} className="text-violet-400" fill="currentColor" />
              Ver demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-1 flex items-end justify-center gap-1">
                  <AnimatedCounter target={value} />
                  {value === 4.9  && <span className="text-yellow-400 text-2xl">★</span>}
                  {value >= 1000  && <span className="text-violet-400 text-2xl">+</span>}
                </div>
                <div className="text-sm text-[#6e7681] flex items-center justify-center gap-1.5">
                  <Icon size={12} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="relative z-10 mt-20 max-w-4xl mx-auto px-4 w-full animate-float">
          <div className="gradient-border">
            <div className="relative rounded-2xl overflow-hidden bg-[#161b22] shadow-2xl">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#1c2128] border-b border-[#30363d]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-[#0d1117] rounded-md text-xs text-[#6e7681] font-mono">
                    cretivhub.dev/explore
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { color: "from-red-500/20 to-orange-500/20",     label: "Cinematic LUTs",   sub: "1,240 recursos", emoji: "🎞️" },
                  { color: "from-violet-500/20 to-pink-500/20",    label: "Motion Graphics",   sub: "654 recursos",   emoji: "✨" },
                  { color: "from-cyan-500/20 to-blue-500/20",      label: "Sound Design",      sub: "432 recursos",   emoji: "🎵" },
                  { color: "from-green-500/20 to-teal-500/20",     label: "AI Tools",          sub: "876 recursos",   emoji: "🤖" },
                  { color: "from-amber-500/20 to-yellow-500/20",   label: "Templates",         sub: "2,100 recursos", emoji: "🗂️" },
                  { color: "from-indigo-500/20 to-violet-500/20",  label: "Plugins",           sub: "478 recursos",   emoji: "🔌" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`h-20 rounded-xl bg-gradient-to-br ${item.color} border border-white/5 flex flex-col items-center justify-center gap-1.5`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[11px] font-semibold text-white/80">{item.label}</span>
                    <span className="text-[9px] text-white/40">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-violet-600/15 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 mt-16 flex flex-col items-center gap-2 text-[#6e7681]">
          <span className="text-xs tracking-wider">SCROLL</span>
          <div className="w-5 h-8 border border-[#30363d] rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-violet-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </>
  );
}
