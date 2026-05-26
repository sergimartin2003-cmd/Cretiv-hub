"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Menu, X, Zap, Command } from "lucide-react";

const navLinks = [
  { label: "Explorar", href: "#explore" },
  { label: "Colecciones", href: "#collections" },
  { label: "Trending", href: "#trending" },
  { label: "Comunidad", href: "#" },
];

const quickSearches = ["Cinematic LUTs", "After Effects presets", "Lofi music", "Thumbnail templates"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-dark shadow-xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#" aria-label="ContentHub — Inicio" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-tight hidden sm:block">
              Content<span className="gradient-text-pp">Hub</span>
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm text-[#8b949e] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 font-medium whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search trigger */}
            <button
              type="button"
              aria-label="Abrir búsqueda"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-[#6e7681] text-sm hover:border-violet-500/40 hover:text-[#8b949e] transition-all duration-200"
            >
              <Search size={13} />
              <span className="text-xs hidden lg:block">Buscar...</span>
              <div className="hidden lg:flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-[#0d1117] rounded text-[10px] font-mono border border-[#30363d]">
                <Command size={9} /> K
              </div>
            </button>

            <button
              type="button"
              aria-label="Notificaciones"
              className="relative p-2 text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
            </button>

            <button
              type="button"
              className="hidden md:block px-3 py-1.5 text-sm text-[#8b949e] border border-[#30363d] rounded-lg hover:border-violet-500/40 hover:text-white transition-all duration-200 font-medium whitespace-nowrap"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="btn-gradient px-4 py-1.5 text-sm font-bold text-white rounded-lg shadow-lg whitespace-nowrap"
            >
              Empezar
            </button>

            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="md:hidden p-2 text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden glass-dark border-t border-[#30363d]/50 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg mb-3">
              <Search size={13} className="text-[#6e7681]" />
              <input
                type="text"
                placeholder="Buscar recursos..."
                aria-label="Buscar recursos"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#6e7681] outline-none"
              />
            </div>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-sm text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[#30363d]/50 grid grid-cols-2 gap-2">
              <button type="button" className="py-2 text-sm text-[#8b949e] border border-[#30363d] rounded-lg">
                Iniciar sesión
              </button>
              <button type="button" className="py-2 text-sm font-bold text-white btn-gradient rounded-lg">
                Empezar gratis
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Search modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar recursos"
          className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#30363d]">
              <Search size={16} className="text-[#6e7681] shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar recursos, herramientas, templates..."
                aria-label="Buscar"
                className="flex-1 bg-transparent text-white placeholder-[#6e7681] text-sm outline-none"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] text-[#6e7681] bg-[#0d1117] rounded border border-[#30363d] font-mono shrink-0">
                ESC
              </kbd>
            </div>
            <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-[#30363d]/60">
              {["Video", "Audio", "Templates", "AI", "Gratis", "Plugins"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className="px-2.5 py-1 text-xs text-[#8b949e] bg-[#1c2128] rounded-full hover:bg-violet-600/20 hover:text-violet-400 transition-all duration-200 border border-[#30363d]"
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-[#6e7681] mb-2 uppercase tracking-wider font-medium">Populares</p>
              <div className="space-y-1">
                {quickSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    <Search size={12} className="text-[#6e7681]" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
