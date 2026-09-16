import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type PetSize = "toy" | "small" | "medium" | "large" | "giant";

interface PetBlueprintProps {
  selectedSize: PetSize;
  onSelectSize: (size: PetSize) => void;
}

const DOG_ANIMATIONS: Record<
  PetSize,
  { mp4: string; webm: string; label: string; weight: string; breedExample: string }
> = {
  toy: {
    mp4: "/assets/dog-sizes/toy.mp4",
    webm: "/assets/dog-sizes/toy.webm",
    label: "Talla Toy",
    weight: "< 12 lbs",
    breedExample: "Pomeranian, Yorkshire, Chihuahua, Caniche Toy",
  },
  small: {
    mp4: "/assets/dog-sizes/small.mp4",
    webm: "/assets/dog-sizes/small.webm",
    label: "Talla Small",
    weight: "13 - 25 lbs",
    breedExample: "French Bulldog, Pug, Shih Tzu, Boston Terrier",
  },
  medium: {
    mp4: "/assets/dog-sizes/medium.mp4",
    webm: "/assets/dog-sizes/medium.webm",
    label: "Talla Medium",
    weight: "26 - 50 lbs",
    breedExample: "Corgi, Beagle, Cocker Spaniel, Schnauzer",
  },
  large: {
    mp4: "/assets/dog-sizes/large.mp4",
    webm: "/assets/dog-sizes/large.webm",
    label: "Talla Large",
    weight: "51 - 80 lbs",
    breedExample: "Golden Retriever, Labradoodle, Pastor Alemán",
  },
  giant: {
    mp4: "/assets/dog-sizes/giant.mp4",
    webm: "/assets/dog-sizes/giant.webm",
    label: "Talla Giant",
    weight: "80+ lbs",
    breedExample: "Bernese Mountain Dog, Gran Danés, Mastín",
  },
};

export function PetBlueprint({
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

  const activeDog = DOG_ANIMATIONS[selectedSize];

  return (
    <div className="w-full">
      {/* Size Selector Tabs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4AA93]">
            Elige la Talla de tu Perro:
          </span>
          <span className="text-[10px] font-mono text-[#AA8B63] font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AA8B63] animate-pulse" />
            <span>{activeDog.label} ({activeDog.weight})</span>
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
                  "py-2.5 px-1 rounded-2xl text-center border transition-all duration-300 cursor-pointer select-none relative",
                  isActive
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-[0_0_20px_rgba(170,139,99,0.45)] scale-105 font-bold"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF0E2] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FAF0E2]" />
                  </span>
                )}
                <div className={cn("text-xs font-display", isActive ? "font-extrabold" : "font-semibold")}>
                  {opt.label}
                </div>
                <div className={cn("text-[9px] font-mono mt-0.5", isActive ? "text-[#161811]/90 font-bold" : "opacity-75")}>
                  {opt.weight}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Full-View Video Animation Showcase */}
      <div className="relative mx-auto w-full max-w-[360px] aspect-[4/3.8] rounded-3xl bg-[#13150F] border border-[#FAF0E2]/15 overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Subtle breathing glow underneath */}
        <div className="absolute inset-0 bg-radial from-[#AA8B63]/10 via-transparent to-transparent pointer-events-none" />

        {/* Clean Video Element */}
        <video
          key={selectedSize}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
        >
          <source src={activeDog.webm} type="video/webm" />
          <source src={activeDog.mp4} type="video/mp4" />
        </video>

        {/* Subtle Bottom Floating Info Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none bg-[#161811]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#FAF0E2]/10 shadow-lg">
          <div className="text-[9.5px] font-mono text-[#FAF0E2] truncate max-w-[210px]">
            <span className="text-[#AA8B63] font-bold">Ej:</span> {activeDog.breedExample}
          </div>
          <div className="text-[9px] font-mono font-bold text-[#AA8B63] flex items-center gap-1.5 shrink-0">
            <Sparkles className="h-3 w-3" />
            <span>{activeDog.label.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-center text-xs text-[#A4AA93] font-mono">
        Animación 3D del perro según su tamaño corporal · <strong className="text-[#FAF0E2]">{activeDog.label}</strong>
      </div>
    </div>
  );
}
