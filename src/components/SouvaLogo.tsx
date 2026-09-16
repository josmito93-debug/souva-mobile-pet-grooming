import React from "react";

export function SouvaLogo({
  className = "h-9 w-auto",
  showSubtitle = true,
}: {
  className?: string;
  showSubtitle?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src="/assets/souva-badge-circle-transparent.png"
        alt="SOUVA Mobile Pet Grooming"
        className="h-11 w-11 object-contain rounded-full shadow-[0_0_15px_rgba(170,139,99,0.35)]"
      />
      <div className="flex flex-col">
        <div className="font-display tracking-[0.25em] text-xl font-bold leading-none text-[#FAF0E2] flex items-center gap-1.5">
          <span>SOUVA</span>
          <span className="text-[#AA8B63] text-xs font-serif">♥</span>
        </div>
        {showSubtitle && (
          <span className="text-[8.5px] uppercase tracking-[0.3em] text-[#AA8B63] font-sans font-semibold mt-1">
            Mobile Pet Grooming
          </span>
        )}
      </div>
    </div>
  );
}

export function SouvaIconBadge({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src="/assets/souva-badge-circle-transparent.png"
      alt="SOUVA Logo"
      className={`${className} object-contain rounded-full`}
    />
  );
}
