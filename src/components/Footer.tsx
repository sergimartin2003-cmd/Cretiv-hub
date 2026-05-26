"use client";

import { Zap, GitFork, MessageCircle, PlayCircle, Camera, Heart } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type FooterLink = { label: string; href?: string; section?: string };

const footerLinks: Record<string, FooterLink[]> = {
  Plataforma: [
    { label: "Explorar",    section: "explore"     },
    { label: "Colecciones", section: "collections" },
    { label: "Trending",    section: "trending"    },
    { label: "Herramientas" },
    { label: "API"          },
  ],
  Comunidad: [
    { label: "Discord"    },
    { label: "Twitter"    },
    { label: "Foro"       },
    { label: "Blog"       },
    { label: "Newsletter", section: "trending" },
  ],
  Recursos: [
    { label: "Tutoriales",    section: "explore" },
    { label: "Documentación" },
    { label: "Changelog"     },
    { label: "Roadmap"       },
    { label: "Status"        },
  ],
  Legal: [
    { label: "Términos"  },
    { label: "Privacidad"},
    { label: "Cookies"   },
    { label: "Licencias" },
    { label: "Contacto"  },
  ],
};

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { info } = useToast();

  function handleLink(link: FooterLink) {
    if (link.section) {
      const el = document.getElementById(link.section);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else {
      info("Próximamente", `La sección "${link.label}" estará disponible en breve.`);
    }
  }

  return (
    <footer className="border-t border-[#30363d] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Cretiv<span className="gradient-text-pp">Hub</span>
              </span>
            </div>
            <p className="text-[#6e7681] text-sm leading-relaxed mb-6 max-w-xs">
              La plataforma definitiva de recursos para creadores de contenido.
              Todo lo que necesitas, en un solo lugar.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: GitFork,       label: "GitHub"    },
                { Icon: MessageCircle, label: "Twitter"   },
                { Icon: PlayCircle,    label: "YouTube"   },
                { Icon: Camera,        label: "Instagram" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => info(label, "Síguenos pronto en nuestras redes sociales 🚀")}
                  className="p-2 bg-[#161b22] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white hover:border-violet-500/50 hover:bg-[#1c2128] transition-all duration-200"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => handleLink(link)}
                      className="text-[#8b949e] text-sm hover:text-white transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6e7681] text-sm flex items-center gap-1.5">
            © {currentYear} CretivHub. Hecho con{" "}
            <Heart size={12} className="text-pink-500 fill-pink-500" /> para creadores.
          </p>
          <div className="flex items-center gap-4 text-sm text-[#6e7681]">
            {["Términos", "Privacidad", "Cookies"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => info(label, "Disponible próximamente en cretivhub.dev")}
                className="hover:text-white transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
