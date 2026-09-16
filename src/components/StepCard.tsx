import { useRef } from "react";

export function StepCard({
  num,
  icon,
  title,
  desc,
  delay = "0s",
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current?.querySelector(".step-card__inner") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      className="step-card"
      style={{ "--card-delay": delay } as React.CSSProperties}
      onMouseMove={onMove}
    >
      <div className="step-card__inner">
        <div className="step-card__content">
          <div className="flex items-center gap-3 mb-4">
            <div className="step-card__num font-display">{num}</div>
            <div className="step-card__icon text-[#AA8B63]">{icon}</div>
          </div>
          <div className="step-card__title">{title}</div>
          <div className="step-card__desc">{desc}</div>
        </div>
      </div>
    </div>
  );
}
