import { useState, useRef, useCallback } from "react";
import { Sparkles, SlidersHorizontal, Scissors, ShieldCheck, Eye } from "lucide-react";

interface Transformation {
  id: string;
  name: string;
  breed: string;
  service: string;
  tag: string;
  description: string;
  beforeImg: string;
  afterImg: string;
  beforeNote: string;
  afterNote: string;
}

const TRANSFORMATIONS: Transformation[] = [
  {
    id: "toy-poodle",
    name: "Luna",
    breed: "Toy Poodle",
    service: "Asian Fusion Scissor Cut",
    tag: "Teddy Bear Style",
    description: "Clear facial silhouette, rounded teddy bear muzzle, and vibrant tropical Hawaiian bandana finish.",
    beforeImg: "/assets/before-after/poodle-before.jpg",
    afterImg: "/assets/before-after/poodle-after.jpg",
    beforeNote: "Arrival · Overgrown fur obstructing eyes and facial structure",
    afterNote: "SOUVA Look · Precision hand-scissored contour & floral bandana",
  },
  {
    id: "goldendoodle",
    name: "Milo",
    breed: "Goldendoodle",
    service: "Signature Spa Bath & Sculpt",
    tag: "Velvet Coat Finish",
    description: "Deep botanical de-shedding bath, sculpted velvet paw lines, and refreshing watermelon bandana finish.",
    beforeImg: "/assets/before-after/goldendoodle-before.jpg",
    afterImg: "/assets/before-after/goldendoodle-after.jpg",
    beforeNote: "Arrival · Dense unbrushed coat with loss of silhouette",
    afterNote: "SOUVA Look · Symmetrical scissor trim & watermelon bandana",
  },
  {
    id: "bernedoodle",
    name: "Oreo",
    breed: "Mini Bernedoodle",
    service: "Master Scissor Trim & Hygiene",
    tag: "Botanical Spa Care",
    description: "Hydra® botanical de-tangling therapy, refined eyebrow and muzzle shaping, and festive ear bows.",
    beforeImg: "/assets/before-after/bernedoodle-before.jpg",
    afterImg: "/assets/before-after/bernedoodle-after.jpg",
    beforeNote: "Arrival · Heavy tangled coat prior to styling",
    afterNote: "SOUVA Look · Flared scissor legs, clean muzzle & ear bows",
  },
];

function TransformationCard({ item }: { item: Transformation }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true);
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsInteracting(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-3xl border border-[#FAF0E2]/15 bg-[#1C2016] shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#AA8B63]/40 transition-all duration-300">
      {/* Top Split Interactive Image */}
      <div className="p-3 sm:p-4 pb-0">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize touch-none shadow-inner border border-[#FAF0E2]/10 bg-black"
        >
          {/* AFTER Image (Full background) */}
          <img
            src={item.afterImg}
            alt={`${item.name} After - SOUVA Look`}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            draggable={false}
          />

          {/* BEFORE Image (Clipped overlay on top) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)`,
            }}
          >
            <img
              src={item.beforeImg}
              alt={`${item.name} Before`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-[#161811]/90 backdrop-blur-md border border-[#FAF0E2]/20 text-[11px] font-semibold text-[#FAF0E2] shadow pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>BEFORE</span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-[#AA8B63] backdrop-blur-md border border-[#FAF0E2]/30 text-[11px] font-semibold text-[#161811] shadow pointer-events-none flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>AFTER</span>
          </div>

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#AA8B63] text-[#161811] border-2 border-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing">
              <SlidersHorizontal className="h-3 w-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Helper caption */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#161811]/85 backdrop-blur-sm text-[10px] font-medium text-[#FAF0E2]/85 border border-[#FAF0E2]/10 pointer-events-none flex items-center gap-1.5 whitespace-nowrap">
            <Eye className="h-3 w-3 text-[#AA8B63]" />
            <span>Drag to compare</span>
          </div>
        </div>

        {/* Quick Toggles: Before / After (50/50 removed) */}
        <div className="grid grid-cols-2 gap-2 mt-3 px-0.5">
          <button
            type="button"
            onClick={() => setSliderPosition(0)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border text-center ${
              sliderPosition <= 25
                ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63] shadow-md"
                : "bg-[#161811] text-[#A4AA93] border-[#FAF0E2]/10 hover:text-[#FAF0E2] hover:border-[#FAF0E2]/25"
            }`}
          >
            View Before
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(100)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border text-center flex items-center justify-center gap-1.5 ${
              sliderPosition >= 75
                ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63] shadow-md"
                : "bg-[#161811] text-[#AA8B63] border-[#AA8B63]/40 hover:bg-[#AA8B63]/20"
            }`}
          >
            <span>View After</span>
            <Sparkles className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-xl text-[#FAF0E2]">
              {item.name}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/15 border border-[#AA8B63]/35 text-[#AA8B63] text-xs font-semibold">
              {item.breed}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#AA8B63] font-semibold mb-2">
            <Scissors className="h-3.5 w-3.5" />
            <span>{item.service}</span>
          </div>

          <p className="text-xs text-[#E2D7C5]/90 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10 flex items-center justify-between text-xs text-[#A4AA93]">
          <span className="flex items-center gap-1.5 text-[#AA8B63] font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>100% Cage-Free</span>
          </span>
          <span className="text-[#FAF0E2]/60 font-medium">1-on-1 Gentle Care</span>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterSlider() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 3 Distinct Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
        {TRANSFORMATIONS.map((item) => (
          <TransformationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}


