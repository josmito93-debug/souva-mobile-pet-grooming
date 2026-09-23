import { Sparkles, ShieldCheck, Heart, Zap, Award, Check } from "lucide-react";

export function AboutSection({ onBookClick }: { onBookClick: () => void }) {
  return (
    <section id="about" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#171912] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#AA8B63]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
            {"// NUESTRA FILOSOFÍA & EQUIPO // ABOUT SOUVA"}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2]">
            Quiénes Somos
          </h2>
          <p className="mt-3 text-[#E2D7C5] text-sm md:text-base leading-relaxed">
            Elevando el cuidado canino en San Francisco y la Península mediante atención personalizada uno a uno, tecnología solar silenciosa y productos botánicos premium.
          </p>
        </div>

        {/* 2-Column Story Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-14">
          {/* Left Column: Image with Brand Badge */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 shadow-2xl bg-[#1E2217]">
              <img
                src="/assets/souva-uniforms.png"
                alt="SOUVA Master Groomer with Dog"
                className="w-full h-[380px] sm:h-[420px] object-cover"
              />
            </div>
            {/* Overlay floating badge */}
            <div className="absolute -bottom-5 -right-3 sm:right-4 bg-[#14160E]/95 border border-[#AA8B63] p-3.5 rounded-2xl shadow-xl backdrop-blur-md max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AA8B63]">
                  100% Eco-Solar
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#FAF0E2] leading-tight">
                Cero emisiones · Cero ruidos molestos
              </p>
            </div>
          </div>

          {/* Right Column: Mission and Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63] block mb-1">
                Cuidado Compasivo sin Estrés
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF0E2]">
                Una Experiencia Privada y Exclusiva en la Puerta de tu Hogar
              </h3>
              <p className="mt-3 text-sm text-[#A4AA93] leading-relaxed">
                En SOUVA creemos que el acicalado debe ser un momento de tranquilidad y bienestar, no de estrés. Despedimos las jaulas ruidosas, las esperas de horas y los traslados incómodos. Nuestra van solar llega a tu puerta como un spa móvil privado, donde tu mascota recibe el 100% de la atención de nuestros master groomers certificados.
              </p>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Heart className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  1 a 1 Libre de Estrés
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  Nunca mezclamos perros. Cada sesión es exclusiva, con secado manual suave y sin estrés en jaula.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Zap className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Autonomía Solar 100%
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  No necesitamos enchufes ni tomas de agua de tu casa. Nuestro equipo solar es autosuficiente y ecológico.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10 relative group">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-[#14160F] border border-[#AA8B63]/30 flex items-center gap-1.5 shadow-sm">
                    <img
                      src="/assets/shampoo-logo-white.png"
                      alt="Hydra by Pet Society - Marca Oficial de Shampoo"
                      className="h-7 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    />
                    <span className="text-[10px] font-mono font-bold text-[#FAF0E2] tracking-wide">HYDRA®</span>
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Cosmética Botánica Hydra®
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  Champús de avena coloidal, mascarillas y acondicionadores sin sulfatos ni químicos agresivos, formulados por Hydra® Pet Society.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Award className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Master Estilistas
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  Especialistas en cortes a tijera de alta precisión, estilos de raza, Asian Fusion y cuidado senior.
                </p>
              </div>
            </div>

            {/* Special 2 Dogs Promo Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#202518] to-[#1C1F15] border border-[#AA8B63]/40 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AA8B63] block">
                  Promoción Especial
                </span>
                <span className="font-display font-bold text-sm text-[#FAF0E2]">
                  ¿Tienes 2 perros? Aprovecha 20% de descuento en el segundo perro
                </span>
              </div>
              <button
                type="button"
                onClick={onBookClick}
                className="px-4 py-2 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#C4A67E] transition-colors cursor-pointer shrink-0"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
