import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Zap, Sparkles, Sun, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function SolarEcoFeature({ className }: { className?: string }) {
  const panelRef = useRef<SVGSVGElement>(null);
  const sunRayRef = useRef<SVGGElement>(null);
  const energyFlowRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Shimmer sweep across solar panel surface
      if (sunRayRef.current) {
        gsap.to(sunRayRef.current, {
          x: 60,
          y: -20,
          opacity: 0.9,
          duration: 2.4,
          repeat: -1,
          repeatDelay: 1.2,
          ease: "power2.inOut",
        });
      }

      // 2. Animated green-gold energy pulse flow
      if (energyFlowRef.current) {
        gsap.to(energyFlowRef.current, {
          strokeDashoffset: -40,
          duration: 2,
          repeat: -1,
          ease: "none",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── 1. SOLAR-POWERED & AUTONOMOUS CALLOUT WITH REALISTIC SOLAR PANELS ── */}
      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1E2317]/85 border border-[#FAF0E2]/15 shadow-xl max-w-md group hover:border-[#AA8B63]/60 transition-all duration-300">
        {/* Animated Solar Panel Graphic */}
        <div className="relative h-16 w-20 rounded-xl bg-[#12140D] border border-[#AA8B63]/40 overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-1">
          {/* Ambient sunlight glow behind panel */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1B3B2B]/30 via-transparent to-[#AA8B63]/25" />

          <svg
            ref={panelRef}
            viewBox="0 0 80 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              {/* Monocrystalline Solar Cell Dark Gradient */}
              <linearGradient id="solarCellGrad" x1="0" y1="0" x2="80" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E2A38" />
                <stop offset="0.5" stopColor="#101820" />
                <stop offset="1" stopColor="#0B1015" />
              </linearGradient>
              {/* Gold Aluminum Frame Gradient */}
              <linearGradient id="panelFrameGrad" x1="0" y1="0" x2="80" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF0E2" />
                <stop offset="0.5" stopColor="#C4A67E" />
                <stop offset="1" stopColor="#AA8B63" />
              </linearGradient>
              {/* Photon Sunlight Shimmer */}
              <linearGradient id="sunbeamShimmer" x1="0" y1="0" x2="30" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF" stopOpacity="0" />
                <stop offset="0.5" stopColor="#FAF0E2" stopOpacity="0.75" />
                <stop offset="1" stopColor="#AA8B63" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Aluminum Outer Panel Frame */}
            <rect
              x="3"
              y="5"
              width="74"
              height="54"
              rx="3"
              fill="url(#solarCellGrad)"
              stroke="url(#panelFrameGrad)"
              strokeWidth="1.8"
            />

            {/* 6 High-Efficiency Photovoltaic Solar Wafer Cells (2 rows x 3 cols) */}
            {/* Top Row Cells */}
            <rect x="6" y="8" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />
            <rect x="30" y="8" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />
            <rect x="54" y="8" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />
            {/* Bottom Row Cells */}
            <rect x="6" y="33" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />
            <rect x="30" y="33" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />
            <rect x="54" y="33" width="20" height="23" rx="1" fill="#131D28" stroke="#3A4A5C" strokeWidth="0.8" />

            {/* Fine Photovoltaic Busbar Grid Lines */}
            <line x1="6" y1="16" x2="74" y2="16" stroke="#4B5E75" strokeWidth="0.6" strokeDasharray="1 1" opacity="0.8" />
            <line x1="6" y1="23" x2="74" y2="23" stroke="#4B5E75" strokeWidth="0.6" strokeDasharray="1 1" opacity="0.8" />
            <line x1="6" y1="41" x2="74" y2="41" stroke="#4B5E75" strokeWidth="0.6" strokeDasharray="1 1" opacity="0.8" />
            <line x1="6" y1="48" x2="74" y2="48" stroke="#4B5E75" strokeWidth="0.6" strokeDasharray="1 1" opacity="0.8" />

            {/* Silver Conductor Ribbons */}
            <line x1="16" y1="8" x2="16" y2="56" stroke="#AA8B63" strokeWidth="0.8" opacity="0.75" />
            <line x1="40" y1="8" x2="40" y2="56" stroke="#AA8B63" strokeWidth="0.8" opacity="0.75" />
            <line x1="64" y1="8" x2="64" y2="56" stroke="#AA8B63" strokeWidth="0.8" opacity="0.75" />

            {/* GSAP Moving Sunlight Reflection / Photon Sweep */}
            <g ref={sunRayRef} transform="translate(-40, 0)">
              <polygon points="0,0 20,0 35,64 15,64" fill="url(#sunbeamShimmer)" opacity="0.55" />
            </g>

            {/* Corner Sun Flare Badge */}
            <circle cx="70" cy="10" r="2.5" fill="#FAF0E2" />
            <circle cx="70" cy="10" r="5" stroke="#AA8B63" strokeWidth="0.8" opacity="0.6" />

            {/* Energy Discharge Cable Arc at bottom */}
            <path
              ref={energyFlowRef}
              d="M10 59 Q40 63 70 59"
              stroke="#34D399"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.9"
            />
          </svg>

          {/* Micro Solar Badge indicator */}
          <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/60 border border-[#AA8B63]/40 text-[7px] font-mono text-[#FAF0E2] flex items-center gap-0.5">
            <Sun className="h-2 w-2 text-[#AA8B63]" />
            <span>SOLAR</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-xs flex-1 min-w-0">
          <div className="font-display font-bold text-[#FAF0E2] flex items-center justify-between gap-1.5">
            <span className="truncate">100% Solar-Powered</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9.5px] font-mono font-bold text-emerald-300">
                <Leaf className="h-2.5 w-2.5 text-emerald-400 fill-emerald-400/40" />
                <span>Eco</span>
              </span>
              <Zap className="h-3 w-3 text-[#AA8B63] fill-[#AA8B63]" />
            </div>
          </div>
          <p className="text-[11px] text-[#A4AA93] mt-0.5 leading-snug">
            Zero electrical or water hookups required from your home. Completely self-contained luxury.
          </p>
        </div>
      </div>
    </div>
  );
}
