"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { label: "Video",     icon: "🎬", filter: "Video",     count: 1240 },
  { label: "Audio",     icon: "🎵", filter: "Audio",     count: 890  },
  { label: "Foto",      icon: "📷", filter: "Foto",      count: 670  },
  { label: "Diseño",    icon: "🎨", filter: "Diseño",    count: 530  },
  { label: "IA",        icon: "🤖", filter: "IA",        count: 420  },
  { label: "Templates", icon: "📋", filter: "Templates", count: 310  },
  { label: "Motion",    icon: "✨", filter: "Video",     count: 280  },
  { label: "LUTs",      icon: "🎞️", filter: "Video",     count: 195  },
  { label: "Fuentes",   icon: "🔤", filter: "Diseño",    count: 160  },
  { label: "Overlays",  icon: "🌟", filter: "Video",     count: 145  },
];

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const handleCategoryClick = (filter: string) => {
    // Dispatch custom event so ExploreSection can pick it up
    window.dispatchEvent(new CustomEvent("ch:category-filter", { detail: filter }));

    // Smooth scroll to explore section
    const exploreEl = document.getElementById("explore");
    if (exploreEl) {
      const offset = 80; // navbar height
      const top = exploreEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Categorías</h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Desplazar izquierda"
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-violet-500/40 transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Desplazar derecha"
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-violet-500/40 transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              aria-label={`Ver categoría ${cat.label} — ${cat.count.toLocaleString()} recursos`}
              onClick={() => handleCategoryClick(cat.filter)}
              className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-violet-500/40 hover:bg-[#1c2128] transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="text-xs font-semibold text-[#8b949e] group-hover:text-white transition-colors duration-200 whitespace-nowrap">
                {cat.label}
              </span>
              <span className="text-[10px] text-[#6e7681]">{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
