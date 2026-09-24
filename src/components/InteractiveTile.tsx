import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function InteractiveTile({
  className,
  children,
  beamColor = "170, 139, 99",
  live = false,
  enableSparks = false,
  enableTilt = false,
  celebrate = 0,
}: {
  className?: string;
  children: React.ReactNode;
  beamColor?: string;
  live?: boolean;
  enableSparks?: boolean;
  enableTilt?: boolean;
  celebrate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /* Cursor spotlight (+ optional tilt) */
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (enableTilt && !reduced.current) {
      el.style.setProperty("--rx", `${((0.5 - y / r.height) * 5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x / r.width - 0.5) * 5).toFixed(2)}deg`);
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  /* Spark factory */
  const spawnSpark = (xPct: number, yPct: number, dx: number, dy: number, life: number) => {
    const el = ref.current;
    if (!el || reduced.current) return;
    const s = document.createElement("span");
    s.className = "spark";
    s.style.left = `${xPct}%`;
    s.style.top = `${yPct}%`;
    s.style.setProperty("--dx", `${dx.toFixed(1)}px`);
    s.style.setProperty("--dy", `${dy.toFixed(1)}px`);
    s.style.setProperty("--life", `${life.toFixed(2)}s`);
    s.addEventListener("animationend", () => s.remove());
    el.appendChild(s);
  };

  /* Ambient sparks: a soft drip from corners */
  useEffect(() => {
    if (!enableSparks || reduced.current) return;
    const corners = [
      [6, 6], [94, 6], [6, 94], [94, 94],
    ] as const;
    const id = setInterval(() => {
      if (document.hidden || !ref.current) return;
      if (ref.current.querySelectorAll(".spark").length > 6) return;
      const [x, y] = corners[Math.floor(Math.random() * corners.length)];
      const a = Math.random() * Math.PI * 2;
      const d = 16 + Math.random() * 26;
      spawnSpark(x, y, Math.cos(a) * d, Math.sin(a) * d - 12, 1 + Math.random() * 0.6);
    }, 700);
    return () => clearInterval(id);
  }, [enableSparks]);

  /* Corner discharge celebration */
  useEffect(() => {
    if (!celebrate || reduced.current) return;
    const el = ref.current;
    if (!el) return;
    const corners = [
      [95, 5], [95, 95], [5, 95], [5, 5],
    ] as const;
    corners.forEach(([x, y], i) => {
      setTimeout(() => {
        if (!ref.current) return;
        const f = document.createElement("span");
        f.className = "c-flash";
        f.style.left = `${x}%`;
        f.style.top = `${y}%`;
        f.addEventListener("animationend", () => f.remove());
        ref.current.appendChild(f);
        const sx = x < 50 ? 1 : -1;
        const sy = y < 50 ? 1 : -1;
        for (let k = 0; k < 3; k++) {
          spawnSpark(
            x, y,
            sx * (12 + Math.random() * 30) + (Math.random() - 0.5) * 12,
            sy * (12 + Math.random() * 30) + (Math.random() - 0.5) * 12,
            0.8 + Math.random() * 0.4,
          );
        }
      }, i * 110);
    });
  }, [celebrate]);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("tile w-full max-w-full min-w-0 box-border", live && "is-live", className)}
      style={
        {
          "--tile-beam": beamColor,
          transform: enableTilt
            ? "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))"
            : undefined,
        } as React.CSSProperties
      }
    >
      <span className="t-glow" aria-hidden="true" />
      <div className="relative z-10 w-full min-w-0 max-w-full">
        {children}
      </div>
    </div>
  );
}
