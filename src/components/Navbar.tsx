"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Menu, X, Zap, Command, LogOut, ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { creatorTypeLabels } from "@/lib/auth";
import { resources } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import UserProfileModal from "@/components/UserProfileModal";

const navLinks = [
  { label: "Explorar",    href: "#explore" },
  { label: "Colecciones", href: "#collections" },
  { label: "Trending",    href: "#trending" },
  { label: "Comunidad",   href: "#" },
];

const quickSearches = [
  "Cinematic LUTs",
  "After Effects presets",
  "Lofi music",
  "Thumbnail templates",
];

const filterChips = ["Video", "Audio", "Templates", "IA", "Gratis", "Plugins"];

const filterMap: Record<string, string[]> = {
  Video:     ["video", "luts", "cinematic", "motion"],
  Audio:     ["audio", "music", "sfx"],
  Templates: ["templates", "youtube", "social"],
  IA:        ["ai", "automation"],
  Gratis:    [],   // handled by type
  Plugins:   [],
};

// ─── Search Modal ────────────────────────────────────────────────────────────

function SearchModal({
  query, setQuery, onClose,
}: {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
}) {
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const results = resources.filter((r) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q);

    const matchesChip = !activeChip || (() => {
      if (activeChip === "Gratis")  return r.type === "free";
      if (activeChip === "Plugins") return r.category === "plugins";
      const keys = filterMap[activeChip] ?? [];
      return r.tags.some((t) => keys.includes(t)) || keys.includes(r.category);
    })();

    return matchesQuery && matchesChip;
  }).slice(0, 6);

  const showResults = query.trim().length > 0 || activeChip !== null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar recursos"
      className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
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
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="text-[#6e7681] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] text-[#6e7681] bg-[#0d1117] rounded border border-[#30363d] font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-2.5 flex gap-2 flex-wrap border-b border-[#30363d]/60">
          {filterChips.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveChip(activeChip === f ? null : f)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all duration-200 border ${
                activeChip === f
                  ? "bg-violet-600/20 text-violet-400 border-violet-500/40"
                  : "text-[#8b949e] bg-[#1c2128] hover:bg-violet-600/10 hover:text-violet-400 border-[#30363d]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results or popular */}
        <div className="max-h-80 overflow-y-auto">
          {showResults ? (
            <div className="px-4 py-3">
              {results.length > 0 ? (
                <>
                  <p className="text-xs text-[#6e7681] mb-2 uppercase tracking-wider font-medium">
                    {results.length} resultado{results.length !== 1 ? "s" : ""}
                  </p>
                  <div className="space-y-1">
                    {results.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("ch:search", { detail: { resourceId: r.id } }));
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150 group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/10 flex items-center justify-center text-base shrink-0">
                          {r.thumbnail === "luts" ? "🎞️" : r.thumbnail === "audio" ? "🎵" : r.thumbnail === "ai" ? "🤖" : r.thumbnail === "motion" ? "✨" : r.thumbnail === "templates" ? "🗂️" : "📷"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate group-hover:text-violet-300 transition-colors">
                            {r.title}
                          </p>
                          <p className="text-xs text-[#6e7681] flex items-center gap-2">
                            <span className={`tag tag-${r.type === "free" ? "free" : "premium"} py-0`}>
                              {r.type === "free" ? "Gratis" : "Premium"}
                            </span>
                            <span>{formatNumber(r.downloads)} descargas</span>
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-[#30363d] group-hover:text-violet-400 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                  {/* "Ver todos" footer */}
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("ch:search", { detail: { query: query.trim() } }));
                        onClose();
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 rounded-xl hover:bg-violet-600/5 transition-all duration-200"
                    >
                      Ver los {results.length} resultados en Explorar
                      <ArrowRight size={12} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-[#8b949e] text-sm">
                    Sin resultados para <span className="text-white font-medium">"{query}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setActiveChip(null); }}
                    className="text-xs text-violet-400 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-xs text-[#6e7681] mb-2 uppercase tracking-wider font-medium">Búsquedas populares</p>
              <div className="space-y-1">
                {quickSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    <Search size={12} className="text-[#6e7681]" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { isLoggedIn, session, logout: authLogout, openAuth } = useAuth();
  const { info } = useToast();

  function logout() {
    authLogout();
    info("Sesión cerrada", "Hasta pronto 👋");
  }

  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [query,        setQuery]        = useState("");

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
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Listen for search open events from Hero or anywhere
  useEffect(() => {
    const handler = (e: Event) => {
      const term = (e as CustomEvent<string>).detail ?? "";
      setQuery(term);
      setSearchOpen(true);
    };
    window.addEventListener("ch:open-search", handler);
    return () => window.removeEventListener("ch:open-search", handler);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = () => setUserMenuOpen(false);
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, [userMenuOpen]);

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

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative p-2 text-[#8b949e] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
            </button>

            {/* ── Logged out ── */}
            {!isLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="hidden md:block px-3 py-1.5 text-sm text-[#8b949e] border border-[#30363d] rounded-lg hover:border-violet-500/40 hover:text-white transition-all duration-200 font-medium whitespace-nowrap"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="btn-gradient px-4 py-1.5 text-sm font-bold text-white rounded-lg shadow-lg whitespace-nowrap"
                >
                  Empezar
                </button>
              </>
            )}

            {/* ── Logged in — user menu ── */}
            {isLoggedIn && session && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  aria-label="Menú de usuario"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-violet-500/40 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {session.avatar}
                  </div>
                  <span className="hidden md:block text-sm text-white font-medium max-w-[100px] truncate">
                    {session.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-[#6e7681] transition-transform duration-200 hidden md:block ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl border border-[#30363d] overflow-hidden z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#30363d]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {session.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{session.name}</div>
                          <div className="text-xs text-[#6e7681] truncate">@{session.username}</div>
                          <div className="text-[10px] text-violet-400 font-medium mt-0.5">
                            {creatorTypeLabels[session.creatorType]}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {[
                        { label: "Mi perfil",      icon: "👤", action: () => { setUserMenuOpen(false); setProfileOpen(true); } },
                        { label: "Mis guardados",  icon: "❤️", action: () => { setUserMenuOpen(false); setProfileOpen(true); } },
                        { label: "Mis colecciones",icon: "📁", action: () => {} },
                        { label: "Configuración",  icon: "⚙️", action: () => {} },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b949e] hover:text-white hover:bg-white/5 transition-all duration-150 text-left"
                        >
                          <span className="text-base" aria-hidden="true">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#30363d] py-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-150 text-left"
                      >
                        <LogOut size={14} aria-hidden="true" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
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
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  className="col-span-2 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut size={13} />
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { openAuth("login"); setMenuOpen(false); }}
                    className="py-2 text-sm text-[#8b949e] border border-[#30363d] rounded-lg"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => { openAuth("register"); setMenuOpen(false); }}
                    className="py-2 text-sm font-bold text-white btn-gradient rounded-lg"
                  >
                    Empezar gratis
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search modal */}
      {searchOpen && (
        <SearchModal query={query} setQuery={setQuery} onClose={() => setSearchOpen(false)} />
      )}

      {/* Profile modal */}
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
