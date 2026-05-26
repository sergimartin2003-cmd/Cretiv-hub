"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  SlidersHorizontal, Grid3x3, List, SearchX, X, Search,
  Star, Download, Heart, CheckCircle, Flame, Sparkles, ChevronDown,
} from "lucide-react";
import { resources, Resource } from "@/lib/data";
import ResourceCard from "./ResourceCard";
import ResourceDetailModal from "./ResourceDetailModal";
import { thumbnailGradients, thumbnailEmojis } from "./ResourceDetailModal";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { isResourceSaved, toggleSavedResource, trackDownload } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";

const filters = ["Todos", "Video", "Audio", "Foto", "Diseño", "IA", "Templates", "Gratis", "Premium"];
const sorts   = ["Trending", "Recientes", "Mejor valorados", "Más guardados"];

const ITEMS_PER_PAGE = 9;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function filterByCategory(list: Resource[], filter: string): Resource[] {
  if (filter === "Todos")   return list;
  if (filter === "Gratis")  return list.filter((r) => r.type === "free");
  if (filter === "Premium") return list.filter((r) => r.type === "premium");

  const map: Record<string, string[]> = {
    Video:     ["video", "luts", "cinematic", "motion", "effects"],
    Audio:     ["audio", "music", "sfx"],
    Foto:      ["photo", "lightroom", "presets"],
    Diseño:    ["design", "social", "templates"],
    IA:        ["ai", "automation"],
    Templates: ["templates", "youtube", "social"],
  };

  const keys = map[filter] ?? [];
  return list.filter(
    (r) => r.tags.some((t) => keys.includes(t)) || keys.includes(r.category)
  );
}

function filterByText(list: Resource[], text: string): Resource[] {
  if (!text.trim()) return list;
  const q = text.toLowerCase().trim();
  return list.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q) ||
      r.author.name.toLowerCase().includes(q)
  );
}

function sortResources(list: Resource[], sort: string): Resource[] {
  const copy = [...list];
  if (sort === "Mejor valorados") return copy.sort((a, b) => b.stars - a.stars);
  if (sort === "Más guardados")   return copy.sort((a, b) => b.saves - a.saves);
  if (sort === "Recientes")       return copy.sort((a, b) => Number(b.id) - Number(a.id));
  return copy.sort((a, b) => b.downloads - a.downloads);
}

// ─── List-view card ───────────────────────────────────────────────────────────

