import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Zap, Sparkles, Sun, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function SolarEcoFeature({ className }: { className?: string }) {
  const panelRef = useRef<SVGSVGElement>(null);
  const sunRayRef = useRef<SVGGElement>(null);
  const energyFlowRef = useRef<SVGPathElement>(null);
  const glowLightRef = useRef<HTMLDivElement>(null);
  const leafGlowRef = useRef<SVGGElement>(null);

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

      // 3. Glowing eco badge ambient breathing light
      if (glowLightRef.current) {
        gsap.to(glowLightRef.current, {
          boxShadow: "0 0 24px rgba(52, 211, 153, 0.45), 0 0 45px rgba(170, 139, 99, 0.3)",
          scale: 1.02,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 4. Eco Leaf pulsating illumination
      if (leafGlowRef.current) {
        gsap.to(leafGlowRef.current, {
          scale: 1.15,
          transformOrigin: "center center",
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
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
          <div className="font-display font-bold text-[#FAF0E2] flex items-center gap-1.5">
            <span className="truncate">100% Solar-Powered & Autonomous</span>
            <Zap className="h-3 w-3 text-[#AA8B63] fill-[#AA8B63] shrink-0" />
          </div>
          <p className="text-[11px] text-[#A4AA93] mt-0.5 leading-snug">
            Zero electrical or water hookups required from your home. Completely self-contained luxury.
          </p>
        </div>
      </div>

      {/* ── 2. "WE ARE AN ECO-FRIENDLY COMPANY" GLOWING ANIMATED BADGE ── */}
      <div
        ref={glowLightRef}
        className="p-3 rounded-2xl bg-gradient-to-r from-[#17251B] via-[#1C2317] to-[#1E2015] border border-emerald-500/40 max-w-md shadow-[0_0_20px_rgba(52,211,153,0.2)] flex items-center justify-between gap-3 select-none"
      >
        <div className="flex items-center gap-3">
          {/* Animated Glowing Leaf & Solar Earth Icon */}
          <div className="relative h-10 w-10 rounded-xl bg-[#142318] border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(52,211,153,0.4)]">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 overflow-visible"
            >
              <defs>
                <radialGradient id="leafGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop stopColor="#34D399" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Radiant Light Halo */}
              <circle cx="18" cy="18" r="14" fill="url(#leafGlowGrad)" />

              {/* Concentric Eco Orbit */}
              <circle cx="18" cy="18" r="13" stroke="#34D399" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

              {/* Glowing Leaf Sprout (GSAP Animated) */}
              <g ref={leafGlowRef} id="ecoLeaf">
                <path
                  d="M18 27C18 27 12 24 11 18C10 13 14 9 19 9C24 9 27 12 27 17C27 22 22 26 18 27Z"
                  fill="rgba(52, 211, 153, 0.25)"
                  stroke="#34D399"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                {/* Leaf Central Vein */}
                <path
                  d="M14 22C17 21 21 16 23 12"
                  stroke="#FAF0E2"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Secondary Vein */}
                <path
                  d="M18 19C20 19 22 17 23 15"
                  stroke="#34D399"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              </g>

              {/* Solar Sparkle Star */}
              <circle cx="26" cy="10" r="1.5" fill="#FAF0E2" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-[13px] text-[#FAF0E2] tracking-wide">
                We are an eco-friendly company
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-emerald-300/80 mt-0.5 leading-snug">
              100% solar fleet · Zero carbon idle · Biodegradable botanicals
            </p>
          </div>
        </div>

        {/* Certified Green Pill Badge */}
        <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-1 rounded-lg shrink-0 uppercase tracking-wider shadow-sm">
          Eco·Safe
        </span>
      </div>
    </div>
  );
}
