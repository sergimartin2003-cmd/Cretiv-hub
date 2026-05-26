import { Zap, GitFork, MessageCircle, PlayCircle, Camera, Heart } from "lucide-react";

const footerLinks = {
  Plataforma: ["Explorar", "Colecciones", "Trending", "Herramientas", "API"],
  Comunidad:  ["Discord", "Twitter", "Foro", "Blog", "Newsletter"],
  Recursos:   ["Tutoriales", "Documentación", "Changelog", "Roadmap", "Status"],
  Legal:      ["Términos", "Privacidad", "Cookies", "Licencias", "Contacto"],
};

const currentYear = new Date().getFullYear();

export default function Footer() {
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
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="p-2 bg-[#161b22] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white hover:border-violet-500/50 hover:bg-[#1c2128] transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[#8b949e] text-sm hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
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
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