function ResourceListCard({ resource }: { resource: Resource }) {
  const { isLoggedIn, session, openAuth } = useAuth();
  const { success, info } = useToast();

  const [saved,     setSaved]     = useState(false);
  const [saveCount, setSaveCount] = useState(resource.saves);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setSaved(session ? isResourceSaved(session.userId, resource.id) : false);
  }, [session, resource.id]);

  function handleSave(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!isLoggedIn || !session) {
      openAuth("register");
      info("Crea una cuenta gratis", "Guarda tus recursos favoritos.");
      return;
    }
    const nowSaved = toggleSavedResource(session.userId, resource.id);
    setSaved(nowSaved);
    setSaveCount((c) => (nowSaved ? c + 1 : c - 1));
    nowSaved
      ? success("Recurso guardado ❤️", `"${resource.title}" añadido a tus guardados`)
      : info("Recurso eliminado", `"${resource.title}" quitado de guardados`);
  }

  function handleDownload(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!isLoggedIn) { openAuth("register"); info("Inicia sesión para descargar", "Crea una cuenta gratis."); return; }
    if (session) trackDownload(session.userId);
    success("Descarga iniciada ⬇️", resource.title);
  }

  const grad  = thumbnailGradients[resource.thumbnail] ?? "from-violet-600/30 via-purple-500/20 to-pink-600/30";
  const emoji = thumbnailEmojis[resource.thumbnail]    ?? "📦";

  return (
    <>
      <div className="card-glow group flex flex-row bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        {/* Thumbnail */}
        <div
          className={`relative w-[88px] sm:w-28 shrink-0 bg-gradient-to-br ${grad} flex items-center justify-center cursor-pointer`}
          onClick={() => setDetailOpen(true)}
        >
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300 select-none" aria-hidden="true">
            {emoji}
          </span>
          {resource.badge === "trending" && (
            <span className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold badge-trending">
              <Flame size={8} /> Hot
            </span>
          )}
          {resource.badge === "new" && (
            <span className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold badge-new">
              <Sparkles size={8} /> New
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="text-white font-semibold text-sm leading-snug cursor-pointer hover:text-violet-300 transition-colors line-clamp-1"
                onClick={() => setDetailOpen(true)}
              >
                {resource.title}
              </h3>
              <p className="text-[#6e7681] text-xs leading-relaxed line-clamp-1 mt-0.5 hidden sm:block">
                {resource.description}
              </p>
            </div>
            <span className={`tag shrink-0 ${resource.type === "free" ? "tag-free" : "tag-premium"} text-[10px]`}>
              {resource.type === "free" ? "Gratis" : "Premium"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Tags */}
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              {resource.tags.slice(0, 2).map((tag) => (
                <span key={tag} className={`tag tag-${tag} text-[10px] shrink-0`}>{tag}</span>
              ))}
            </div>

            {/* Stats + actions */}
            <div className="flex items-center gap-3 shrink-0 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1">
                <Star size={10} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                {resource.stars}
              </span>
              <button
                type="button"
                onClick={handleSave}
                aria-label={saved ? "Quitar de guardados" : "Guardar"}
                aria-pressed={saved}
                className={`flex items-center gap-1 transition-colors ${saved ? "text-pink-400" : "hover:text-pink-400"}`}
              >
                <Heart size={10} className={saved ? "fill-pink-400" : ""} aria-hidden="true" />
                {formatNumber(saveCount)}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Descargar"
                className="hidden sm:flex items-center gap-1 hover:text-violet-400 transition-colors"
              >
                <Download size={10} aria-hidden="true" />
                {formatNumber(resource.downloads)}
              </button>
              {/* Author */}
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-[#30363d]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                  {resource.author.avatar}
                </div>
                <span className="text-[#8b949e] text-xs truncate max-w-[80px] flex items-center gap-1">
                  {resource.author.name}
                  {resource.author.verified && <CheckCircle size={9} className="text-violet-400 shrink-0" />}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {detailOpen && (
        <ResourceDetailModal
          resource={resource}
          saved={saved}
          saveCount={saveCount}
          onClose={() => setDetailOpen(false)}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExploreSection() {
  const [activeFilter,  setActiveFilter]  = useState("Todos");
  const [activeSort,    setActiveSort]    = useState("Trending");
  const [view,          setView]          = useState<"grid" | "list">("grid");
  const [page,          setPage]          = useState(1);
  const [searchInput,   setSearchInput]   = useState("");   // raw input (instant)
  const [searchText,    setSearchText]    = useState("");   // debounced (filtered)
  const [highlightId,   setHighlightId]   = useState<string | null>(null);

  // Advanced filters
  const [showFilters,   setShowFilters]   = useState(false);
  const [minStars,      setMinStars]      = useState(0);
  const [onlyVerified,  setOnlyVerified]  = useState(false);

  // Debounce search — wait 300 ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Map resource id → DOM ref for scrolling
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Listen for category filter (from Categories component) ──────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const filter = (e as CustomEvent<string>).detail;
      if (filters.includes(filter)) {
        setActiveFilter(filter);
        setSearchText("");
        setPage(1);
      }
    };
    window.addEventListener("ch:category-filter", handler);
    return () => window.removeEventListener("ch:category-filter", handler);
  }, []);

  // ── Listen for search events (from SearchModal) ─────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { query, resourceId } = (e as CustomEvent<{ query?: string; resourceId?: string }>).detail;

      if (resourceId) {
        // Jump to specific resource
        setActiveFilter("Todos");
        setSearchText("");
        setPage(Math.ceil(resources.length / ITEMS_PER_PAGE)); // show all
        setHighlightId(resourceId);

        setTimeout(() => {
          const el = cardRefs.current[resourceId];
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: "smooth" });
          }
          // Clear highlight after animation
          setTimeout(() => setHighlightId(null), 2500);
        }, 120);

      } else if (query !== undefined) {
        // Text search
        setSearchInput(query);
        setSearchText(query);
        setActiveFilter("Todos");
        setPage(1);
        // Scroll to section
        const el = document.getElementById("explore");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      }
    };
    window.addEventListener("ch:search", handler);
    return () => window.removeEventListener("ch:search", handler);
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = filterByCategory(resources, activeFilter);
    list = filterByText(list, searchText);
    if (minStars > 0)    list = list.filter((r) => r.stars >= minStars);
    if (onlyVerified)    list = list.filter((r) => r.author.verified);
    return sortResources(list, activeSort);
  }, [activeFilter, activeSort, searchText, minStars, onlyVerified]);

  const visible = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = visible.length < filtered.length;

  const activeAdvancedCount = (minStars > 0 ? 1 : 0) + (onlyVerified ? 1 : 0);

  function handleFilter(f: string) {
    setActiveFilter(f);
    setSearchText("");
    setPage(1);
  }

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchText("");
    setPage(1);
  }, []);

  function resetAdvanced() {
    setMinStars(0);
    setOnlyVerified(false);
    setShowFilters(false);
  }

  // ── Subtitle text ───────────────────────────────────────────────────────────
  const subtitle = searchText
    ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${searchText}"`
    : activeFilter !== "Todos"
    ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} en "${activeFilter}"`
    : `${resources.length}+ recursos curados por la comunidad`;

  return (
    <section id="explore" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1.5">
              Explorar <span className="gradient-text-pp">Recursos</span>
            </h2>
            <p className="text-[#8b949e] text-sm">
              <span className="text-violet-400 font-semibold">{filtered.length}</span>{" "}
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeSort}
              onChange={(e) => { setActiveSort(e.target.value); setPage(1); }}
              className="bg-[#161b22] border border-[#30363d] text-[#8b949e] text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {sorts.map((s) => <option key={s}>{s}</option>)}
            </select>

            <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 gap-0.5">
              <button
                type="button"
                aria-label="Vista cuadrícula"
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-all duration-200 ${view === "grid" ? "bg-violet-600/25 text-violet-400" : "text-[#6e7681] hover:text-white"}`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                type="button"
                aria-label="Vista lista"
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-all duration-200 ${view === "list" ? "bg-violet-600/25 text-violet-400" : "text-[#6e7681] hover:text-white"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline search bar ──────────────────────────────────────────────── */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7681] pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Busca dentro de los recursos..."
            aria-label="Buscar recursos"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#6e7681] outline-none focus:border-violet-500/50 transition-colors"
          />
          {searchText && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Active search banner ────────────────────────────────────────────── */}
        {searchText && (
          <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-violet-600/10 border border-violet-500/20 rounded-xl">
            <Search size={13} className="text-violet-400 shrink-0" />
            <span className="text-sm text-violet-300 flex-1">
              Mostrando resultados para <strong>"{searchText}"</strong>
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-xs text-violet-400 hover:text-violet-300 hover:underline shrink-0"
            >
              Limpiar
            </button>
          </div>
        )}

        {/* ── Filter chips ────────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {filters.map((f) => {
            const count = filterByText(filterByCategory(resources, f), searchText).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => handleFilter(f)}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border transition-all duration-200 font-medium ${
                  activeFilter === f
                    ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-violet-500/25 hover:text-white"
                }`}
              >
                {f}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors duration-200 ${
                  activeFilter === f
                    ? "bg-violet-500/25 text-violet-300"
                    : "bg-[#30363d] text-[#6e7681] group-hover:bg-violet-500/10 group-hover:text-[#8b949e]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border transition-all duration-200 font-medium ${
              showFilters || activeAdvancedCount > 0
                ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-violet-500/25 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={12} />
            Filtros
            {activeAdvancedCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/25 text-violet-300 rounded-full">
                {activeAdvancedCount}
              </span>
            )}
            <ChevronDown
              size={11}
              className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── Advanced filter panel ────────────────────────────────────────────── */}
        {showFilters && (
          <div className="mb-6 p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-wrap gap-5 items-end">

            {/* Min stars */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold">Valoración mínima</p>
              <div className="flex gap-1.5">
                {[
                  { label: "Todos",  value: 0   },
                  { label: "4.0+",   value: 4.0 },
                  { label: "4.5+",   value: 4.5 },
                  { label: "4.8+",   value: 4.8 },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setMinStars(value); setPage(1); }}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all duration-150 font-medium ${
                      minStars === value
                        ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-300"
                        : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-yellow-500/30 hover:text-yellow-400"
                    }`}
                  >
                    {value > 0 && <Star size={9} className="text-yellow-400 fill-yellow-400" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified toggle */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold">Autores</p>
              <button
                type="button"
                onClick={() => { setOnlyVerified((v) => !v); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 font-medium ${
                  onlyVerified
                    ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                    : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-violet-500/30 hover:text-violet-400"
                }`}
              >
                <CheckCircle size={11} className={onlyVerified ? "text-violet-400" : "text-[#6e7681]"} />
                Solo verificados
              </button>
            </div>

            {/* Reset */}
            {activeAdvancedCount > 0 && (
              <button
                type="button"
                onClick={resetAdvanced}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all duration-150 ml-auto"
              >
                <X size={11} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <SearchX size={40} className="text-[#30363d]" />
            <p className="text-[#8b949e] text-base font-medium">
              {searchText
                ? <>Sin resultados para <span className="text-white">"{searchText}"</span></>
                : <>No hay recursos para <span className="text-white">"{activeFilter}"</span></>
              }
            </p>
            <button
              type="button"
              onClick={() => { handleFilter("Todos"); clearSearch(); resetAdvanced(); }}
              className="px-5 py-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-600/10 transition-all duration-200"
            >
              Ver todos los recursos
            </button>
          </div>
        )}

        {/* ── Grid / List ─────────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          view === "grid" ? (
            <div
              key={`${activeFilter}-${searchText}-${activeSort}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {visible.map((resource, i) => (
                <div
                  key={resource.id}
                  ref={(el) => { cardRefs.current[resource.id] = el; }}
                  className={`card-enter ${i < 9 ? `card-enter-delay-${(i % 9) + 1}` : ""} transition-all duration-500 ${
                    highlightId === resource.id
                      ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0d1117] rounded-2xl scale-[1.02]"
                      : ""
                  }`}
                >
                  <ResourceCard resource={resource} />
                </div>
              ))}
            </div>
          ) : (
            <div
              key={`list-${activeFilter}-${searchText}-${activeSort}`}
              className="flex flex-col gap-3"
            >
              {visible.map((resource, i) => (
                <div
                  key={resource.id}
                  ref={(el) => { cardRefs.current[resource.id] = el; }}
                  className={`card-enter ${i < 9 ? `card-enter-delay-${(i % 9) + 1}` : ""} transition-all duration-500 ${
                    highlightId === resource.id
                      ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0d1117] rounded-xl scale-[1.01]"
                      : ""
                  }`}
                >
                  <ResourceListCard resource={resource} />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Load more ───────────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="flex flex-col items-center mt-10 gap-3">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 bg-[#161b22] border border-[#30363d] text-[#8b949e] text-sm font-semibold rounded-xl hover:border-violet-500/40 hover:text-white hover:bg-[#1c2128] transition-all duration-300"
              >
                Cargar más recursos ({filtered.length - visible.length} restantes)
              </button>
            ) : (
              <p className="text-xs text-[#6e7681]">
                ✓ Mostrando todos los recursos ({filtered.length})
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
