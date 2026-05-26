"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, Grid3x3, List, SearchX } from "lucide-react";
import { resources, Resource } from "@/lib/data";
import ResourceCard from "./ResourceCard";

const filters = ["Todos", "Video", "Audio", "Foto", "Diseño", "IA", "Templates", "Gratis", "Premium"];
const sorts = ["Trending", "Recientes", "Mejor valorados", "Más guardados"];

const ITEMS_PER_PAGE = 6;

function filterResources(list: Resource[], filter: string): Resource[] {
  if (filter === "Todos") return list;
  if (filter === "Gratis")    return list.filter((r) => r.type === "free");
  if (filter === "Premium")   return list.filter((r) => r.type === "premium");

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
    (r) =>
      r.tags.some((t) => keys.includes(t)) ||
      keys.includes(r.category)
  );
}

function sortResources(list: Resource[], sort: string): Resource[] {
  const copy = [...list];
  if (sort === "Mejor valorados") return copy.sort((a, b) => b.stars - a.stars);
  if (sort === "Más guardados")   return copy.sort((a, b) => b.saves - a.saves);
  if (sort === "Recientes")       return copy.sort((a, b) => Number(b.id) - Number(a.id));
  // Trending — por descargas
  return copy.sort((a, b) => b.downloads - a.downloads);
}

export default function ExploreSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeSort, setActiveSort]     = useState("Trending");
  const [view, setView]                 = useState<"grid" | "list">("grid");
  const [page, setPage]                 = useState(1);

  const filtered = useMemo(
    () => sortResources(filterResources(resources, activeFilter), activeSort),
    [activeFilter, activeSort]
  );

  const visible  = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore  = visible.length < filtered.length;

  function handleFilter(f: string) {
    setActiveFilter(f);
    setPage(1);
  }

  function handleSort(s: string) {
    setActiveSort(s);
    setPage(1);
  }

  return (
    <section id="explore" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1.5">
              Explorar <span className="gradient-text-pp">Recursos</span>
            </h2>
            <p className="text-[#8b949e] text-sm">
              <span className="text-violet-400 font-semibold">{filtered.length}</span>{" "}
              {filtered.length === resources.length
                ? `recursos curados por la comunidad`
                : `resultados para "${activeFilter}"`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={activeSort}
              onChange={(e) => handleSort(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] text-[#8b949e] text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {sorts.map((s) => <option key={s}>{s}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 gap-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  view === "grid" ? "bg-violet-600/25 text-violet-400" : "text-[#6e7681] hover:text-white"
                }`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  view === "list" ? "bg-violet-600/25 text-violet-400" : "text-[#6e7681] hover:text-white"
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {filters.map((f) => {
            const count = filterResources(resources, f).length;
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border transition-all duration-200 font-medium ${
                  activeFilter === f
                    ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-violet-500/25 hover:text-white"
                }`}
              >
                {f}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors duration-200 ${
                    activeFilter === f
                      ? "bg-violet-500/25 text-violet-300"
                      : "bg-[#30363d] text-[#6e7681] group-hover:bg-violet-500/10 group-hover:text-[#8b949e]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-violet-500/25 hover:text-white transition-all duration-200">
            <SlidersHorizontal size={12} />
            Filtros
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <SearchX size={40} className="text-[#30363d]" />
            <p className="text-[#8b949e] text-base font-medium">
              No hay recursos para <span className="text-white">"{activeFilter}"</span>
            </p>
            <button
              onClick={() => handleFilter("Todos")}
              className="px-5 py-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-600/10 transition-all duration-200"
            >
              Ver todos los recursos
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {visible.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        {/* Load more / all loaded */}
        {filtered.length > 0 && (
          <div className="flex flex-col items-center mt-10 gap-3">
            {hasMore ? (
              <button
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
