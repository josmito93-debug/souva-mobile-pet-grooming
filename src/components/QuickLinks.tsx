import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Scissors,
  Sparkles,
  Shield,
  Star,
  Camera,
  Truck,
  Check,
  Copy,
  Share2,
  ExternalLink,
  ChevronRight,
  X,
  ArrowRight,
  Zap,
  Heart,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Facebook,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { WhatsAppIcon, PhoneConciergeIcon } from "@/components/BrandIcons";
import { checkCoverage, COVERED_ZIP_CODES, SUGGESTED_AREAS } from "@/data/coverage";
import { SOUVA_PACKAGES, PetSize } from "@/data/services";
import { cn } from "@/lib/utils";

interface QuickLinksProps {
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onBookClick?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onOpenTerms?: () => void;
}

export function QuickLinks({
  isModal = false,
  isOpen = true,
  onClose,
  onBookClick,
  onNavigateToSection,
  onOpenAdmin,
  onOpenTerms,
}: QuickLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipResult, setZipResult] = useState<{
    tested: boolean;
    covered: boolean;
    cityArea?: string;
    zone?: string;
  } | null>(null);
  const [showServicesList, setShowServicesList] = useState(false);

  // GSAP Entrance Choreography
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Badge & Header reveal
      tl.fromTo(
        ".ql-badge-anim",
        { opacity: 0, scale: 0.8, y: -15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );

      tl.fromTo(
        ".ql-header-text",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.3"
      );

      // VIP Action Buttons & Cards staggered cascade
      tl.fromTo(
        ".ql-stagger-item",
        { opacity: 0, y: 22, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: "power3.out",
        },
        "-=0.2"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Lock background scroll when open as modal
  useEffect(() => {
    if (isModal && isOpen) {
      document.body.style.overflow = "hidden";
    } else if (isModal) {
      document.body.style.overflow = "";
    }
    return () => {
      if (isModal) document.body.style.overflow = "";
    };
  }, [isModal, isOpen]);

  // Handle ZIP Code Check
  const handleCheckZip = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = zipInput.trim().slice(0, 5);
    if (!clean) return;

    const result = checkCoverage(clean);
    setZipResult({
      tested: true,
      covered: result.covered,
      cityArea: result.cityArea,
      zone: result.zone,
    });
  };

  const handleSelectSuggestedZip = (zip: string) => {
    setZipInput(zip);
    const result = checkCoverage(zip);
    setZipResult({
      tested: true,
      covered: result.covered,
      cityArea: result.cityArea,
      zone: result.zone,
    });
  };

  // Copy or Share Quick Links URL
  const handleCopyShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/links`
        : "https://souva-mobile-pet-grooming.vercel.app/links";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SOUVA Mobile Pet Grooming · Quick Links",
          text: "Elevated 1-on-1 Mobile Pet Grooming in San Francisco & Peninsula CA. 100% Solar-Powered Autonomous Vans.",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Ignored
    }
  };

  const handleNavigate = (sectionId: string) => {
    if (onClose) onClose();
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/#${sectionId}`;
      }
    }
  };

  const handleBookTrigger = () => {
    if (onClose) onClose();
    if (onBookClick) {
      onBookClick();
    } else {
      handleNavigate("book");
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div
      ref={containerRef}
      className={cn(
        "w-full text-[#FAF0E2] selection:bg-[#AA8B63]/40 selection:text-[#FAF0E2]",
        isModal
          ? "max-w-2xl max-h-[92vh] overflow-y-auto bg-[#14160F] border border-[#FAF0E2]/15 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative"
          : "max-w-2xl mx-auto px-4 py-8 sm:py-14"
      )}
    >
      {/* ── TOP HEADER / BRAND IDENTITY ────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6 relative">
        <div className="flex items-center gap-3.5">
          <div className="ql-badge-anim relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#AA8B63]/30 blur-xl rounded-full" />
            <img
              src="/assets/souva-badge-circle-transparent.png"
              alt="SOUVA Mobile Pet Grooming"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full shadow-[0_0_25px_rgba(170,139,99,0.4)] relative z-10"
            />
          </div>

          <div className="ql-header-text">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold">
                Official Quick Links Hub
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF0E2] tracking-tight mt-0.5">
              SOUVA Mobile Pet Spa
            </h1>
            <p className="text-xs text-[#E2D7C5]/80 mt-1 max-w-sm leading-relaxed">
              Elevated 1-on-1 mobile grooming delivered directly to your doorstep in San Francisco & the Peninsula.
            </p>
          </div>
        </div>

        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Quick Links"
            className="p-2.5 rounded-full bg-[#1F2318] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── LIVE FLEET STATUS BANNER ─────────────────────────────────── */}
      <div className="ql-stagger-item mb-5 p-3 rounded-2xl bg-gradient-to-r from-[#191D13] via-[#212619] to-[#171A11] border border-[#AA8B63]/30 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-mono font-bold text-[#FAF0E2] truncate">
              Van Fleet: Active Route Status
            </div>
            <div className="text-[10px] text-[#A4AA93] truncate">
              Operating Mon – Sun · 8:30 AM – 7:00 PM PST
            </div>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] uppercase tracking-wider shrink-0">
          38 ZIP Codes
        </span>
      </div>

      {/* ── TOP VIP PRIMARY CALL-TO-ACTION (BOOKING) ────────────────── */}
      <div className="ql-stagger-item mb-4">
        <button
          type="button"
          onClick={handleBookTrigger}
          className="w-full p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] shadow-[0_0_25px_rgba(170,139,99,0.45)] hover:shadow-[0_0_35px_rgba(170,139,99,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-11 w-11 rounded-2xl bg-[#161811] text-[#AA8B63] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5 text-[#AA8B63]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-[#161811]/80">
                  Priority Access
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#161811] text-amber-200 text-[9.5px] font-mono font-bold uppercase">
                  Fast 60s Booking
                </span>
              </div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#161811] leading-tight">
                Book Solar Mobile Van to Doorstep
              </h2>
              <p className="text-[11.5px] text-[#2C2318] font-medium leading-none mt-0.5">
                Select your pup's size, choose a spa treatment & drop your pin.
              </p>
            </div>
          </div>

          <div className="h-9 w-9 rounded-full bg-[#161811] text-[#FAF0E2] flex items-center justify-center shrink-0 ml-2 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-4 w-4 text-[#AA8B63]" />
          </div>
        </button>
      </div>

      {/* ── DUAL DIRECT CONCIERGE CHANNELS (CALL & WHATSAPP) ───────── */}
      <div className="ql-stagger-item grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Direct Phone Concierge */}
        <a
          href="tel:+18509600034"
          className="p-3.5 rounded-2xl bg-[#1E2217] border border-[#AA8B63]/40 hover:border-[#AA8B63] hover:bg-[#252B1C] transition-all flex items-center justify-between gap-3 group shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#AA8B63] to-[#826643] text-[#161811] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <PhoneConciergeIcon className="h-5 w-5 text-[#161811]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block truncate">
                Direct Phone Concierge
              </span>
              <span className="font-display font-bold text-sm text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors truncate block">
                +1 (850) 960-0034
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#AA8B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>

        {/* Official WhatsApp Concierge */}
        <a
          href="https://wa.me/18509600034?text=Hello%20SOUVA%20Mobile%20Grooming%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment!"
          target="_blank"
          rel="noreferrer"
          className="p-3.5 rounded-2xl bg-[#152318] border border-[#25D366]/40 hover:border-[#25D366] hover:bg-[#192E1D] transition-all flex items-center justify-between gap-3 group shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <WhatsAppIcon variant="badge" className="h-10 w-10 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#25D366] font-bold block truncate">
                WhatsApp Live Concierge
              </span>
              <span className="font-display font-bold text-sm text-[#FAF0E2] group-hover:text-[#25D366] transition-colors truncate block">
                Chat with Dispatch
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#25D366] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>
      </div>

      {/* ── 20% OFF MULTI-DOG PROMOTION CARD ───────────────────────── */}
      <div className="ql-stagger-item mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#0F5132]/80 via-[#15803D]/60 to-[#0F5132]/80 border border-emerald-400/40 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-yellow-300 text-stone-950 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
            🐾
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-yellow-300">
                20% OFF PROMO
              </span>
              <span className="px-1.5 py-0.2 rounded bg-yellow-300/20 text-yellow-200 text-[9px] font-mono">
                Multi-Dog Route
              </span>
            </div>
            <p className="text-xs font-sans font-bold text-white mt-0.5">
              Have 2 dogs? Get <span className="underline decoration-yellow-300 text-yellow-200">20% Off</span> your second pup's grooming!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBookTrigger}
          className="px-3.5 py-1.5 rounded-full bg-yellow-300 text-stone-950 font-sans font-black text-xs uppercase tracking-wider hover:bg-white transition-all shrink-0 cursor-pointer shadow-md"
        >
          Claim 20%
        </button>
      </div>

      {/* ── INTERACTIVE INSTANT ZIP CODE CHECKER ────────────────────── */}
      <div className="ql-stagger-item mb-5 p-4 sm:p-5 rounded-2xl bg-[#1A1D14] border border-[#FAF0E2]/15 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#AA8B63]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAF0E2]">
              Check Doorstep Service by ZIP Code
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-[#AA8B63]">
            SF & Peninsula (38 ZIPs)
          </span>
        </div>

        <p className="text-xs text-[#A4AA93] mb-3 leading-relaxed">
          Type your 5-digit ZIP code to verify if our autonomous solar van covers your address:
        </p>

        <form onSubmit={handleCheckZip} className="flex gap-2 mb-2.5">
          <input
            type="text"
            pattern="[0-9]*"
            maxLength={5}
            value={zipInput}
            onChange={(e) => {
              setZipInput(e.target.value);
              setZipResult(null);
            }}
            placeholder="e.g. 94116, 94010, 94025..."
            className="flex-1 px-3.5 py-2.5 bg-[#14160F] border border-[#FAF0E2]/20 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/35 focus:outline-none focus:border-[#AA8B63] font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C4A67E] transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Verify</span>
          </button>
        </form>

        {/* Instant Verification Feedback */}
        {zipResult && zipResult.tested && (
          <div
            className={cn(
              "p-3 rounded-xl border text-xs font-mono transition-all flex items-start gap-2.5 mb-2.5",
              zipResult.covered
                ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                : "bg-amber-950/70 border-amber-500/50 text-amber-300"
            )}
          >
            {zipResult.covered ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {zipResult.covered
                  ? `✓ Covered! SOUVA delivers to ${zipResult.cityArea || "your area"}`
                  : `ZIP ${zipInput} is currently outside our regular primary route`}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {zipResult.covered ? (
                  <span>
                    Zone: {zipResult.zone}. Our quiet solar mobile van parks right at your driveway.
                  </span>
                ) : (
                  <span>
                    Call +1 (850) 960-0034 to request a special custom route or neighborhood expansion!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-[#A4AA93]">Popular:</span>
          {SUGGESTED_AREAS.slice(0, 5).map((area) => (
            <button
              key={area.zip}
              type="button"
              onClick={() => handleSelectSuggestedZip(area.zip)}
              className="px-2 py-0.5 rounded-lg bg-[#22261A] hover:bg-[#AA8B63] hover:text-[#161811] border border-[#FAF0E2]/10 text-[10.5px] font-mono text-[#FAF0E2] transition-colors cursor-pointer"
            >
              {area.city} ({area.zip})
            </button>
          ))}
        </div>
      </div>

      {/* ── BENTO QUICK LINKS CARDS GRID ───────────────────────────── */}
      <div className="ql-stagger-item space-y-2.5 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold block mb-1">
          Explore SOUVA Mobile Pet Spa
        </span>

        {/* 1. Services & Starting Rates */}
        <div className="rounded-2xl bg-[#1A1D13] border border-[#FAF0E2]/15 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowServicesList(!showServicesList)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#202517] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#252B1C] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center shrink-0">
                <Scissors className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-[#FAF0E2] block">
                  Services & Starting Rates
                </span>
                <span className="text-[11px] text-[#A4AA93]">
                  4 Signature Experiences from $135 · Scissor styling & botanical spa
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono text-[#AA8B63]">
                {showServicesList ? "Hide" : "Preview"}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-[#AA8B63] transition-transform",
                  showServicesList && "rotate-90"
                )}
              />
            </div>
          </button>

          {showServicesList && (
            <div className="p-3.5 pt-0 border-t border-[#FAF0E2]/10 bg-[#161810] space-y-2 text-xs">
              {SOUVA_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleNavigate("services")}
                  className="p-2.5 rounded-xl bg-[#1C2016] border border-[#FAF0E2]/10 flex items-center justify-between cursor-pointer hover:border-[#AA8B63]/60 transition-colors"
                >
                  <div>
                    <div className="font-display font-bold text-[#FAF0E2]">
                      {pkg.name}
                    </div>
                    <div className="text-[10.5px] text-[#A4AA93]">
                      {pkg.duration} · {pkg.tagline}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#AA8B63] block">Starting at</span>
                    <span className="font-display font-bold text-sm text-[#FAF0E2]">
                      ${pkg.prices.small}
                    </span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleNavigate("services")}
                className="w-full py-2 rounded-xl bg-[#AA8B63]/15 text-[#AA8B63] font-mono text-xs font-bold text-center hover:bg-[#AA8B63] hover:text-[#161811] transition-all cursor-pointer"
              >
                View Full Pricing & Size Guide →
              </button>
            </div>
          )}
        </div>

        {/* 2. Before & After Transformations */}
        <button
          type="button"
          onClick={() => handleNavigate("before-after")}
          className="w-full p-3.5 rounded-2xl bg-[#1A1D13] border border-[#FAF0E2]/15 hover:border-[#AA8B63]/60 hover:bg-[#202517] transition-all flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#252B1C] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center shrink-0">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors block">
                Before & After Transformations
              </span>
              <span className="text-[11px] text-[#A4AA93]">
                Witness real transformations of Bay Area pups with interactive slider
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#AA8B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 3. Verified Client Reviews */}
        <button
          type="button"
          onClick={() => handleNavigate("reviews")}
          className="w-full p-3.5 rounded-2xl bg-[#1A1D13] border border-[#FAF0E2]/15 hover:border-[#AA8B63]/60 hover:bg-[#202517] transition-all flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#252B1C] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 fill-[#AA8B63]" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors block">
                5-Star Verified Client Reviews
              </span>
              <span className="text-[11px] text-[#A4AA93]">
                Teddy, Marcel, Bella & Winston's pet parents in SF, Burlingame & Palo Alto
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#AA8B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 4. Solar Fleet & Eco Specifications */}
        <button
          type="button"
          onClick={() => handleNavigate("gallery")}
          className="w-full p-3.5 rounded-2xl bg-[#1A1D13] border border-[#FAF0E2]/15 hover:border-[#AA8B63]/60 hover:bg-[#202517] transition-all flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#252B1C] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors block">
                100% Autonomous Solar Vans
              </span>
              <span className="text-[11px] text-[#A4AA93]">
                Zero generator fumes · Pure warm water filtration · Whisper-quiet comfort
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#AA8B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 5. Official Hydra® Botanical Cosmetics Partner */}
        <div className="p-3.5 rounded-2xl bg-[#1B1E14] border border-[#AA8B63]/30 flex items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
              Official Luxury Spa Partner
            </span>
            <span className="text-xs font-display font-bold text-[#FAF0E2]">
              Hydra® by Pet Society
            </span>
            <span className="text-[11px] text-[#A4AA93] block">
              Professional sulfate-free botanical pet shampoo & conditioner
            </span>
          </div>
          <img
            src="/assets/shampoo-logo-white.png"
            alt="Hydra Pet Society Logo"
            className="h-9 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] shrink-0"
          />
        </div>
      </div>

      {/* ── SECONDARY QUICK ACTIONS & CORPORATE LEGAL ──────────────── */}
      <div className="ql-stagger-item border-t border-[#FAF0E2]/10 pt-4 space-y-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Terms & Conditions Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              if (onOpenTerms) onOpenTerms();
            }}
            className="text-xs text-[#AA8B63] hover:underline flex items-center gap-1.5 cursor-pointer font-medium py-1"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Terms of Service (16 Articles)</span>
          </button>

          {/* Fleet Dispatch / Admin Portal */}
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              if (onOpenAdmin) {
                onOpenAdmin();
              } else {
                window.location.href = "/admin";
              }
            }}
            className="text-[11px] font-mono text-[#A4AA93] hover:text-[#FAF0E2] flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Shield className="h-3 w-3 text-[#AA8B63]" />
            <span>Fleet Dispatch & Owner Portal</span>
          </button>
        </div>
      </div>

      {/* ── SHARE & SOCIAL FOOTER ───────────────────────────────────── */}
      <div className="ql-stagger-item pt-4 border-t border-[#FAF0E2]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Social Icons */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-[#A4AA93] font-mono">Follow:</span>
          <a
            href="https://www.instagram.com/souvagrooming"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram @souvagrooming"
            className="p-2 rounded-full bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-all"
          >
            <Instagram className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://www.facebook.com/souvagrooming"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook @souvagrooming"
            className="p-2 rounded-full bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-all"
          >
            <Facebook className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Copy / Share Quick Link */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyShare}
            className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-[#1E2217] border border-[#FAF0E2]/15 hover:border-[#AA8B63] text-xs font-mono font-bold text-[#FAF0E2] hover:text-[#AA8B63] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-[#AA8B63]" />
                <span>Share Quick Links</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Corporate Copyright Note */}
      <div className="mt-5 text-center text-[10px] font-mono text-[#A4AA93]/60">
        © {new Date().getFullYear()} SOUVA CORP · California Registered Corporation · All rights reserved.
      </div>
    </div>
  );

  // If rendered as Modal
  if (isModal) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div onClick={(e) => e.stopPropagation()}>{content}</div>
      </div>
    );
  }

  // Standalone Full-Page View (for /links or /quick-links)
  return (
    <div className="min-h-screen bg-[#161811] text-[#FAF0E2] flex flex-col justify-between relative isolate overflow-x-hidden">
      {/* Subtle ambient lighting */}
      <div className="hero-spa-ambient" aria-hidden="true" />
      <div className="hero-gold-glow" aria-hidden="true" />

      {/* Top minimal bar to return home */}
      <div className="border-b border-[#FAF0E2]/10 bg-[#14160F]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between relative z-20">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <SouvaLogo showSubtitle={false} />
        </a>
        <a
          href="/"
          className="text-xs font-mono text-[#AA8B63] hover:underline flex items-center gap-1 font-bold"
        >
          <span>Visit Full Website</span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      <main className="flex-1 flex flex-col justify-center relative z-10 py-6">
        {content}
      </main>

      <footer className="border-t border-[#FAF0E2]/10 py-4 px-4 text-center text-[10.5px] font-mono text-[#A4AA93] relative z-10 bg-[#12140D]">
        SOUVA CORP · San Francisco & Peninsula Mobile Grooming · +1 (850) 960-0034
      </footer>
    </div>
  );
}

/**
 * Floating Quick Links Launcher Pill.
 * Floats discreetly on the website to give visitors fast 1-tap access.
 */
export function QuickLinksFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 left-5 z-40 px-3.5 py-2.5 rounded-full bg-[#1A1D13]/95 backdrop-blur-md border border-[#AA8B63]/40 hover:border-[#AA8B63] text-[#FAF0E2] shadow-[0_4px_25px_rgba(170,139,99,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
      title="Open SOUVA Quick Links Hub"
      aria-label="Open SOUVA Quick Links"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#AA8B63]" />
      </span>
      <Sparkles className="h-3.5 w-3.5 text-[#AA8B63] group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-mono font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors">
        Quick Links
      </span>
    </button>
  );
}
