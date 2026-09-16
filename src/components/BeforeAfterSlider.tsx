import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseDown = () => {
    isDragging.current = true;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      className="relative w-full aspect-[16/10] md:aspect-[16/9] max-w-2xl mx-auto rounded-3xl overflow-hidden border border-[#FAF0E2]/15 shadow-2xl select-none cursor-ew-resize"
    >
      {/* Background Image: SOUVA Before & After showcase from PDF */}
      <img
        src="/assets/souva-before-after.png"
        alt="SOUVA Before and After Grooming"
        className="w-full h-full object-cover"
      />

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#161811]/80 backdrop-blur-md border border-[#FAF0E2]/15 text-[11px] font-mono font-bold text-[#A4AA93]">
        ANTES (Llegada)
      </div>

      <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#AA8B63]/90 backdrop-blur-md border border-[#FAF0E2]/30 text-[11px] font-mono font-bold text-[#161811] flex items-center gap-1.5 shadow-lg">
        <Sparkles className="h-3 w-3" />
        <span>DESPUÉS (Look SOUVA)</span>
      </div>

      {/* Subtle overlay helper */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#161811]/75 backdrop-blur-md text-[10px] font-mono text-[#FAF0E2]/80 border border-[#FAF0E2]/10">
        Transformación real · Pelaje desenredado, sedoso y perfumado
      </div>
    </div>
  );
}
