import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type GroomingZone = "face" | "body" | "paws" | "tail";
export type PetSize = "toy" | "small" | "medium" | "large" | "giant";

interface PetBlueprintProps {
  selectedZones: GroomingZone[];
  onToggleZone: (zone: GroomingZone) => void;
  selectedSize: PetSize;
  onSelectSize: (size: PetSize) => void;
}

export function PetBlueprint({
  selectedZones,
  onToggleZone,
  selectedSize,
  onSelectSize,
}: PetBlueprintProps) {
  const sizeOptions: { id: PetSize; label: string; weight: string }[] = [
    { id: "toy", label: "Toy", weight: "< 12 lbs" },
    { id: "small", label: "Small", weight: "13-25 lbs" },
    { id: "medium", label: "Medium", weight: "26-50 lbs" },
    { id: "large", label: "Large", weight: "51-80 lbs" },
    { id: "giant", label: "Giant", weight: "80+ lbs" },
  ];

  const zones: { id: GroomingZone; label: string; top: string; left: string; desc: string }[] = [
    { id: "face", label: "Cara & Oídos", top: "16%", left: "68%", desc: "Corte higiénico facial y limpieza de orejas" },
    { id: "body", label: "Manto & Baño", top: "45%", left: "40%", desc: "Baño con champú de avena y deslanado" },
    { id: "paws", label: "Patas & Uñas", top: "78%", left: "54%", desc: "Corte/limado de uñas y bálsamo hidratante" },
    { id: "tail", label: "Cola & Sanitario", top: "35%", left: "14%", desc: "Perfilado de cola y zona sanitaria" },
  ];

  return (
    <div className="w-full">
      {/* Size Pills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4AA93]">
            Tamaño de tu Mascota
          </span>
          <span className="text-[10px] font-mono text-[#AA8B63] font-bold">
            {sizeOptions.find((s) => s.id === selectedSize)?.weight}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {sizeOptions.map((opt) => {
            const isActive = selectedSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectSize(opt.id)}
                className={cn(
                  "py-1.5 px-1 rounded-xl text-center border transition-all duration-300 cursor-pointer select-none",
                  isActive
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-[0_0_12px_rgba(170,139,99,0.35)] scale-102"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/30"
                )}
              >
                <div className="text-[11px] font-bold font-display">{opt.label}</div>
                <div className="text-[8.5px] font-mono opacity-70 mt-0.5">{opt.weight}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Visual Box */}
      <div className="relative mx-auto w-full max-w-[340px] aspect-[4/3.8] rounded-2xl bg-[#13150F] border border-[#FAF0E2]/10 p-4 overflow-hidden shadow-inner">
        {/* Technical HUD crosshairs */}
        <div className="absolute top-3 left-3 text-[8.5px] text-[#A4AA93]/60 font-mono select-none">
          SYS.SERVICE: SOUVA // DOORSTEP MOBILE SPA
        </div>
        <div className="absolute bottom-3 right-3 text-[8.5px] text-[#A4AA93]/60 font-mono select-none flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AA8B63] animate-pulse" />
          SPA.STAT: READY
        </div>

        {/* CAD Grid Lines */}
        <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-[#FAF0E2]/5 -translate-x-1/2 border-l border-dashed border-[#FAF0E2]/15 pointer-events-none" />
        <div className="absolute left-4 right-4 top-1/3 h-[1px] bg-[#FAF0E2]/5 border-t border-dashed border-[#FAF0E2]/15 pointer-events-none" />
        <div className="absolute left-4 right-4 bottom-1/3 h-[1px] bg-[#FAF0E2]/5 border-t border-dashed border-[#FAF0E2]/15 pointer-events-none" />

        {/* Floating Bubble Motifs */}
        <div className="absolute top-6 left-12 h-6 w-6 rounded-full border border-[#AA8B63]/20 bg-[#AA8B63]/5 pointer-events-none animate-bubble-drift" />
        <div className="absolute bottom-10 left-8 h-4 w-4 rounded-full border border-[#FAF0E2]/15 bg-white/5 pointer-events-none animate-bubble-drift" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-10 right-10 h-7 w-7 rounded-full border border-[#AA8B63]/25 bg-[#AA8B63]/5 pointer-events-none animate-bubble-drift" style={{ animationDelay: "2.8s" }} />

        {/* Dog Blueprint SVG Outline */}
        <svg
          viewBox="0 0 200 160"
          className="absolute inset-0 h-full w-full pointer-events-none select-none p-2"
        >
          {/* Subtle Silhouette contour */}
          <path
            d="M 40,110 
               C 35,95 32,80 36,65 
               C 40,50 52,48 65,52 
               C 72,40 85,30 102,28 
               C 115,26 128,32 135,38 
               C 140,32 150,28 160,34 
               C 168,40 166,50 162,56 
               C 170,62 172,72 168,80 
               C 162,90 152,94 145,95 
               C 142,108 140,125 138,138 
               C 134,142 126,142 124,136 
               C 122,122 120,112 118,102 
               C 108,104 98,105 88,103 
               C 85,115 82,128 78,138 
               C 74,142 66,142 64,136 
               C 60,124 55,116 50,114 Z"
            fill="none"
            stroke="rgba(250, 240, 226, 0.12)"
            strokeWidth="1.2"
          />
          {/* Inner detailed anatomical lines */}
          <path
            d="M 135,42 C 145,45 152,54 150,65 C 145,74 135,78 128,76"
            fill="none"
            stroke="rgba(170, 139, 99, 0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <path
            d="M 68,58 C 80,62 95,65 115,64"
            fill="none"
            stroke="rgba(170, 139, 99, 0.25)"
            strokeWidth="1"
          />
          {/* Heart crest */}
          <path
            d="M 100,50 C 97,46 92,47 92,51 C 92,56 100,62 100,62 C 100,62 108,56 108,51 C 108,47 103,46 100,50 Z"
            fill="rgba(170, 139, 99, 0.2)"
            stroke="rgba(170, 139, 99, 0.5)"
            strokeWidth="0.8"
          />
          {/* Paw outlines */}
          <ellipse cx="70" cy="138" rx="8" ry="4" fill="none" stroke="rgba(250, 240, 226, 0.15)" strokeWidth="1" />
          <ellipse cx="130" cy="138" rx="8" ry="4" fill="none" stroke="rgba(250, 240, 226, 0.15)" strokeWidth="1" />
        </svg>

        {/* Interactive Zone Click Targets */}
        {zones.map((zone) => {
          const isSelected = selectedZones.includes(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onToggleZone(zone.id)}
              aria-pressed={isSelected}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none select-none rounded-xl p-2",
                isSelected ? "scale-110 z-20" : "hover:scale-105 z-10"
              )}
              style={{ top: zone.top, left: zone.left }}
              title={zone.desc}
            >
              {/* Target Aura */}
              <div
                className={cn(
                  "relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-500",
                  isSelected
                    ? "bg-[#AA8B63]/25 border-2 border-[#AA8B63] shadow-[0_0_20px_rgba(170,139,99,0.6),inset_0_0_10px_rgba(170,139,99,0.4)]"
                    : "bg-[#1B1E15]/90 border border-[#FAF0E2]/20 hover:border-[#AA8B63]/60 hover:bg-[#252A1C]"
                )}
              >
                <Sparkles
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isSelected ? "text-[#FAF0E2] drop-shadow-[0_0_6px_rgba(250,240,226,0.8)]" : "text-[#AA8B63]/70"
                  )}
                />

                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FAF0E2]" />
                  </span>
                )}
              </div>

              {/* Tag Label */}
              <span
                className={cn(
                  "mt-1 text-[9.5px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md transition-colors",
                  isSelected
                    ? "bg-[#AA8B63] text-[#161811] shadow-sm"
                    : "bg-[#181A12]/80 text-[#FAF0E2]/70 border border-[#FAF0E2]/10"
                )}
              >
                {zone.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-center text-[10px] text-[#A4AA93] font-mono">
        {selectedZones.length === 0 ? (
          <span className="text-[#AA8B63] animate-pulse">
            Toca las zonas del blueprint que deseas mimar o personalizar
          </span>
        ) : (
          <span>
            {selectedZones.length} zona(s) seleccionada(s) · Paquete de cuidado activo
          </span>
        )}
      </div>
    </div>
  );
}
