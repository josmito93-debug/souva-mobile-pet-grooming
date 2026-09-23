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
    description: "Rostro despejado, hocico redondeado tipo peluche y bandana tropical hawaiana.",
    beforeImg: "/assets/before-after/poodle-before.jpg",
    afterImg: "/assets/before-after/poodle-after.jpg",
    beforeNote: "Llegada · Ojos cubiertos y manto desigual",
    afterNote: "Look SOUVA · Esculpido facial a tijera",
  },
  {
    id: "goldendoodle",
    name: "Milo",
    breed: "Goldendoodle",
    service: "Signature Spa Bath & Sculpt",
    tag: "Velvet Coat Finish",
    description: "Deslanado botánico profundo, volumen esponjoso en patas y bandana de sandía.",
    beforeImg: "/assets/before-after/goldendoodle-before.jpg",
    afterImg: "/assets/before-after/goldendoodle-after.jpg",
    beforeNote: "Llegada · Manto crecido y pérdida de definición",
    afterNote: "Look SOUVA · Silueta simétrica y pelaje sedoso",
  },
  {
    id: "bernedoodle",
    name: "Oreo",
    breed: "Mini Bernedoodle",
    service: "Master Scissor Trim & Hygiene",
    tag: "Botanical Spa Care",
    description: "Desenredado con Hydra®, peinado de cejas y patas, y bandana festiva de huellitas.",
    beforeImg: "/assets/before-after/bernedoodle-before.jpg",
    afterImg: "/assets/before-after/bernedoodle-after.jpg",
    beforeNote: "Llegada · Pelaje denso previo al corte",
    afterNote: "Look SOUVA · Patas acampanadas y hocico limpio",
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
            alt={`${item.name} Después - Look SOUVA`}
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
              alt={`${item.name} Antes`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full bg-[#161811]/90 backdrop-blur-md border border-[#FAF0E2]/20 text-[9.5px] font-mono font-bold text-[#FAF0E2] shadow pointer-events-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>ANTES</span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-0.5 rounded-full bg-[#AA8B63] backdrop-blur-md border border-[#FAF0E2]/30 text-[9.5px] font-mono font-bold text-[#161811] shadow pointer-events-none flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            <span>DESPUÉS</span>
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
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-[#161811]/85 backdrop-blur-sm text-[9px] font-mono text-[#FAF0E2]/80 border border-[#FAF0E2]/10 pointer-events-none flex items-center gap-1 whitespace-nowrap">
            <Eye className="h-2.5 w-2.5 text-[#AA8B63]" />
            <span>Desliza para comparar</span>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center justify-between gap-1 mt-2.5 px-0.5">
          <button
            type="button"
            onClick={() => setSliderPosition(5)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
              sliderPosition <= 15
                ? "bg-[#AA8B63]/20 text-[#AA8B63] border-[#AA8B63]"
                : "bg-[#161811] text-[#A4AA93] border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
            }`}
          >
            Antes
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
              sliderPosition > 35 && sliderPosition < 65
                ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63]"
                : "bg-[#161811] text-[#A4AA93] border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
            }`}
          >
            50/50
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(95)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
              sliderPosition >= 85
                ? "bg-[#AA8B63]/20 text-[#AA8B63] border-[#AA8B63]"
                : "bg-[#161811] text-[#AA8B63] border-[#AA8B63]/40 hover:bg-[#AA8B63]/30"
            }`}
          >
            Después ✨
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="font-display font-bold text-xl text-[#FAF0E2]">
              {item.name}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/15 border border-[#AA8B63]/35 text-[#AA8B63] font-mono text-[10.5px] font-bold">
              {item.breed}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#AA8B63] font-mono font-semibold mb-2">
            <Scissors className="h-3.5 w-3.5" />
            <span>{item.service}</span>
          </div>

          <p className="text-xs text-[#E2D7C5]/90 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10 flex items-center justify-between text-[10.5px] font-mono text-[#A4AA93]">
          <span className="flex items-center gap-1 text-[#AA8B63]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sin Jaulas</span>
          </span>
          <span className="text-[#FAF0E2]/60">Cuidado 1-a-1</span>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterSlider() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 3 Distinct Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {TRANSFORMATIONS.map((item) => (
          <TransformationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}


