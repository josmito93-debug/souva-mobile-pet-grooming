import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Calendar,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VanPhoto {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: "Exterior" | "Interior Suite" | "Hydro-Spa" | "Solar Tech";
  specs: string[];
}

export const VAN_FLEET_PHOTOS: VanPhoto[] = [
  {
    id: "van-01",
    src: "/assets/van-fleet/van-01.jpg",
    title: "Autonomous Solar Mobile Salon",
    subtitle: "Custom Mercedes-Benz High-Roof Luxury Suite",
    category: "Exterior",
    specs: ["100% Solar-Powered Battery Bank", "Zero Generator Noise & Zero Fumes", "Direct Doorstep Driveway Setup"],
  },
  {
    id: "van-02",
    src: "/assets/van-fleet/van-02.jpg",
    title: "Precision Stainless Hydro-Spa Tub",
    subtitle: "Warm Water Hydro-Massage Spa Bath",
    category: "Hydro-Spa",
    specs: ["Continuous Warm Water Heating", "Dual Micro-Filtration Clean Water Tanks", "Gentle Hydro-Massage Wand"],
  },
  {
    id: "van-03",
    src: "/assets/van-fleet/van-03.jpg",
    title: "Electric Hydraulic Grooming Table",
    subtitle: "Low-Entry Stability for Dogs of All Sizes",
    category: "Interior Suite",
    specs: ["360° Rotating Hydraulic Lift", "Medical-Grade Non-Slip Cushion", "Supports Toy to Giant Breeds up to 130 lbs"],
  },
  {
    id: "van-04",
    src: "/assets/van-fleet/van-04.jpg",
    title: "Clinical UV Sanitization Suite",
    subtitle: "Sterilized Environment Between Every Pet",
    category: "Interior Suite",
    specs: ["Hospital UV-C Surface Disinfection", "Medical Air Filter Exchange", "Fresh Sanitized Towels Every Session"],
  },
  {
    id: "van-05",
    src: "/assets/van-fleet/van-05.jpg",
    title: "Whisper-Quiet Acoustic Insulation",
    subtitle: "Sanctuary-Grade Noise Isolation Suite",
    category: "Solar Tech",
    specs: ["Automotive 4-Layer Sound Proofing", "Vibration-Free Pure Electric Operation", "Stress Reduction for Anxious Pets"],
  },
  {
    id: "van-06",
    src: "/assets/van-fleet/van-06.jpg",
    title: "Warm Ambient Light Therapy",
    subtitle: "Low-Stress Visual Environment",
    category: "Interior Suite",
    specs: ["3200K Soft Spectrum Lumens", "No Harsh Fluorescent Flickers", "Natural Panoramic Light Skylight"],
  },
  {
    id: "van-07",
    src: "/assets/van-fleet/van-07.jpg",
    title: "Master Styling & Scissor Cockpit",
    subtitle: "Japanese Precision Shears & Grooming Bar",
    category: "Interior Suite",
    specs: ["Handcrafted Convex Edge Scissors", "Quiet Variable-Speed Fluff Dryers", "Never Any Cage Dryers"],
  },
  {
    id: "van-08",
    src: "/assets/van-fleet/van-08.jpg",
    title: "Self-Contained Fresh Water System",
    subtitle: "Zero Street Hookups or Home Utilities Needed",
    category: "Solar Tech",
    specs: ["50-Gallon Food-Grade Clean Tank", "Isolated Grey Water Disposal System", "100% Self-Sufficient Autonomous Fleet"],
  },
  {
    id: "van-09",
    src: "/assets/van-fleet/van-09.jpg",
    title: "Hydra® Professional Cosmetics Bar",
    subtitle: "Brazilian Salon Botanical Formulations",
    category: "Hydro-Spa",
    specs: ["Colloidal Oatmeal & Botanical Extracts", "Sulfate-Free Hypoallergenic Formulas", "Silk Coat Restoration Treatments"],
  },
  {
    id: "van-10",
    src: "/assets/van-fleet/van-10.jpg",
    title: "Solar Lithium Telemetry Console",
    subtitle: "Digital Energy Management & Monitoring",
    category: "Solar Tech",
    specs: ["Victron Smart Lithium Battery Core", "Roof Solar Panel Regeneration", "Sustainable Zero-Carbon Footprint"],
  },
  {
    id: "van-11",
    src: "/assets/van-fleet/van-11.jpg",
    title: "Dual AC Climate Control",
    subtitle: "Constant 72°F Ideal Comfort Year-Round",
    category: "Interior Suite",
    specs: ["Automated Dual AC & Heating", "Continuous HEPA Air Recirculation", "Independent Battery-Driven Climate"],
  },
  {
    id: "van-12",
    src: "/assets/van-fleet/van-12.jpg",
    title: "Signature Golden Fleet Exterior",
    subtitle: "California Licensed & Insured SOUVA Van",
    category: "Exterior",
    specs: ["California Licensed & Insured SOUVA Fleet", "Discreet Neighborhood Footprint", "Doorstep Service Across 38 Bay Area ZIPs"],
  },
];

