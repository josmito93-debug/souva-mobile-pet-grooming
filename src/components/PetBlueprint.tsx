import { cn } from "@/lib/utils";

export type PetSize = "toy" | "small" | "medium" | "large" | "giant";

interface PetBlueprintProps {
  selectedSize: PetSize;
  onSelectSize: (size: PetSize) => void;
}

const DOG_ANIMATIONS: Record<
  PetSize,
  { mov: string; webm: string; label: string; weight: string; breedExample: string }
> = {
  toy: {
    mov: "/assets/dog-sizes/toy.mov",
    webm: "/assets/dog-sizes/toy.webm",
    label: "Toy Size",
    weight: "< 12 lbs",
    breedExample: "Pomeranian, Yorkie, Chihuahua, Toy Poodle",
  },
  small: {
    mov: "/assets/dog-sizes/small.mov",
    webm: "/assets/dog-sizes/small.webm",
    label: "Small Size",
    weight: "13 - 25 lbs",
    breedExample: "French Bulldog, Pug, Shih Tzu, Boston Terrier",
  },
  medium: {
    mov: "/assets/dog-sizes/medium.mov",
    webm: "/assets/dog-sizes/medium.webm",
    label: "Medium Size",
    weight: "26 - 50 lbs",
    breedExample: "Corgi, Beagle, Cocker Spaniel, Mini Schnauzer",
  },
  large: {
    mov: "/assets/dog-sizes/large.mov",
    webm: "/assets/dog-sizes/large.webm",
    label: "Large Size",
    weight: "51 - 80 lbs",
    breedExample: "Golden Retriever, Doodle, German Shepherd, Lab",
  },
  giant: {
    mov: "/assets/dog-sizes/giant.mov",
    webm: "/assets/dog-sizes/giant.webm",
    label: "Giant Size",
    weight: "80+ lbs",
    breedExample: "Bernese Mountain Dog, Great Dane, Mastiff",
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
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4AA93]">
            Select Your Dog's Size:
          </span>
          <span className="text-[10px] font-mono text-[#AA8B63] font-bold">
            {activeDog.label} ({activeDog.weight})
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
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-[0_0_15px_rgba(170,139,99,0.45)] scale-102 font-bold"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
              >
                <div className={cn("text-[11px] font-display", isActive ? "font-extrabold" : "font-semibold")}>
                  {opt.label}
                </div>
                <div className={cn("text-[8.5px] font-mono mt-0.5", isActive ? "text-[#161811]/90 font-bold" : "opacity-75")}>
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
