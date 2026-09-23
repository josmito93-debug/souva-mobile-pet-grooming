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
            {"// OUR CRAFT & PHILOSOPHY // ABOUT SOUVA"}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2]">
            About SOUVA
          </h2>
          <p className="mt-3 text-[#E2D7C5] text-sm md:text-base leading-relaxed">
            Elevating canine wellness across San Francisco and the Peninsula through personalized 1-on-1 care, whisper-quiet solar mobile salons, and luxury botanical spa cosmetics.
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
                Zero Emissions · Whisper Quiet Salon
              </p>
            </div>
          </div>

          {/* Right Column: Mission and Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63] block mb-1">
                Compassionate, Stress-Free Care
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF0E2]">
                A Private, Sanctuary-Grade Mobile Spa at Your Doorstep
              </h3>
              <p className="mt-3 text-sm text-[#A4AA93] leading-relaxed">
                At SOUVA, we believe grooming should be a calming sanctuary of wellness, never a source of anxiety. We have eliminated noisy cage dryers, crowded salon floors, and stressful car rides. Our autonomous solar van arrives directly outside your home as an exclusive private suite, where your pet enjoys 100% undivided attention from certified master stylists.
              </p>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Heart className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  1-on-1 Cage-Free Sanctuary
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  We never crate or mix pets. Every appointment is completely private with gentle hand-drying and zero stress.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Zap className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  100% Solar Autonomy
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  No electrical cords or water hookups needed from your residence. Our battery architecture is completely self-sufficient.
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
                      alt="Hydra by Pet Society - Official Luxury Shampoo Partner"
                      className="h-7 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    />
                    <span className="text-[10px] font-mono font-bold text-[#FAF0E2] tracking-wide">HYDRA®</span>
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Hydra® Botanical Cosmetics
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  Colloidal oat shampoos, blueberry facial masks, and silk conditioners free of harsh parabens, crafted by Hydra® Pet Society.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/10">
                <div className="h-8 w-8 rounded-xl bg-[#252A1C] text-[#AA8B63] flex items-center justify-center mb-2">
                  <Award className="h-4 w-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Master Pet Stylists
                </h4>
                <p className="text-[11px] text-[#A4AA93] mt-1 leading-relaxed">
                  Specialized in precision hand-scissor styling, breed standards, Asian Fusion sculpting, and gentle senior pet care.
                </p>
              </div>
            </div>

            {/* Special 2 Dogs Promo Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#202518] to-[#1C1F15] border border-[#AA8B63]/40 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AA8B63] block">
                  Exclusive Multi-Dog Offer
                </span>
                <span className="font-display font-bold text-sm text-[#FAF0E2]">
                  Have 2 dogs? Enjoy an automatic 20% discount on your second dog's service
                </span>
              </div>
              <button
                type="button"
                onClick={onBookClick}
                className="px-4 py-2 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#C4A67E] transition-colors cursor-pointer shrink-0"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
