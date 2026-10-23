import { useState, useEffect } from "react";
import { ShieldCheck, Sparkles, Check, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const CONSENT_STORAGE_KEY = "souva_consent_mode";

export function CookieConsentBanner({ onOpenTerms }: { onOpenTerms?: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a consent decision
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        // Small delay so the page loads smoothly before the banner appears
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Listen for custom trigger from footer or settings to reopen preferences
  useEffect(() => {
    const handleReopen = () => setIsVisible(true);
    window.addEventListener("souva_open_cookie_settings", handleReopen);
    return () => window.removeEventListener("souva_open_cookie_settings", handleReopen);
  }, []);

  const handleAcceptAll = () => {
    try {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
        });
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    } catch (e) {
      console.warn("Consent storage note:", e);
    }
    setIsVisible(false);
  };

  const handleNecessaryOnly = () => {
    try {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
        });
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    } catch (e) {
      console.warn("Consent storage note:", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14160E]/95 backdrop-blur-2xl border-2 border-[#AA8B63]/40 shadow-[0_16px_50px_rgba(0,0,0,0.85)] text-[#FAF0E2] relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#AA8B63]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#272E1D] to-[#181C12] border border-[#AA8B63]/40 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1C2216] border border-[#AA8B63]/30 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] text-[9px] font-mono uppercase tracking-[0.14em] text-[#AA8B63] font-bold">
                <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                <span>Google Consent Mode v2</span>
              </div>
              <h3 className="font-display font-bold text-base text-[#FAF0E2] tracking-tight mt-0.5">
                Cookie & Privacy Choices
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNecessaryOnly}
            className="h-7 w-7 rounded-full bg-[#202517] hover:bg-[#AA8B63] text-[#A4AA93] hover:text-[#161811] flex items-center justify-center transition-colors cursor-pointer border border-[#FAF0E2]/10"
            title="Dismiss with necessary cookies only"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[#A4AA93] leading-relaxed mt-3 relative z-10">
          We use essential cookies and Google Measurement signals to secure your doorstep booking, analyze route performance, and personalize pet care communications.
        </p>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10 flex flex-wrap items-center justify-between gap-2.5 relative z-10">
          {onOpenTerms ? (
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-[11px] font-mono text-[#A4AA93] hover:text-[#FAF0E2] hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#A4AA93] flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>100% Privacy Compliant</span>
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleNecessaryOnly}
              className="px-3 py-1.5 rounded-full bg-[#202517] hover:bg-[#2A301E] text-xs font-mono font-medium text-[#FAF0E2] border border-[#FAF0E2]/15 transition-colors cursor-pointer"
              title="Decline non-essential cookies"
            >
              Necessary Only
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811] font-rounded font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Accept all cookies and analytics signals"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
