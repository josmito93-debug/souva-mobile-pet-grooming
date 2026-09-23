import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Calendar,
  CheckCircle2,
  Instagram,
  Facebook,
  MessageCircle,
  ArrowRight,
  FileText,
  Scissors,
  Check,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { TermsModal } from "@/components/TermsModal";
import { COVERED_ZIP_CODES } from "@/data/coverage";

interface FooterProps {
  onOpenAdmin: () => void;
  onBookClick?: () => void;
}

export function Footer({ onOpenAdmin, onBookClick }: FooterProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="border-t border-[#FAF0E2]/15 bg-[#12140D] text-[#A4AA93] text-xs">
      {/* ── TOP PRE-FOOTER VIP NEWSLETTER STRIP ─────────────────────── */}
      <div className="border-b border-[#FAF0E2]/10 bg-gradient-to-r from-[#171A12] via-[#1D2116] to-[#151710] py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left space-y-1">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold">
                SOUVA Priority Circle
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#FAF0E2]">
              Get Priority Access to Seasonal Grooming Routes
            </h3>
            <p className="text-xs text-[#A4AA93] leading-relaxed">
              Receive early booking windows for holidays, route expansion notices for new Bay Area postcodes, and private pet care guides.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0 max-w-md">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-[#14160F] border border-[#FAF0E2]/20 rounded-2xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/40 focus:outline-none focus:border-[#AA8B63]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C4A67E] transition-all cursor-pointer shadow-lg shrink-0 flex items-center gap-1.5"
                >
                  <span>Join</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>You're on the list! Welcome to the SOUVA Priority Circle.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN MULTI-COLUMN DIRECTORY ─────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Mission Column (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <SouvaLogo />
            </div>

            <p className="text-xs text-[#E2D7C5]/85 leading-relaxed">
              The Bay Area's elevated mobile pet grooming experience. Sanctuary-grade 1-on-1 care, autonomous solar-powered mobile suites, and master scissor styling brought directly to your doorstep.
            </p>

            {/* Core Trust Badges */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#FAF0E2]">
                <Zap className="h-3.5 w-3.5 text-[#AA8B63]" />
                <span>100% Autonomous Solar Powered Vans</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#FAF0E2]">
                <Heart className="h-3.5 w-3.5 text-[#AA8B63]" />
                <span>1-on-1 Cage-Free & Crate-Free Sanctuary</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#FAF0E2]">
                <Shield className="h-3.5 w-3.5 text-[#AA8B63]" />
                <span>Licensed, Bonded & California Insured</span>
              </div>
            </div>

            {/* Official Partner Pill */}
            <div className="p-3 rounded-2xl bg-[#1A1D13] border border-[#AA8B63]/30 flex items-center justify-between gap-3 max-w-sm">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
                  Official Cosmetics Partner
                </span>
                <span className="text-xs font-display font-bold text-[#FAF0E2]">
                  Hydra® by Pet Society
                </span>
              </div>
              <img
                src="/assets/shampoo-logo-white.png"
                alt="Hydra by Pet Society Logo"
                className="h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>

          {/* Column 2: Experiences & Services (Col span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
              Grooming Experiences
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Bath & Brush Refresh
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Bath & Tidy Hygiene Trim
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Essential Full Haircut Groom
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Signature SOUVA Long Scissor Sculpt
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Asian Fusion & Teddy Bear Styling
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF0E2] transition-colors block">
                  Hydra® Colloidal Oat Spa Wash
                </a>
              </li>
              <li>
                <a href="#services" className="text-[#AA8B63] hover:underline transition-colors block font-semibold">
                  🐾 20% Multi-Dog Promotion
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Coverage & Regions (Col span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
              Service Areas
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  San Francisco (Sunset)
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  West Portal & Lake Merced
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  Daly City & Colma
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  Burlingame & Hillsborough
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  San Mateo & Foster City
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  Redwood City & Woodside
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  Palo Alto & Menlo Park
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-[#FAF0E2] transition-colors block">
                  Half Moon Bay (Coast)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations (Col span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block">
              Direct Concierge & Dispatch
            </span>

            <div className="space-y-2.5">
              <a
                href="tel:+18509600034"
                className="flex items-center gap-2.5 text-xs text-[#FAF0E2] hover:text-[#AA8B63] transition-colors font-semibold"
              >
                <Phone className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <span>+1 (850) 960-0034</span>
              </a>

              <a
                href="https://wa.me/18509600034?text=Hello%20SOUVA%20Mobile%20Grooming%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment!"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black font-mono font-bold text-xs transition-all shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Concierge</span>
              </a>

              <a
                href="mailto:info@souvagrooming.com"
                className="flex items-center gap-2.5 text-xs text-[#A4AA93] hover:text-[#FAF0E2] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <span>info@souvagrooming.com</span>
              </a>

              <div className="flex items-start gap-2.5 text-xs text-[#A4AA93] pt-1">
                <Clock className="h-4 w-4 text-[#AA8B63] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#FAF0E2] font-semibold block">Mon – Sun (7 Days)</span>
                  <span className="text-[11px]">8:30 AM – 7:00 PM PST</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10.5px] font-mono text-emerald-400 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Van Fleet: Active Route Status</span>
              </div>
            </div>

            {/* Quick Action Button */}
            {onBookClick && (
              <button
                type="button"
                onClick={onBookClick}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C4A67E] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book Appointment</span>
              </button>
            )}
          </div>
        </div>

        {/* ── MIDDLE CORPORATE & PAYMENT METHODS STRIP ───────────────── */}
        <div className="mt-12 pt-8 border-t border-[#FAF0E2]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px]">
            <span className="text-[#FAF0E2] font-medium">Accepted at Doorstep:</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Cash</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Zelle</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Visa</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Apple Pay</span>
            <span className="px-2 py-0.5 rounded bg-[#1B1E15] border border-[#FAF0E2]/10">Check</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#A4AA93]">Follow SOUVA:</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* ── BOTTOM LEGAL & COPYRIGHT BAR ──────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-[#FAF0E2]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10.5px] font-mono">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[#A4AA93]">
            <span>© {new Date().getFullYear()} SOUVA CORP. All rights reserved.</span>
            <span>•</span>
            <span className="text-[#FAF0E2]/70">California Registered Corporation</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-[#AA8B63] hover:underline cursor-pointer font-bold flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              <span>Terms & Conditions of Service (16 Articles)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-[#A4AA93]/60 hover:text-[#AA8B63] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Shield className="h-3 w-3" />
            <span>Fleet Dispatch & Owner Portal (/admin)</span>
          </button>
        </div>
      </div>

      {/* Official SOUVA CORP Terms & Conditions Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </footer>
  );
}
