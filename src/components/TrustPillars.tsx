import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function TrustPillars({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Individual Icon Refs for GSAP targeted animations
  const doorstepVanRef = useRef<SVGGElement>(null);
  const doorstepBeaconRef = useRef<SVGCircleElement>(null);
  const doorstepBeamRef = useRef<SVGPolygonElement>(null);
  const doorstepPathRef = useRef<SVGPathElement>(null);

  const cageDoorRef = useRef<SVGGElement>(null);
  const cagePawRef = useRef<SVGGElement>(null);
  const cageSparkle1Ref = useRef<SVGGElement>(null);
  const cageSparkle2Ref = useRef<SVGGElement>(null);
  const cageClockHandRef = useRef<SVGLineElement>(null);

  const careHeartRef = useRef<SVGGElement>(null);
  const careAuraRef = useRef<SVGCircleElement>(null);
  const careHandRef = useRef<SVGGElement>(null);
  const carePawRef = useRef<SVGGElement>(null);
  const careBubbleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use gsap.context for complete cleanup and scoped selectors
    const ctx = gsap.context(() => {
      /* ── 1. DOORSTEP SERVICE ANIMATIONS ─────────────────────── */
      if (doorstepBeaconRef.current) {
        gsap.to(doorstepBeaconRef.current, {
          scale: 2.2,
          opacity: 0,
          transformOrigin: "center center",
          duration: 1.8,
          repeat: -1,
          ease: "power2.out",
        });
      }

      if (doorstepVanRef.current) {
        gsap.to(doorstepVanRef.current, {
          x: 2.5,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (doorstepPathRef.current) {
        gsap.to(doorstepPathRef.current, {
          strokeDashoffset: -20,
          duration: 3,
          repeat: -1,
          ease: "none",
        });
      }

      /* ── 2. NO CAGES, NO WAITING ANIMATIONS ─────────────────── */
      if (cageDoorRef.current) {
        // Open door gentle sway
        gsap.to(cageDoorRef.current, {
          rotation: -12,
          transformOrigin: "12px 28px",
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (cagePawRef.current) {
        // Freedom paw floats out of the cage
        gsap.to(cagePawRef.current, {
          y: -3.5,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }

      if (cageSparkle1Ref.current && cageSparkle2Ref.current) {
        gsap.to([cageSparkle1Ref.current, cageSparkle2Ref.current], {
          scale: 1.35,
          opacity: 1,
          transformOrigin: "center center",
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          stagger: 0.4,
          ease: "sine.inOut",
        });
      }

      if (cageClockHandRef.current) {
        gsap.to(cageClockHandRef.current, {
          rotation: 360,
          transformOrigin: "35px 15px",
          duration: 6,
          repeat: -1,
          ease: "none",
        });
      }

      /* ── 3. PRIVATE ONE-ON-ONE CARE ANIMATIONS ──────────────── */
      if (careHeartRef.current) {
        // Realistic loving heartbeat rhythm
        const heartTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        heartTl
          .to(careHeartRef.current, { scale: 1.15, transformOrigin: "center center", duration: 0.16, ease: "power1.out" })
          .to(careHeartRef.current, { scale: 1.03, transformOrigin: "center center", duration: 0.14, ease: "power1.in" })
          .to(careHeartRef.current, { scale: 1.22, transformOrigin: "center center", duration: 0.18, ease: "power1.out" })
          .to(careHeartRef.current, { scale: 1.0, transformOrigin: "center center", duration: 0.35, ease: "elastic.out(1, 0.4)" });
      }

      if (careAuraRef.current) {
        gsap.to(careAuraRef.current, {
          scale: 1.5,
          opacity: 0,
          transformOrigin: "center center",
          duration: 2.2,
          repeat: -1,
          ease: "power2.out",
        });
      }

      if (carePawRef.current && careHandRef.current) {
        gsap.to(carePawRef.current, {
          y: -1.5,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (careBubbleRef.current) {
        gsap.to(careBubbleRef.current, {
          y: -4,
          opacity: 0.8,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Hover animations for Pillar 1 (Doorstep)
  const handleDoorstepEnter = () => {
    if (doorstepVanRef.current) {
      gsap.to(doorstepVanRef.current, { x: 5, scale: 1.06, duration: 0.35, ease: "back.out(2)" });
    }
    if (doorstepBeamRef.current) {
      gsap.to(doorstepBeamRef.current, { opacity: 0.9, duration: 0.25 });
    }
  };

  const handleDoorstepLeave = () => {
    if (doorstepVanRef.current) {
      gsap.to(doorstepVanRef.current, { x: 0, scale: 1, duration: 0.35, ease: "power2.out" });
    }
    if (doorstepBeamRef.current) {
      gsap.to(doorstepBeamRef.current, { opacity: 0.35, duration: 0.3 });
    }
  };

  // Hover animations for Pillar 2 (No Cages)
  const handleCageEnter = () => {
    if (cageDoorRef.current) {
      gsap.to(cageDoorRef.current, { rotation: -38, duration: 0.4, ease: "back.out(2.5)" });
    }
    if (cagePawRef.current) {
      gsap.to(cagePawRef.current, { scale: 1.25, y: -5, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleCageLeave = () => {
    if (cageDoorRef.current) {
      gsap.to(cageDoorRef.current, { rotation: 0, duration: 0.4, ease: "power2.out" });
    }
    if (cagePawRef.current) {
      gsap.to(cagePawRef.current, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  // Hover animations for Pillar 3 (One-on-One)
  const handleCareEnter = () => {
    if (careHeartRef.current) {
      gsap.to(careHeartRef.current, { scale: 1.3, duration: 0.3, ease: "back.out(3)" });
    }
    if (careAuraRef.current) {
      gsap.to(careAuraRef.current, { opacity: 0.8, scale: 1.8, duration: 0.4 });
    }
  };

  const handleCareLeave = () => {
    if (careHeartRef.current) {
      gsap.to(careHeartRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "pt-6 border-t border-[#FAF0E2]/15 grid grid-cols-1 sm:grid-cols-3 gap-3.5",
        className
      )}
    >
      {/* ── PILLAR 1: CONVENIENT DOORSTEP SERVICE ───────────────── */}
      <div
        onMouseEnter={handleDoorstepEnter}
        onMouseLeave={handleDoorstepLeave}
        className="group relative p-3 rounded-2xl bg-[#1A1D14]/90 border border-[#FAF0E2]/10 hover:border-[#AA8B63]/60 hover:bg-[#202518] transition-all duration-300 shadow-md cursor-pointer flex items-center gap-3 overflow-hidden select-none"
      >
        {/* Ambient background hover glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#AA8B63]/15 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Custom Animated SVG Icon */}
        <div className="relative h-12 w-12 rounded-xl bg-[#24291B] border border-[#AA8B63]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[0_0_15px_rgba(170,139,99,0.35)] transition-shadow">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 overflow-visible"
          >
            <defs>
              <linearGradient id="goldGrad1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF0E2" />
                <stop offset="0.5" stopColor="#C4A67E" />
                <stop offset="1" stopColor="#AA8B63" />
              </linearGradient>
              <linearGradient id="beamGrad" x1="28" y1="28" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF0E2" stopOpacity="0.8" />
                <stop offset="1" stopColor="#AA8B63" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* House Doorstep Silhouette */}
            <path
              d="M7 38V19L17 11L27 19V38H7Z"
              stroke="url(#goldGrad1)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="rgba(36, 41, 27, 0.6)"
            />
            {/* Arched Porch Doorway */}
            <path
              d="M13 38V25C13 22.8 14.8 21 17 21C19.2 21 21 22.8 21 25V38"
              stroke="#FAF0E2"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Welcome Mat / Doorstep Step */}
            <rect x="11" y="38" width="12" height="2.5" rx="1" fill="#AA8B63" />

            {/* GPS Beacon Pulse at Rooftop */}
            <circle
              ref={doorstepBeaconRef}
              cx="17"
              cy="9"
              r="3"
              stroke="#FAF0E2"
              strokeWidth="1.2"
              fill="none"
              opacity="0.8"
            />
            <circle cx="17" cy="9" r="2" fill="#AA8B63" />

            {/* Headlight Beam from Van */}
            <polygon
              ref={doorstepBeamRef}
              points="30,30 44,24 44,38 30,34"
              fill="url(#beamGrad)"
              opacity="0.35"
            />

            {/* Mobile Solar Van Arriving */}
            <g ref={doorstepVanRef} id="vanGroup">
              {/* Van Body */}
              <path
                d="M26 36V26H35L39 30V36H26Z"
                fill="#2C3222"
                stroke="url(#goldGrad1)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Windshield */}
              <path d="M34 27.5L37.5 30H34V27.5Z" fill="#FAF0E2" opacity="0.85" />
              {/* Solar Panel Badge on Van Roof */}
              <rect x="27" y="24" width="7" height="2" rx="0.5" fill="#AA8B63" />
              {/* Wheels */}
              <circle cx="29" cy="36" r="2.2" fill="#14160E" stroke="#FAF0E2" strokeWidth="1" />
              <circle cx="37" cy="36" r="2.2" fill="#14160E" stroke="#FAF0E2" strokeWidth="1" />
            </g>

            {/* Doorstep Path Line */}
            <path
              ref={doorstepPathRef}
              d="M5 42H43"
              stroke="#AA8B63"
              strokeWidth="1.4"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <div className="font-display font-bold text-xs sm:text-[13px] text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors truncate">
            Convenient Doorstep Service
          </div>
          <p className="text-[10px] text-[#A4AA93] mt-0.5 leading-snug">
            We park directly outside your door
          </p>
        </div>
      </div>

      {/* ── PILLAR 2: NO CAGES, NO WAITING ──────────────────────── */}
      <div
        onMouseEnter={handleCageEnter}
        onMouseLeave={handleCageLeave}
        className="group relative p-3 rounded-2xl bg-[#1A1D14]/90 border border-[#FAF0E2]/10 hover:border-[#AA8B63]/60 hover:bg-[#202518] transition-all duration-300 shadow-md cursor-pointer flex items-center gap-3 overflow-hidden select-none"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#AA8B63]/15 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Custom Animated SVG Icon */}
        <div className="relative h-12 w-12 rounded-xl bg-[#24291B] border border-[#AA8B63]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[0_0_15px_rgba(170,139,99,0.35)] transition-shadow">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 overflow-visible"
          >
            <defs>
              <linearGradient id="goldGrad2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF0E2" />
                <stop offset="0.5" stopColor="#C4A67E" />
                <stop offset="1" stopColor="#AA8B63" />
              </linearGradient>
            </defs>

            {/* Cage Dome Outline */}
            <path
              d="M10 20C10 14.5 14.5 10 20 10C25.5 10 30 14.5 30 20V38H10V20Z"
              stroke="#A4AA93"
              strokeWidth="1.5"
              opacity="0.4"
              fill="rgba(20,22,14,0.4)"
            />
            {/* Background Cage Bars */}
            <line x1="16" y1="12" x2="16" y2="38" stroke="#A4AA93" strokeWidth="1.2" opacity="0.3" />
            <line x1="24" y1="12" x2="24" y2="38" stroke="#A4AA93" strokeWidth="1.2" opacity="0.3" />

            {/* Cage Base */}
            <rect x="8" y="38" width="24" height="2.5" rx="1" fill="#AA8B63" opacity="0.75" />

            {/* SWINGING OPEN CAGE DOOR (Freedom representation) */}
            <g ref={cageDoorRef} id="cageDoor">
              {/* Door frame */}
              <rect
                x="12"
                y="18"
                width="14"
                height="19"
                rx="2"
                stroke="url(#goldGrad2)"
                strokeWidth="1.8"
                fill="rgba(36, 41, 27, 0.7)"
              />
              {/* Open door bars */}
              <line x1="16.5" y1="19" x2="16.5" y2="36" stroke="url(#goldGrad2)" strokeWidth="1.2" />
              <line x1="21.5" y1="19" x2="21.5" y2="36" stroke="url(#goldGrad2)" strokeWidth="1.2" />
              {/* Open Latch */}
              <circle cx="25" cy="27" r="1.5" fill="#FAF0E2" />
            </g>

            {/* HAPPY FREE DOG PAW FLOATING OUT */}
            <g ref={cagePawRef} id="freePaw">
              {/* Main Pad */}
              <path
                d="M20 28C18.5 28 17.5 29.5 18 31C18.5 32.5 21.5 32.5 22 31C22.5 29.5 21.5 28 20 28Z"
                fill="#FAF0E2"
              />
              {/* Toes */}
              <circle cx="17.5" cy="26" r="1.2" fill="#AA8B63" />
              <circle cx="20" cy="25" r="1.3" fill="#FAF0E2" />
              <circle cx="22.5" cy="26" r="1.2" fill="#AA8B63" />
            </g>

            {/* Radiating Freedom Sparkles */}
            <g ref={cageSparkle1Ref} transform="translate(26, 12)">
              <path
                d="M0 -3L0.8 -0.8L3 0L0.8 0.8L0 3L-0.8 0.8L-3 0L-0.8 -0.8Z"
                fill="#FAF0E2"
              />
            </g>
            <g ref={cageSparkle2Ref} transform="translate(6, 16)">
              <path
                d="M0 -2.5L0.6 -0.6L2.5 0L0.6 0.6L0 2.5L-0.6 0.6L-2.5 0L-0.6 -0.6Z"
                fill="#AA8B63"
              />
            </g>

            {/* Zero-Wait Clock Emblem */}
            <circle cx="35" cy="15" r="6.5" stroke="#AA8B63" strokeWidth="1.4" fill="#1B1E15" />
            <line
              ref={cageClockHandRef}
              x1="35"
              y1="15"
              x2="35"
              y2="11"
              stroke="#FAF0E2"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="35" cy="15" r="1" fill="#AA8B63" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <div className="font-display font-bold text-xs sm:text-[13px] text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors truncate">
            No Cages, No Waiting
          </div>
          <p className="text-[10px] text-[#A4AA93] mt-0.5 leading-snug">
            Zero cages · Zero salon anxiety
          </p>
        </div>
      </div>

      {/* ── PILLAR 3: PRIVATE ONE-ON-ONE CARE ───────────────────── */}
      <div
        onMouseEnter={handleCareEnter}
        onMouseLeave={handleCareLeave}
        className="group relative p-3 rounded-2xl bg-[#1A1D14]/90 border border-[#FAF0E2]/10 hover:border-[#AA8B63]/60 hover:bg-[#202518] transition-all duration-300 shadow-md cursor-pointer flex items-center gap-3 overflow-hidden select-none"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#AA8B63]/15 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Custom Animated SVG Icon */}
        <div className="relative h-12 w-12 rounded-xl bg-[#24291B] border border-[#AA8B63]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[0_0_15px_rgba(170,139,99,0.35)] transition-shadow">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 overflow-visible"
          >
            <defs>
              <linearGradient id="heartGrad" x1="12" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF0E2" />
                <stop offset="0.6" stopColor="#C4A67E" />
                <stop offset="1" stopColor="#AA8B63" />
              </linearGradient>
            </defs>

            {/* Glowing Aura Ring */}
            <circle
              ref={careAuraRef}
              cx="24"
              cy="23"
              r="12"
              stroke="#AA8B63"
              strokeWidth="1.2"
              fill="none"
              opacity="0.6"
            />

            {/* Loving Heart Foundation */}
            <g ref={careHeartRef} id="heartGroup">
              <path
                d="M24 35C24 35 12 27 12 18C12 13.5 15.5 10 20 10C22.5 10 24 11.5 24 11.5C24 11.5 25.5 10 28 10C32.5 10 36 13.5 36 18C36 27 24 35 24 35Z"
                fill="url(#heartGrad)"
                opacity="0.22"
              />
              <path
                d="M24 35C24 35 12 27 12 18C12 13.5 15.5 10 20 10C22.5 10 24 11.5 24 11.5C24 11.5 25.5 10 28 10C32.5 10 36 13.5 36 18C36 27 24 35 24 35Z"
                stroke="url(#heartGrad)"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
              />
            </g>

            {/* Caring Hand Supporting Dog Paw */}
            <g ref={careHandRef} id="caringHand">
              <path
                d="M15 28C17 31 21 32 24 31C27 30 30 27 31 25"
                stroke="#FAF0E2"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M17 25C19 28 23 29 26 28"
                stroke="#AA8B63"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* Paw Resting Gently Inside Hand */}
            <g ref={carePawRef} id="caringPaw">
              <circle cx="24" cy="22" r="3.2" fill="#FAF0E2" />
              <circle cx="20" cy="18" r="1.4" fill="#AA8B63" />
              <circle cx="23.5" cy="16.5" r="1.5" fill="#FAF0E2" />
              <circle cx="27" cy="17" r="1.5" fill="#FAF0E2" />
              <circle cx="29.5" cy="19.5" r="1.3" fill="#AA8B63" />
            </g>

            {/* Floating Spa Bubble */}
            <circle
              ref={careBubbleRef}
              cx="34"
              cy="11"
              r="2.2"
              stroke="#FAF0E2"
              strokeWidth="1"
              fill="rgba(170,139,99,0.3)"
            />

            {/* Micro "1:1" Emblem */}
            <rect x="18.5" y="38" width="11" height="5" rx="1.5" fill="#252A1B" stroke="#AA8B63" strokeWidth="0.8" />
            <text x="24" y="42" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#FAF0E2" fontFamily="monospace">
              1:1
            </text>
          </svg>
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <div className="font-display font-bold text-xs sm:text-[13px] text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors truncate">
            Private One-on-One Care
          </div>
          <p className="text-[10px] text-[#A4AA93] mt-0.5 leading-snug">
            Dedicated 100% gentle focus
          </p>
        </div>
      </div>
    </div>
  );
}
