import { cn } from "@/lib/utils";
import { type PetSize, SIZE_GUIDE } from "@/data/services";

export type { PetSize };

interface PetBlueprintProps {
  selectedSize: PetSize;
  onSelectSize: (size: PetSize) => void;
}

const DOG_ANIMATIONS: Record<
  PetSize,
  { mov: string; webm: string; label: string; weight: string; breedExample: string }
> = {
  small: {
    mov: "/assets/dog-sizes/small.mov",
    webm: "/assets/dog-sizes/small.webm",
    label: "Small",
    weight: "Up to 15 lb",
    breedExample: "Pomeranian, Yorkie, Chihuahua, Toy Poodle",
  },
  medium: {
    mov: "/assets/dog-sizes/medium.mov",
    webm: "/assets/dog-sizes/medium.webm",
    label: "Medium",
    weight: "16–35 lb",
    breedExample: "French Bulldog, Pug, Cocker Spaniel, Corgi, Beagle",
  },
  large: {
    mov: "/assets/dog-sizes/large.mov",
    webm: "/assets/dog-sizes/large.webm",
    label: "Large",
    weight: "36–50 lb",
    breedExample: "Standard Schnauzer, Border Collie, Australian Shepherd",
  },
  xlarge: {
    mov: "/assets/dog-sizes/giant.mov",
    webm: "/assets/dog-sizes/giant.webm",
    label: "X-Large",
    weight: "Over 50 lb",
    breedExample: "Golden Retriever, Labradoodle, German Shepherd, Bernese",
  },
};

export function PetBlueprint({
  selectedSize,
  onSelectSize,
}: PetBlueprintProps) {
  const activeDog = DOG_ANIMATIONS[selectedSize] || DOG_ANIMATIONS.small;

  return (
    <div className="w-full">
      {/* Size Selector Tabs (4 Official Sizes) */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4AA93]">
            Select Dog Size:
          </span>
          <span className="text-[10px] font-mono text-[#AA8B63] font-bold">
            {activeDog.label} ({activeDog.weight})
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {SIZE_GUIDE.map((opt) => {
            const isActive = selectedSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectSize(opt.id)}
                className={cn(
                  "py-2.5 px-1.5 rounded-2xl text-center border transition-all duration-300 cursor-pointer select-none relative",
                  isActive
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-[0_0_15px_rgba(170,139,99,0.45)] scale-102 font-bold"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
              >
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

      {/* Floating Dog Alpha Video - Zero Background, Floating Freely */}
      <div className="relative w-full flex flex-col items-center justify-center my-2 select-none pointer-events-none">
        <video
          key={selectedSize}
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-[280px] sm:max-w-[320px] h-[240px] sm:h-[280px] object-contain bg-transparent [mix-blend-mode:screen]"
        >
          <source src={activeDog.mov} type='video/mp4; codecs="hvc1"' />
          <source src={activeDog.mov} type="video/quicktime" />
          <source src={activeDog.webm} type="video/webm" />
        </video>

        <div className="mt-1 text-center">
          <span className="text-[11px] font-mono text-[#A4AA93]">
            <strong className="text-[#FAF0E2]">{activeDog.label}</strong> ({activeDog.weight}) · {activeDog.breedExample}
          </span>
        </div>
      </div>
    </div>
  );
}
