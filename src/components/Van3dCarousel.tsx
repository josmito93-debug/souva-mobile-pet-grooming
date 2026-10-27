import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  Zap,
  Shield,
  Sparkles,
  Droplets,
  Calendar,
  Layers,
  CheckCircle2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VanPhotoItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: "Exterior" | "Interior Suite" | "Hydro-Spa" | "Solar Tech";
  specs: string[];
}

export const VAN_FLEET_PHOTOS: VanPhotoItem[] = [
  {
    id: "van-01",
    src: "/assets/van-fleet/van-01.jpg",
    title: "Autonomous Solar Mobile Salon",
    subtitle: "Custom Mercedes-Benz Sprinter High-Roof Suite",
    category: "Exterior",
    specs: ["100% Solar-Powered Battery Bank", "Zero Generator Noise & Zero Fumes", "Direct Doorstep Driveway Setup"],
  },
  {
    id: "van-02",
    src: "/assets/van-fleet/van-02.jpg",
    title: "Precision Stainless Hydro-Spa Tub",
    subtitle: "Custom Ergonomic Canine Bath Station",
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
    title: "Clinical UV Sanitization System",
    subtitle: "Sterilized Environment Between Every Pet",
    category: "Interior Suite",
    specs: ["Hospital UV-C Surface Disinfection", "Medical Air Filter Cycle", "Fresh Sanitized Towels Every Session"],
  },
  {
    id: "van-05",
    src: "/assets/van-fleet/van-05.jpg",
    title: "Whisper-Quiet Acoustic Insulation",
    subtitle: "Sanctuary-Grade Noise Dampening",
    category: "Solar Tech",
    specs: ["Automotive 4-Layer Sound Proofing", "Vibration-Free Pure Electric Operation", "Stress Reduction for Anxious Pets"],
  },
  {
    id: "van-06",
    src: "/assets/van-fleet/van-06.jpg",
    title: "Warm Ambient Light Therapy",
    subtitle: "Low-Stress Visual Environment",
    category: "Interior Suite",
    specs: ["3200K Soft Spectrum Lumens", "No Glare or Harsh Fluorescent Tubes", "Panoramic Natural Light Skylight"],
  },
  {
    id: "van-07",
    src: "/assets/van-fleet/van-07.jpg",
    title: "Master Styling & Scissor Station",
    subtitle: "Japanese Precision Shears & Grooming Bar",
    category: "Interior Suite",
    specs: ["Handcrafted Convex Edge Scissors", "Quiet Variable-Speed Fluff Dryers", "Never Any Cage Dryers"],
  },
  {
    id: "van-08",
    src: "/assets/van-fleet/van-08.jpg",
    title: "Self-Contained Fresh Water Tanks",
    subtitle: "Zero Street Hookups or Home Utilities Needed",
    category: "Solar Tech",
    specs: ["50-Gallon Food-Grade Clean Tank", "Isolated Grey Water Disposal System", "100% Self-Sufficient Autonomous Fleet"],
  },
  {
    id: "van-09",
    src: "/assets/van-fleet/van-09.jpg",
    title: "Hydra® Professional Cosmetics Bar",
    subtitle: "Brazilian Salon Luxury Formulations",
    category: "Hydro-Spa",
    specs: ["Colloidal Oatmeal & Botanical Extracts", "Sulfate-Free Hypoallergenic Formulas", "Dematted Coat Silk Conditioning"],
  },
  {
    id: "van-10",
    src: "/assets/van-fleet/van-10.jpg",
    title: "Real-Time Solar Lithium Telemetry",
    subtitle: "Digital Energy Management Console",
    category: "Solar Tech",
    specs: ["Victron Smart Lithium Battery Core", "Roof Solar Panel Regeneration", "Sustainable Zero-Carbon Footprint"],
  },
  {
    id: "van-11",
    src: "/assets/van-fleet/van-11.jpg",
    title: "Climate Control & Clean Air Exchange",
    subtitle: "Optimal Temperature in Any Season",
    category: "Interior Suite",
    specs: ["Automated Dual AC & Heating", "Continuous HEPA Air Recirculation", "Constant 72°F Ideal Comfort"],
  },
  {
    id: "van-12",
    src: "/assets/van-fleet/van-12.jpg",
    title: "Signature Fleet Golden Wrap",
    subtitle: "San Francisco Bay Area Mobile Presence",
    category: "Exterior",
    specs: ["California Licensed & Insured SOUVA Fleet", "Discreet Neighborhood Footprint", "Doorstep Luxury Service Across 38 ZIPs"],
  },
];

