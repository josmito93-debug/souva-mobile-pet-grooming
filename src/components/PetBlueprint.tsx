import { cn } from "@/lib/utils";
import { Sparkles, Video } from "lucide-react";

export type GroomingZone = "face" | "body" | "paws" | "tail";
export type PetSize = "toy" | "small" | "medium" | "large" | "giant";

interface PetBlueprintProps {
  selectedZones: GroomingZone[];
  onToggleZone: (zone: GroomingZone) => void;
  selectedSize: PetSize;
  onSelectSize: (size: PetSize) => void;
}

const DOG_ANIMATIONS: Record<
  PetSize,
  { mp4: string; webm: string; label: string; breedExample: string }
> = {
  toy: {
    mp4: "/assets/tallas/toy.mp4",
    webm: "/assets/tallas/toy.webm",
    label: "Talla Toy (< 12 lbs)",
    breedExample: "Pomeranian, Yorkie, Chihuahua",
  },
  small: {
    mp4: "/assets/tallas/small.mp4",
    webm: "/assets/tallas/small.webm",
    label: "Talla Small (13-25 lbs)",
    breedExample: "French Bulldog, Shih Tzu, Pug",
  },
  medium: {
    mp4: "/assets/tallas/medium.mp4",
    webm: "/assets/tallas/medium.webm",
    label: "Talla Medium (26-50 lbs)",
    breedExample: "Corgi, Beagle, Cocker Spaniel",
  },
  large: {
    mp4: "/assets/tallas/large.mp4",
    webm: "/assets/tallas/large.webm",
    label: "Talla Large (51-80 lbs)",
    breedExample: "Golden Retriever, Doodle, Pastor",
  },
  giant: {
    mp4: "/assets/tallas/giant.mp4",
    webm: "/assets/tallas/giant.webm",
    label: "Talla Giant (80+ lbs)",
    breedExample: "Bernese, Mastiff, Gran Danés",
  },
};

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
    { id: "face", label: "Cara & Oídos", top: "18%", left: "68%", desc: "Corte higiénico facial y limpieza de orejas" },
    { id: "body", label: "Manto & Baño", top: "46%", left: "42%", desc: "Baño con champú de avena y deslanado" },
    { id: "paws", label: "Patas & Uñas", top: "78%", left: "54%", desc: "Corte/limado de uñas y bálsamo hidratante" },
    { id: "tail", label: "Cola & Sanitario", top: "38%", left: "16%", desc: "Perfilado de cola y zona sanitaria" },
  ];

  const activeDog = DOG_ANIMATIONS[selectedSize];

  return (
    <div className="w-full">
      {/* Size Selector Pills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4AA93]">
            Selecciona la Talla de tu Perro:
          </span>
          <span className="text-[10px] font-mono text-[#AA8B63] font-bold">
            {activeDog.label}
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
                  "py-2 px-1 rounded-xl text-center border transition-all duration-300 cursor-pointer select-none relative",
                  isActive
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-[0_0_15px_rgba(170,139,99,0.35)] scale-102"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/30"
                )}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63]" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FAF0E2]" />
                  </span>
                )}
                <div className="text-[11.5px] font-bold font-display">{opt.label}</div>
                <div className="text-[8.5px] font-mono opacity-75 mt-0.5">{opt.weight}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Visual Box with Dog Video Animation */}
      <div className="relative mx-auto w-full max-w-[340px] aspect-[4/3.8] rounded-2xl bg-[#13150F] border border-[#FAF0E2]/15 p-4 overflow-hidden shadow-2xl">
        {/* Technical HUD crosshairs */}
        <div className="absolute top-3 left-3 text-[8.5px] text-[#A4AA93]/70 font-mono select-none z-20">
          SYS.MODEL: {selectedSize.toUpperCase()} // 3D ANIMATION
        </div>
        <div className="absolute top-3 right-3 text-[8.5px] text-[#A4AA93]/70 font-mono select-none flex items-center gap-1.5 z-20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AA8B63] animate-pulse" />
          <span>SPA.STAT: READY</span>
        </div>

        {/* CAD Grid Lines */}
        <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-[#FAF0E2]/5 -translate-x-1/2 border-l border-dashed border-[#FAF0E2]/10 pointer-events-none z-10" />
        <div className="absolute left-4 right-4 top-1/3 h-[1px] bg-[#FAF0E2]/5 border-t border-dashed border-[#FAF0E2]/10 pointer-events-none z-10" />
        <div className="absolute left-4 right-4 bottom-1/3 h-[1px] bg-[#FAF0E2]/5 border-t border-dashed border-[#FAF0E2]/10 pointer-events-none z-10" />

        {/* Floating Bubble Motifs */}
        <div className="absolute top-8 left-10 h-6 w-6 rounded-full border border-[#AA8B63]/25 bg-[#AA8B63]/5 pointer-events-none animate-bubble-drift z-10" />
        <div className="absolute bottom-10 left-6 h-4 w-4 rounded-full border border-[#FAF0E2]/20 bg-white/5 pointer-events-none animate-bubble-drift z-10" style={{ animationDelay: "1.5s" }} />

        {/* ACTIVE DOG VIDEO ANIMATION FOR THE SELECTED SIZE */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <video
            key={selectedSize}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] transition-opacity duration-500"
          >
            <source src={activeDog.webm} type="video/webm" />
            <source src={activeDog.mp4} type="video/mp4" />
          </video>
        </div>

        {/* Interactive Zone Click Targets over the dog */}
        {zones.map((zone) => {
          const isSelected = selectedZones.includes(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onToggleZone(zone.id)}
              aria-pressed={isSelected}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none select-none rounded-xl p-2 z-20",
                isSelected ? "scale-110" : "hover:scale-105"
              )}
              style={{ top: zone.top, left: zone.left }}
              title={zone.desc}
            >
              {/* Target Aura */}
              <div
                className={cn(
                  "relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-500",
                  isSelected
                    ? "bg-[#AA8B63]/30 border-2 border-[#AA8B63] shadow-[0_0_18px_rgba(170,139,99,0.7),inset_0_0_8px_rgba(170,139,99,0.4)]"
                    : "bg-[#161811]/90 border border-[#FAF0E2]/25 hover:border-[#AA8B63] hover:bg-[#252A1C]"
                )}
              >
                <Sparkles
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isSelected
                      ? "text-[#FAF0E2] drop-shadow-[0_0_6px_rgba(250,240,226,0.8)]"
                      : "text-[#AA8B63]/80"
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
                  "mt-1 text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md transition-colors shadow-md",
                  isSelected
                    ? "bg-[#AA8B63] text-[#161811]"
                    : "bg-[#161811]/90 text-[#FAF0E2]/80 border border-[#FAF0E2]/15"
                )}
              >
                {zone.label}
              </span>
            </button>
          );
        })}

        {/* Bottom HUD size badge */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="px-2 py-0.5 rounded-md bg-[#161811]/85 border border-[#FAF0E2]/15 text-[9px] font-mono text-[#A4AA93]">
            {activeDog.breedExample}
          </div>
          <div className="px-2 py-0.5 rounded-md bg-[#AA8B63]/20 border border-[#AA8B63]/40 text-[9px] font-mono text-[#AA8B63] font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AA8B63] animate-pulse" />
            <span>ANIMACIÓN ACTIVA</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-center text-[10px] text-[#A4AA93] font-mono">
        {selectedZones.length === 0 ? (
          <span className="text-[#AA8B63] animate-pulse">
            Toca las zonas del perro que deseas mimar o personalizar
          </span>
        ) : (
          <span>
            {selectedZones.length} zona(s) de cuidado seleccionada(s) · {activeDog.label}
          </span>
        )}
      </div>
    </div>
  );
}
