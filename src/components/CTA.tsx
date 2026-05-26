import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

const perks = [
  "Sin tarjeta de crédito",
  "Acceso instantáneo",
  "Cancela cuando quieras",
];

export default function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="gradient-border overflow-hidden">
          <div className="relative bg-[#161b22] rounded-2xl p-10 md:p-16 text-center overflow-hidden">
            {/* Bg effects */}
            <div className="absolute inset-0 dot-pattern opacity-30" />
            <div className="orb w-72 h-72 bg-violet-600 top-0 left-1/2 -translate-x-1/2" />
            <div className="orb w-48 h-48 bg-pink-600 bottom-0 right-0 translate-x-1/4 translate-y-1/4" />
            <div className="orb w-36 h-36 bg-cyan-600 bottom-0 left-0 -translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-violet-300 mb-6">
                <Sparkles size={13} />
                Únete a +58,000 creadores
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                ¿Listo para llevar tu contenido
                <br />
                al <span className="gradient-text">siguiente nivel</span>?
              </h2>

              <p className="text-[#8b949e] text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Accede a miles de recursos premium, herramientas de IA
                y la comunidad de creadores más activa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button className="btn-gradient inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.4)] text-base">
                  <Sparkles size={17} />
                  Empezar gratis ahora
                  <ArrowRight size={17} />
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-[#0d1117] border border-[#30363d] rounded-xl hover:border-violet-500/40 hover:bg-[#1c2128] transition-all duration-300 text-base">
                  Ver todos los planes
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {perks.map((perk) => (
                  <span key={perk} className="flex items-center gap-1.5 text-sm text-[#6e7681]">
                    <CheckCircle size={13} className="text-green-400" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