interface Van3dCarouselProps {
  onBookClick?: () => void;
}

export function Van3dCarousel({ onBookClick }: Van3dCarouselProps) {
  const [rotation, setRotation] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Responsive dimensions
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));

  // Drag physics tracking
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const lastDragTime = useRef(0);
  const dragVelocity = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const isHovered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCards = VAN_FLEET_PHOTOS.length;
  const anglePerCard = 360 / totalCards;

  // Compute responsive layout parameters
  const layout = useRef({
    radius: 560,
    cardWidth: 340,
    cardHeight: 460,
    perspective: 1400,
  });

  if (viewportWidth < 640) {
    layout.current = { radius: 290, cardWidth: 230, cardHeight: 330, perspective: 900 };
  } else if (viewportWidth < 1024) {
    layout.current = { radius: 420, cardWidth: 280, cardHeight: 390, perspective: 1100 };
  } else {
    layout.current = { radius: 560, cardWidth: 340, cardHeight: 460, perspective: 1400 };
  }

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute Active Index from current rotation
  const activeIndex = useMemo(() => {
    const normalized = ((-rotation % 360) + 360) % 360;
    return Math.round(normalized / anglePerCard) % totalCards;
  }, [rotation, anglePerCard, totalCards]);

  // Smooth Snap To Angle
  const snapToCard = useCallback((targetIndex: number) => {
    setRotation(-targetIndex * anglePerCard);
  }, [anglePerCard]);

  // Next / Prev Actions
  const handlePrev = useCallback(() => {
    setRotation((prev) => prev + anglePerCard);
  }, [anglePerCard]);

  const handleNext = useCallback(() => {
    setRotation((prev) => prev - anglePerCard);
  }, [anglePerCard]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev !== null ? (prev - 1 + totalCards) % totalCards : 0));
        if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev !== null ? (prev + 1) % totalCards : 0));
        return;
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, lightboxIndex, totalCards]);

  // Silky 60fps Continuous Auto-Rotation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isAutoPlaying && !isDragging && !isHovered.current && lightboxIndex === null) {
        // Continuous gentle speed: ~4 degrees per second
        setRotation((prev) => prev - 4 * delta);
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isAutoPlaying, isDragging, lightboxIndex]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotation;
    lastDragTime.current = performance.now();
    dragVelocity.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const deltaX = currentX - dragStartX.current;
    const now = performance.now();
    const timeDelta = (now - lastDragTime.current) || 16;

    // Convert pixel delta into rotational degrees based on radius
    const degPerPixel = 360 / (layout.current.radius * Math.PI * 2);
    const newRot = dragStartRotation.current + deltaX * degPerPixel;
    dragVelocity.current = (deltaX * degPerPixel) / timeDelta;
    lastDragTime.current = now;

    setRotation(newRot);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Inertia spring snap to closest card
    const target = Math.round((-rotation + dragVelocity.current * 12) / anglePerCard) % totalCards;
    const finalIndex = (target + totalCards) % totalCards;
    snapToCard(finalIndex);
  };

  // Touch Swipe Handlers (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartRotation.current = rotation;
    lastDragTime.current = performance.now();
    dragVelocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX.current;
    const now = performance.now();
    const timeDelta = (now - lastDragTime.current) || 16;

    const degPerPixel = 360 / (layout.current.radius * Math.PI * 2);
    const newRot = dragStartRotation.current + deltaX * degPerPixel;
    dragVelocity.current = (deltaX * degPerPixel) / timeDelta;
    lastDragTime.current = now;

    setRotation(newRot);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const target = Math.round((-rotation + dragVelocity.current * 15) / anglePerCard) % totalCards;
    const finalIndex = (target + totalCards) % totalCards;
    snapToCard(finalIndex);
  };

  return (
    <section
      id="gallery"
      className="py-16 md:py-28 px-3 sm:px-6 lg:px-8 bg-[#12140D] border-t border-[#FAF0E2]/15 relative overflow-hidden select-none"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
        if (isDragging) handleMouseUp();
      }}
    >
      {/* Background Radial Glow & Cinematic Stage Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(170,139,99,0.14),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── SECTION HEADER & LUXURY CONTROLS HUD ─────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#AA8B63] font-bold">
                // SOUVA FLEET RADAR // 3D VIRTUAL INSPECTION
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2] tracking-tight">
              Inside Our Solar Mobile Van
            </h2>
            <p className="text-xs sm:text-sm text-[#E2D7C5]/85 leading-relaxed">
              Step inside our custom Mercedes-Benz Sprinter salon. Drag or rotate in 3D to explore the
              whisper-quiet lithium battery suite, medical-grade stainless hydro-spa, and master scissor cockpit.
            </p>
          </div>

          {/* HUD Control Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start md:self-auto">
            {/* Auto-Play Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={cn(
                "px-3.5 py-2 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
                isAutoPlaying
                  ? "bg-[#1C2216] border-[#AA8B63]/70 text-[#FAF0E2]"
                  : "bg-[#181A13] border-[#FAF0E2]/15 text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
              title={isAutoPlaying ? "Pause 3D auto-orbit" : "Resume 3D auto-orbit"}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#AA8B63]" />
                  <span className="text-[11px]">Orbit Active</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px]">Play Orbit</span>
                </>
              )}
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 w-10 rounded-full bg-[#1A1D14] border border-[#FAF0E2]/20 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md"
                aria-label="Previous 3D Slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-10 w-10 rounded-full bg-[#1A1D14] border border-[#FAF0E2]/20 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md"
                aria-label="Next 3D Slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Active Counter Indicator */}
            <div className="px-3.5 py-2 rounded-full bg-[#181B13] border border-[#FAF0E2]/15 text-[#AA8B63] font-mono font-bold text-xs">
              <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-[#A4AA93]/50 mx-1">/</span>
              <span className="text-[#A4AA93]">{String(totalCards).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* ── 3D CYLINDER VIEWPORT STAGE ──────────────────────────────── */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "relative w-full mx-auto flex items-center justify-center py-6 cursor-grab active:cursor-grabbing",
            "touch-pan-y"
          )}
          style={{
            height: `${layout.current.cardHeight + 120}px`,
            perspective: `${layout.current.perspective}px`,
          }}
        >
          {/* 3D Carousel Cylinder Container */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {VAN_FLEET_PHOTOS.map((item, index) => {
              // Calculate continuous circular theta
              const cardBaseAngle = index * anglePerCard;
              const currentAngle = cardBaseAngle + rotation;
              const normalizedAngle = ((currentAngle % 360) + 360) % 360;

              // Distance from front (0 degrees)
              const diffFromFront = Math.abs(normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle);
              const cosVal = Math.cos((normalizedAngle * Math.PI) / 180);

              // Attenuation for realistic optical depth of field
              const isFront = diffFromFront < 18;
              const isVisibleInFrustum = diffFromFront < 105;

              // Smooth scale from 1.05 down to 0.72
              const scale = 0.72 + (cosVal + 1) * 0.165;
              // Opacity attenuation
              const opacity = Math.max(0.2, (cosVal + 1) / 2);
              // Z-Index calculation
              const zIndex = Math.round((cosVal + 1) * 50);
              // Depth blur for background cards
              const blurPx = Math.max(0, (1 - cosVal) * 2.2);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!isFront) {
                      snapToCard(index);
                    } else {
                      setLightboxIndex(index);
                    }
                  }}
                  className={cn(
                    "absolute top-1/2 left-1/2 rounded-3xl overflow-hidden transition-shadow duration-300 group select-none",
                    isFront
                      ? "ring-2 ring-[#AA8B63] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(170,139,99,0.35)] cursor-pointer"
                      : "border border-[#FAF0E2]/15 shadow-xl hover:border-[#AA8B63]/60 cursor-pointer"
                  )}
                  style={{
                    width: `${layout.current.cardWidth}px`,
                    height: `${layout.current.cardHeight}px`,
                    marginLeft: `-${layout.current.cardWidth / 2}px`,
                    marginTop: `-${layout.current.cardHeight / 2}px`,
                    transform: `rotateY(${currentAngle}deg) translateZ(${layout.current.radius}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    filter: blurPx > 0.4 ? `blur(${blurPx}px)` : "none",
                    willChange: "transform, opacity, filter",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {/* Image Surface with Subtle Reflective Grain */}
                  <div className="relative w-full h-full bg-[#181B13]">
                    <img
                      src={item.src}
                      alt={item.title}
                      loading={index < 4 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      draggable={false}
                    />

                    {/* Gradient Depth Tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12140D] via-[#12140D]/40 to-transparent" />

                    {/* Category Tag & Expand Icon (Top) */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#12140D]/85 backdrop-blur-md border border-[#FAF0E2]/15 text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold">
                        {item.category}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(index);
                        }}
                        className="h-8 w-8 rounded-full bg-[#12140D]/80 backdrop-blur-md border border-[#FAF0E2]/20 flex items-center justify-center text-[#FAF0E2] hover:text-[#AA8B63] hover:scale-110 transition-all shadow-md"
                        title="Inspect in 5K Fullscreen"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Bottom Content Card */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          SOUVA SPEC · {item.id.toUpperCase()}
                        </span>
                        <h3 className="font-display font-bold text-base sm:text-lg text-[#FAF0E2] leading-tight line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-[#A4AA93] line-clamp-1 leading-snug">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Primary Spec Bullet */}
                      {item.specs.length > 0 && (
                        <div className="pt-1.5 border-t border-[#FAF0E2]/10 flex items-center gap-1.5 text-[10.5px] font-mono text-[#FAF0E2]/90">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#AA8B63] shrink-0" />
                          <span className="truncate">{item.specs[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Active Golden Highlight Ring */}
                    {isFront && (
                      <div className="pointer-events-none absolute inset-0 border-2 border-[#AA8B63]/60 rounded-3xl" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── INTERACTIVE SCRUBBER / DOT PAGINATION ────────────────────── */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-2 px-3 rounded-full bg-[#181B13] border border-[#FAF0E2]/10 shadow-inner">
            {VAN_FLEET_PHOTOS.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => snapToCard(idx)}
                  className={cn(
                    "transition-all duration-300 rounded-full cursor-pointer",
                    isActive
                      ? "h-2 w-8 bg-[#AA8B63] shadow-[0_0_10px_rgba(170,139,99,0.8)]"
                      : "h-2 w-2 bg-[#FAF0E2]/20 hover:bg-[#FAF0E2]/50"
                  )}
                  aria-label={`Jump to ${item.title}`}
                  title={`${idx + 1}. ${item.title}`}
                />
              );
            })}
          </div>

          {/* Active Card Specs Summary Strip & CTA */}
          <div className="w-full max-w-3xl p-4 sm:p-5 rounded-2xl bg-[#181B13] border border-[#FAF0E2]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="h-10 w-10 rounded-xl bg-[#AA8B63]/15 border border-[#AA8B63]/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-[#AA8B63]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                  {VAN_FLEET_PHOTOS[activeIndex].title}
                </h4>
                <p className="text-[11px] text-[#A4AA93]">
                  {VAN_FLEET_PHOTOS[activeIndex].specs.join(" · ")}
                </p>
              </div>
            </div>

            {onBookClick && (
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book This Van to Doorstep</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 5K DEEP INSPECTION LIGHTBOX MODAL ───────────────────────── */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#14160F] border border-[#FAF0E2]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#FAF0E2]/10 flex items-center justify-between bg-[#181B13]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/20 border border-[#AA8B63]/50 text-[#AA8B63] text-[10px] font-mono font-bold uppercase">
                  {VAN_FLEET_PHOTOS[lightboxIndex].category}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-[#FAF0E2]">
                  {VAN_FLEET_PHOTOS[lightboxIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#A4AA93]">
                  {lightboxIndex + 1} / {totalCards}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="h-8 w-8 rounded-full bg-[#202418] border border-[#FAF0E2]/15 flex items-center justify-center text-[#FAF0E2] hover:text-[#AA8B63] cursor-pointer"
                  aria-label="Close Inspection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Large Image */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] max-h-[62vh]">
              <img
                src={VAN_FLEET_PHOTOS[lightboxIndex].src}
                alt={VAN_FLEET_PHOTOS[lightboxIndex].title}
                className="w-full h-full object-contain max-h-[62vh]"
              />

              {/* Prev / Next Modal Buttons */}
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + totalCards) % totalCards : 0))}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#AA8B63] hover:text-black transition-all cursor-pointer shadow-lg"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % totalCards : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#AA8B63] hover:text-black transition-all cursor-pointer shadow-lg"
                aria-label="Next Photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Footer: Engineering Specs List & Book Button */}
            <div className="p-4 sm:p-6 bg-[#161911] border-t border-[#FAF0E2]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 w-full sm:w-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
                  Engineering Specifications
                </span>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#E2D7C5]/90">
                  {VAN_FLEET_PHOTOS[lightboxIndex].specs.map((spec) => (
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
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
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
