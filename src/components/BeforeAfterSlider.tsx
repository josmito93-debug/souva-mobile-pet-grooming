import { useState, useRef, useCallback } from "react";
import { Sparkles, SlidersHorizontal, CheckCircle2, ChevronRight, Eye } from "lucide-react";

interface TransformationItem {
  id: string;
  name: string;
  breed: string;
  service: string;
  description: string;
  beforeImg: string;
  afterImg: string;
  beforeNote: string;
  afterNote: string;
}

const TRANSFORMATIONS: TransformationItem[] = [
  {
    id: "toy-poodle",
    name: "Luna",
    breed: "Toy Poodle",
    service: "Full Styling & Asian Fusion Cut",
    description: "Pelaje voluminoso despejado en ojos, hocico redondeado tipo peluche y bandana hawaiana.",
    beforeImg: "/assets/before-after/poodle-before.jpg",
    afterImg: "/assets/before-after/poodle-after.jpg",
    beforeNote: "Llegada · Pelo largo cubriendo ojos y expresión",
    afterNote: "Look SOUVA · Rostro despejado, corte tijera y bandana",
  },
  {
    id: "goldendoodle",
    name: "Milo",
    breed: "Goldendoodle",
    service: "Signature Spa Bath & Scissor Sculpt",
    description: "Deslanado profundo, contorno de patas acampanado y acabado sedoso con bandana de sandía.",
    beforeImg: "/assets/before-after/goldendoodle-before.jpg",
    afterImg: "/assets/before-after/goldendoodle-after.jpg",
    beforeNote: "Llegada · Manto crecido y pérdida de definición",
    afterNote: "Look SOUVA · Esculpido simétrico, esponjoso y perfumado",
  },
  {
    id: "bernedoodle",
    name: "Oreo",
    breed: "Mini Bernedoodle",
    service: "Master Scissor Trim & Hygiene",
    description: "Desenredado botánico con Hydra®, limpieza de zona ocular y bandana festiva de huellitas.",
    beforeImg: "/assets/before-after/bernedoodle-before.jpg",
    afterImg: "/assets/before-after/bernedoodle-after.jpg",
    beforeNote: "Llegada · Pelaje denso previo al corte",
    afterNote: "Look SOUVA · Patas acampanadas, hocico limpio y bandana",
  },
];

export function BeforeAfterSlider() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItem = TRANSFORMATIONS[selectedIdx];

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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Dog Selection Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TRANSFORMATIONS.map((item, idx) => {
          const isActive = idx === selectedIdx;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedIdx(idx);
                setSliderPosition(50);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border select-none ${
                isActive
                  ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63] shadow-[0_0_16px_rgba(170,139,99,0.35)] scale-102"
                  : "bg-[#1E2117] text-[#FAF0E2]/70 border-[#FAF0E2]/10 hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
              }`}
            >
              <span>{item.name}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">({item.breed})</span>
              {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Comparison Card */}
      <div className="bg-[#1C2016] border border-[#FAF0E2]/15 rounded-3xl p-4 sm:p-6 shadow-2xl">
        {/* Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#FAF0E2]/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#FAF0E2]">
                {activeItem.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/20 border border-[#AA8B63]/40 text-[#AA8B63] font-mono text-[10.5px] font-bold">
                {activeItem.breed}
              </span>
            </div>
            <p className="text-xs text-[#A4AA93] mt-1 font-mono">
              Servicio: <span className="text-[#FAF0E2]">{activeItem.service}</span>
            </p>
          </div>

          {/* Quick Peek Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSliderPosition(10)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                sliderPosition <= 15
                  ? "bg-[#161811] text-[#FAF0E2] border-[#AA8B63]"
                  : "bg-[#252A1C] text-[#A4AA93] border-transparent hover:text-[#FAF0E2]"
              }`}
            >
              Solo Antes
            </button>
            <button
              type="button"
              onClick={() => setSliderPosition(50)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                sliderPosition > 35 && sliderPosition < 65
                  ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63]"
                  : "bg-[#252A1C] text-[#A4AA93] border-transparent hover:text-[#FAF0E2]"
              }`}
            >
              50 / 50
            </button>
            <button
              type="button"
              onClick={() => setSliderPosition(90)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                sliderPosition >= 85
                  ? "bg-[#161811] text-[#FAF0E2] border-[#AA8B63]"
                  : "bg-[#252A1C] text-[#A4AA93] border-transparent hover:text-[#FAF0E2]"
              }`}
            >
              Solo Después ✨
            </button>
          </div>
        </div>

        {/* Comparison Image Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize touch-none shadow-inner border border-[#FAF0E2]/15 bg-black"
        >
          {/* AFTER Image (Full background) */}
          <img
            src={activeItem.afterImg}
            alt={`${activeItem.name} Después - Look SOUVA`}
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
              src={activeItem.beforeImg}
              alt={`${activeItem.name} Antes`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#161811]/90 backdrop-blur-md border border-[#FAF0E2]/20 text-[11px] font-mono font-bold text-[#FAF0E2] shadow-lg flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>ANTES</span>
          </div>

          <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#AA8B63] backdrop-blur-md border border-[#FAF0E2]/30 text-[11px] font-mono font-bold text-[#161811] flex items-center gap-1.5 shadow-lg pointer-events-none">
            <Sparkles className="h-3 w-3" />
            <span>DESPUÉS (Look SOUVA)</span>
          </div>

          {/* Vertical Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Line */}
            <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

            {/* Handle Knob */}
            <div className="absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-[#AA8B63] text-[#161811] border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <SlidersHorizontal className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>

          {/* Drag instruction helper at bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 rounded-full bg-[#161811]/85 backdrop-blur-md text-[10.5px] font-mono text-[#FAF0E2]/90 border border-[#FAF0E2]/15 pointer-events-none flex items-center gap-1.5 shadow-md">
            <Eye className="h-3 w-3 text-[#AA8B63]" />
            <span>Desliza para comparar la transformación</span>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#A4AA93]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AA8B63]" />
            <span>{activeItem.description}</span>
          </div>
          <span className="font-mono text-[11px] text-[#AA8B63] self-end sm:self-auto">
            100% Sin Jaulas · Cuidado 1-a-1
          </span>
        </div>
      </div>
    </div>
  );
}

