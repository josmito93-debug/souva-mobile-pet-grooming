import React from "react";
import { cn } from "@/lib/utils";

/**
 * Pixel-perfect Official WhatsApp Brand Icon.
 * Supports:
 * - "badge": Official green gradient disc with white WhatsApp bubble & handset
 * - "monochrome": Uses currentColor for flexible styling inside gold, dark, or white buttons
 */
export function WhatsAppIcon({
  className,
  variant = "badge",
}: {
  className?: string;
  variant?: "badge" | "monochrome";
}) {
  if (variant === "badge") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-6 h-6 shrink-0 filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.4)]", className)}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waGreenGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2FEB6F" />
            <stop offset="1" stopColor="#20BA5A" />
          </linearGradient>
          <radialGradient id="waInnerGlow" cx="50%" cy="30%" r="50%">
            <stop stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Circular Green Badge */}
        <circle cx="16" cy="16" r="14" fill="url(#waGreenGrad)" />
        <circle cx="16" cy="16" r="14" fill="url(#waInnerGlow)" />

        {/* WhatsApp Speech Bubble & Handset in Crisp White */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 7C11.03 7 7 11.03 7 16c0 1.6.42 3.1 1.15 4.41L7 25l4.74-1.24A8.93 8.93 0 0016 25c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 1.5c4.14 0 7.5 3.36 7.5 7.5s-3.36 7.5-7.5 7.5a7.44 7.44 0 01-3.84-1.07l-.27-.16-2.85.75.76-2.78-.18-.28A7.44 7.44 0 018.5 16c0-4.14 3.36-7.5 7.5-7.5zm-3.23 3.12c-.17 0-.47.06-.72.33-.24.27-.94.92-.94 2.25s.96 2.61 1.1 2.8c.13.18 1.89 2.89 4.58 4.05.64.28 1.14.44 1.53.57.64.2 1.23.18 1.69.11.52-.08 1.59-.65 1.81-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32-.27-.14-1.59-.78-1.84-.87-.24-.09-.42-.14-.6.14-.18.27-.69.87-.85 1.06-.16.18-.31.2-.58.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.6-1.45-.82-1.99-.22-.53-.44-.46-.6-.47-.16-.01-.34-.01-.51-.01z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Monochrome SVG version
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-3.53 3.43c-.19 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01" />
    </svg>
  );
}

/**
 * Luxury Concierge Phone Call Icon.
 * Premium curved telephone handset with elegant active audio wave indicators.
 */
export function PhoneConciergeIcon({
  className,
  showWaves = true,
}: {
  className?: string;
  showWaves?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      {/* Handset Receiver Body */}
      <path
        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      />

      {/* Luxury Signal Waves (Audio / Concierge connection) */}
      {showWaves && (
        <>
          <path
            d="M15.5 3.5a6.5 6.5 0 015 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="opacity-60"
          />
          <path
            d="M14 7a3 3 0 013 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="opacity-90"
          />
        </>
      )}
    </svg>
  );
}
