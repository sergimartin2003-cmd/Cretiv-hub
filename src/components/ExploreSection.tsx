"use client";

import { useState } from "react";
import { SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { resources } from "@/lib/data";
import ResourceCard from "./ResourceCard";

const filters = ["Todos", "Video", "Audio", "Foto", "Diseño", "IA", "Templates", "Gratis", "Premium"];
const sorts = ["Trending", "Recientes", "Mejor valorados", "Más guardados"];

export default function ExploreSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeSort, setActiveSort] = useState("Trending");
  const [view, setView] = useState<"grid" | "list">("grid");

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
              {resources.length.toLocaleString()}+ recursos curados por la comunidad
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] text-[#8b949e] text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {sorts.map((s) => <option key={s}>{s}</option>)}
            </select>
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
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 text-sm rounded-full border transition-all duration-200 font-medium ${
                activeFilter === f
                  ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                  : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-violet-500/25 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-violet-500/25 hover:text-white transition-all duration-200">
            <SlidersHorizontal size={12} />
            Filtros
          </button>
        </div>

        {/* Grid */}
        <div className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            : "flex flex-col gap-4"
        }>
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-[#161b22] border border-[#30363d] text-[#8b949e] text-sm font-semibold rounded-xl hover:border-violet-500/40 hover:text-white hover:bg-[#1c2128] transition-all duration-300">
            Cargar más recursos
          </button>
        </div>
      </div>
    </section>
  );
}
