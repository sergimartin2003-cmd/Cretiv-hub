"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { SlidersHorizontal, Grid3x3, List, SearchX, X, Search } from "lucide-react";
import { resources, Resource } from "@/lib/data";
import ResourceCard from "./ResourceCard";

const filters = ["Todos", "Video", "Audio", "Foto", "Diseño", "IA", "Templates", "Gratis", "Premium"];
const sorts   = ["Trending", "Recientes", "Mejor valorados", "Más guardados"];

const ITEMS_PER_PAGE = 6;

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExploreSection() {
  const [activeFilter,  setActiveFilter]  = useState("Todos");
  const [activeSort,    setActiveSort]    = useState("Trending");
  const [view,          setView]          = useState<"grid" | "list">("grid");
  const [page,          setPage]          = useState(1);
  const [searchText,    setSearchText]    = useState("");
  const [highlightId,   setHighlightId]   = useState<string | null>(null);

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
    return sortResources(list, activeSort);
  }, [activeFilter, activeSort, searchText]);

  const visible = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = visible.length < filtered.length;

  function handleFilter(f: string) {
    setActiveFilter(f);
    setSearchText("");
    setPage(1);
  }

  function clearSearch() {
    setSearchText("");
    setPage(1);
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
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
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
        <div className="flex gap-2 flex-wrap mb-8">
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-violet-500/25 hover:text-white transition-all duration-200"
          >
            <SlidersHorizontal size={12} />
            Filtros
          </button>
        </div>

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
              onClick={() => { handleFilter("Todos"); clearSearch(); }}
              className="px-5 py-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-600/10 transition-all duration-200"
            >
              Ver todos los recursos
            </button>
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className={view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            : "flex flex-col gap-4"
          }>
            {visible.map((resource) => (
              <div
                key={resource.id}
                ref={(el) => { cardRefs.current[resource.id] = el; }}
                className={`transition-all duration-500 ${
                  highlightId === resource.id
                    ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0d1117] rounded-2xl scale-[1.02]"
                    : ""
                }`}
              >
                <ResourceCard resource={resource} />
              </div>
            ))}
          </div>
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
