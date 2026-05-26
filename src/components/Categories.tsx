"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Explorar por <span className="gradient-text-pp">Categoría</span>
            </h2>
            <p className="text-[#8b949e]">+12 categorías con miles de recursos curados</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-violet-500/50 transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-violet-500/50 transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#explore`}
              className={`flex-none flex flex-col items-center justify-center gap-3 w-36 h-36 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <div className="text-center">
                <div className="text-xs font-semibold text-white/90 leading-tight">{cat.label}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{formatNumber(cat.count)}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