interface Van3dCarouselProps {
  onBookClick?: () => void;
}

export function Van3dCarousel({ onBookClick }: Van3dCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Drag interaction state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const dragVelocity = useRef(0);
  const lastDragTime = useRef(0);
  const isHovered = useRef(false);

  // Filter photos by category if selected
  const filteredPhotos = selectedCategory === "All"
    ? VAN_FLEET_PHOTOS
    : VAN_FLEET_PHOTOS.filter((p) => p.category === selectedCategory);

  const total = filteredPhotos.length;

  // Safe Index Wrapping
  const wrapIndex = useCallback((idx: number) => {
    return ((idx % total) + total) % total;
  }, [total]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(wrapIndex(idx));
    setDragOffset(0);
  }, [wrapIndex]);

  const handlePrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const handleNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev !== null ? wrapIndex(prev - 1) : 0));
        if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev !== null ? wrapIndex(prev + 1) : 0));
        return;
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, lightboxIndex, wrapIndex]);

  // Auto-Play Timer
  useEffect(() => {
    if (!isAutoPlaying || isDragging || isHovered.current || lightboxIndex !== null) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => wrapIndex(prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isDragging, lightboxIndex, wrapIndex]);

  // Touch Handlers for Fluid Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragCurrentX.current = e.touches[0].clientX;
    lastDragTime.current = performance.now();
    dragVelocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX.current;
    const now = performance.now();
    const timeDelta = (now - lastDragTime.current) || 16;

    dragVelocity.current = (currentX - dragCurrentX.current) / timeDelta;
    dragCurrentX.current = currentX;
    lastDragTime.current = now;

    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (dragOffset > threshold || dragVelocity.current > 0.35) {
      handlePrev();
    } else if (dragOffset < -threshold || dragVelocity.current < -0.35) {
      handleNext();
    }
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
    lastDragTime.current = performance.now();
    dragVelocity.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const deltaX = currentX - dragStartX.current;
    const now = performance.now();
    const timeDelta = (now - lastDragTime.current) || 16;

    dragVelocity.current = (currentX - dragCurrentX.current) / timeDelta;
    dragCurrentX.current = currentX;
    lastDragTime.current = now;

    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (dragOffset > threshold || dragVelocity.current > 0.35) {
      handlePrev();
    } else if (dragOffset < -threshold || dragVelocity.current < -0.35) {
      handleNext();
    }
    setDragOffset(0);
  };

  const activePhoto = filteredPhotos[currentIndex] || filteredPhotos[0];

  return (
    <section
      id="gallery"
      className="py-14 sm:py-20 md:py-28 px-3 sm:px-6 lg:px-8 bg-[#12140D] border-t border-[#FAF0E2]/15 relative overflow-hidden select-none"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
        if (isDragging) handleMouseUp();
      }}
    >
      {/* Background Soft Stage Glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(170,139,99,0.14),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-emerald-500/5 blur-[90px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── SECTION HEADER & CATEGORIES ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#AA8B63] font-bold">
                // SOUVA FLEET RADAR // 3D TOUR //
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2] tracking-tight">
              Inside Our Solar Mobile Van
            </h2>
            <p className="text-xs sm:text-sm text-[#E2D7C5]/85 leading-relaxed">
              Step inside our custom Mercedes-Benz Sprinter luxury mobile salon. Fully equipped with an autonomous
              solar battery bank, warm hydro-massage bath station, and ergonomic 360° hydraulic lift table.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10 self-start md:self-auto shadow-inner">
            {["All", "Exterior", "Interior Suite", "Hydro-Spa", "Solar Tech"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setDragOffset(0);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer min-h-[36px]",
                  selectedCategory === cat
                    ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                    : "text-[#A4AA93] hover:text-[#FAF0E2] hover:bg-[#25281D]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── TIGHT 3D COVERFLOW STAGE (ZERO DEAD SPACE) ──────────────── */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-4xl mx-auto h-[260px] sm:h-[380px] md:h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            perspective: "1100px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Subtle Stage Floor Shadow */}
          <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 w-[70%] max-w-[500px] h-10 bg-black/70 blur-xl rounded-full" />

          {/* Render Active + Neighboring Cards with Tight Overlap (No Gaps) */}
          {filteredPhotos.map((item, idx) => {
            let diff = idx - currentIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            // Only show visible cards (-2, -1, 0, 1, 2)
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            const isCenter = diff === 0;
            const isLeft = diff < 0;
            const isRight = diff > 0;

            // Tightly calculated percentage overlap:
            // Center is at 0. Side cards sit tightly at -48% and +48% of card width!
            const basePercentX = isCenter ? 0 : diff > 0 ? (diff === 1 ? 50 : 88) : (diff === -1 ? -50 : -88);
            const dragPx = isCenter ? dragOffset : dragOffset * 0.4;

            // 3D rotations and scale
            const rotateY = isCenter ? (isDragging ? dragOffset * 0.04 : 0) : isLeft ? 18 : -18;
            const translateZ = isCenter ? 30 : -90 * Math.abs(diff);
            const scale = isCenter ? 1.0 : Math.max(0.82, 1 - Math.abs(diff) * 0.12);
            const opacity = isCenter ? 1.0 : Math.max(0.45, 0.85 - Math.abs(diff) * 0.35);
            const zIndex = 30 - Math.abs(diff) * 10;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isCenter) {
                    setLightboxIndex(idx);
                  } else {
                    goTo(idx);
                  }
                }}
                className={cn(
                  "absolute top-1/2 left-1/2 rounded-3xl overflow-hidden shadow-2xl transition-all select-none group",
                  isDragging ? "transition-none" : "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isCenter
                    ? "ring-2 ring-[#AA8B63] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(170,139,99,0.3)] cursor-pointer"
                    : "border border-[#FAF0E2]/20 shadow-xl hover:border-[#AA8B63]/60 cursor-pointer"
                )}
                style={{
                  width: "min(84vw, 560px)",
                  aspectRatio: "4 / 3",
                  marginLeft: "max(-42vw, -280px)",
                  marginTop: "max(-31.5vw, -210px)",
                  transform: `translateX(calc(${basePercentX}% + ${dragPx}px)) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                {/* 100% Crisp Photo Surface with Zero Muddy Overlays */}
                <div className="relative w-full h-full bg-[#181B13]">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading={Math.abs(diff) <= 1 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    draggable={false}
                  />

                  {/* Top Minimal Pill Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-[#12140D]/90 backdrop-blur-md border border-[#FAF0E2]/20 text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold shadow-md">
                      {idx + 1}/{total} · {item.category}
                    </span>

                    {isCenter && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(idx);
                        }}
                        className="pointer-events-auto h-8 w-8 rounded-full bg-[#12140D]/90 backdrop-blur-md border border-[#FAF0E2]/25 flex items-center justify-center text-[#FAF0E2] hover:text-[#AA8B63] hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                        title="View in Fullscreen"
                        aria-label="Inspect Fullscreen"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Golden Inset Border on Active Center Photo */}
                  {isCenter && (
                    <div className="pointer-events-none absolute inset-0 border-2 border-[#AA8B63]/60 rounded-3xl" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CLEAN INFORMATION HUD STRIP (BELOW IMAGE, ZERO OVERLAY) ─── */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto space-y-5">
          {/* Navigation Controls: Previous / Play-Pause / Next */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="h-11 w-11 rounded-full bg-[#1A1D14] border border-[#FAF0E2]/25 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg min-h-[44px] min-w-[44px]"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={cn(
                "px-5 py-2.5 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md min-h-[44px]",
                isAutoPlaying
                  ? "bg-[#1C2216] border-[#AA8B63]/80 text-[#FAF0E2]"
                  : "bg-[#181A13] border-[#FAF0E2]/20 text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#AA8B63]" />
                  <span className="text-[11px]">Auto-Orbit Active</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px]">Play Tour</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="h-11 w-11 rounded-full bg-[#1A1D14] border border-[#FAF0E2]/25 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg min-h-[44px] min-w-[44px]"
              aria-label="Next Photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Interactive Filmstrip Mini-Thumbnails (4:3 ratio) */}
          <div className="w-full overflow-x-auto pb-2 flex items-center justify-center gap-2 px-2 scrollbar-none">
            {filteredPhotos.map((photo, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative h-12 w-16 sm:h-14 sm:w-18 rounded-xl overflow-hidden border transition-all duration-300 shrink-0 cursor-pointer p-0 min-h-[44px] min-w-[44px]",
                    isActive
                      ? "border-[#AA8B63] ring-2 ring-[#AA8B63]/70 scale-105 opacity-100 shadow-lg"
                      : "border-[#FAF0E2]/15 opacity-45 hover:opacity-85 hover:border-[#AA8B63]/60"
                  )}
                  title={`${index + 1}. ${photo.title}`}
                  aria-label={`Jump to photo ${index + 1}: ${photo.title}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#AA8B63]/15" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Photo Details HUD Card with 3 Detailed Specs */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#181B13] border border-[#FAF0E2]/15 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <span className="text-[10px] font-mono text-[#AA8B63] font-bold uppercase tracking-wider">
                  FEATURED VIEW · {activePhoto.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ● Autonomous Suite Active
                </span>
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-[#FAF0E2] leading-tight">
                {activePhoto.title}
              </h3>
              <p className="text-xs text-[#E2D7C5]/80">
                {activePhoto.subtitle}
              </p>

              {/* 3 Key Specs List */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-[#FAF0E2]/90 font-mono">
                {activePhoto.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#AA8B63] shrink-0" />
                    <span className="text-[11px]">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {onBookClick && (
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book This Van</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 5K DEEP INSPECTION LIGHTBOX MODAL ───────────────────────── */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#14160F] border border-[#FAF0E2]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#FAF0E2]/10 flex items-center justify-between bg-[#181B13]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/20 border border-[#AA8B63]/50 text-[#AA8B63] text-[10px] font-mono font-bold uppercase">
                  {filteredPhotos[lightboxIndex].category}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-[#FAF0E2]">
                  {filteredPhotos[lightboxIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#A4AA93]">
                  {lightboxIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="h-9 w-9 rounded-full bg-[#202418] border border-[#FAF0E2]/20 flex items-center justify-center text-[#FAF0E2] hover:text-[#AA8B63] cursor-pointer min-h-[36px] min-w-[36px]"
                  aria-label="Close Inspection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Large Image */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[62vh]">
              <img
                src={filteredPhotos[lightboxIndex].src}
                alt={filteredPhotos[lightboxIndex].title}
                className="w-full h-full object-contain max-h-[62vh]"
              />

              {/* Prev / Next Modal Buttons */}
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev !== null ? wrapIndex(prev - 1) : 0))}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#AA8B63] hover:text-black transition-all cursor-pointer shadow-lg min-h-[44px] min-w-[44px]"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev !== null ? wrapIndex(prev + 1) : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#AA8B63] hover:text-black transition-all cursor-pointer shadow-lg min-h-[44px] min-w-[44px]"
                aria-label="Next Photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Footer: Engineering Specs List & Book Button */}
            <div className="p-4 sm:p-5 bg-[#161911] border-t border-[#FAF0E2]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 w-full sm:w-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
                  Engineering Specifications
                </span>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#E2D7C5]/90">
                  {filteredPhotos[lightboxIndex].specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {onBookClick && (
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(null);
                    onBookClick();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reserve This Van</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
