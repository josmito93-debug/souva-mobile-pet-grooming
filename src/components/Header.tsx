import { useState, useEffect } from "react";
import {
  Phone,
  MapPin,
  Menu,
  X,
  Calendar,
  Sparkles,
  Scissors,
  Users,
  ShieldCheck,
  Camera,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onBookClick: () => void;
}

export function Header({ onBookClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Book Now", href: "#book", action: onBookClick, icon: Calendar, highlight: true },
    { label: "Servicios y Precios", href: "#services", icon: Scissors },
    { label: "Quiénes Somos", href: "#about", icon: Users },
    { label: "Áreas que Atendemos", href: "#coverage", icon: MapPin },
    { label: "Galería", href: "#gallery", icon: Camera },
    { label: "Reviews", href: "#reviews", icon: Star },
    { label: "+1 (850) 960-0034", href: "tel:+18509600034", icon: Phone },
  ];

  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR ─────────────────────────────────────── */}
      <div className="bg-[#10120B] border-b border-[#FAF0E2]/10 py-1.5 px-4 text-[11px] font-mono text-[#A4AA93] flex items-center justify-between relative z-50 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 mx-auto max-w-7xl w-full justify-between">
          {/* Promo Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#AA8B63]/20 border border-[#AA8B63]/40 text-[#FAF0E2] text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Sparkles className="h-3 w-3 text-[#AA8B63]" />
              <span>Descuento 20%</span>
            </span>
            <span className="text-[#FAF0E2] font-medium truncate">
              20% de descuento en el segundo perro · 2 Dogs Special Offer
            </span>
          </div>

          {/* Location & Direct Phone */}
          <div className="flex items-center gap-4 text-[10.5px] shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[#A4AA93]">
              <MapPin className="h-3 w-3 text-[#AA8B63]" />
              <span>San Francisco Bay Area & Peninsula</span>
            </span>
            <a
              href="tel:+18509600034"
              className="inline-flex items-center gap-1.5 text-[#AA8B63] hover:text-[#FAF0E2] font-bold font-mono transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>+1 (850) 960-0034</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── STICKY MAIN NAVBAR ───────────────────────────────────────── */}
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8 bg-[#14160F]/95 backdrop-blur-md border-b border-[#FAF0E2]/10 shadow-lg">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="cursor-pointer">
            <SouvaLogo />
          </a>

          {/* Desktop Location Badge */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C2016] border border-[#FAF0E2]/10 text-[10px] font-mono text-[#A4AA93]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SF & Peninsula</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-medium text-[#FAF0E2]/80">
          <button
            type="button"
            onClick={onBookClick}
            className="hover:text-[#AA8B63] transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[#FAF0E2]"
          >
            <span>Book Now</span>
          </button>
          <a href="#services" className="hover:text-[#AA8B63] transition-colors">
            Servicios y Precios
          </a>
          <a href="#about" className="hover:text-[#AA8B63] transition-colors">
            Quiénes Somos
          </a>
          <a href="#coverage" className="hover:text-[#AA8B63] transition-colors flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#AA8B63]" />
            <span>Áreas que Atendemos</span>
          </a>
          <a href="#gallery" className="hover:text-[#AA8B63] transition-colors">
            Galería
          </a>
          <a href="#reviews" className="hover:text-[#AA8B63] transition-colors">
            Reviews
          </a>
        </nav>

        {/* Action Controls & Phone */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Phone Call Link */}
          <a
            href="tel:+18509600034"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#FAF0E2]/15 bg-[#25281D] px-3.5 py-1.5 text-xs font-mono font-bold text-[#FAF0E2] hover:border-[#AA8B63]/60 transition-colors shadow-sm"
            title="Call SOUVA Concierge"
          >
            <Phone className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>+1 (850) 960-0034</span>
          </a>

          {/* Book Now Primary Button */}
          <button
            type="button"
            onClick={onBookClick}
            className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-full bg-[#AA8B63] text-[#161811] hover:bg-[#C4A67E] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>BOOK NOW</span>
          </button>

          {/* Hamburger Menu Toggle Button (Mobile & Tablet) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-xl border border-[#FAF0E2]/15 bg-[#202419] text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE HAMBURGER MENU DRAWER ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[90vh] bg-[#14160E] border-t border-[#FAF0E2]/15 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#FAF0E2]/10 flex items-center justify-between bg-[#191D13]">
              <SouvaLogo showSubtitle={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="h-9 w-9 rounded-full bg-[#25281D] border border-[#FAF0E2]/10 flex items-center justify-center text-[#FAF0E2] hover:text-[#AA8B63] cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Promo Banner */}
              <div className="p-3.5 rounded-2xl bg-[#202418] border border-[#AA8B63]/40 shadow-inner">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-[#AA8B63]" />
                  <span className="font-display font-bold text-xs text-[#FAF0E2]">
                    Descuento de 20% en 2 Perros
                  </span>
                </div>
                <p className="text-[11px] text-[#A4AA93] leading-relaxed">
                  ¿Tienes dos compañeros caninos? Recibe un 20% de descuento en el servicio de tu segundo perro al reservar juntos.
                </p>
              </div>

              {/* Location Badge */}
              <div className="p-3 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 flex items-center gap-2.5 text-xs text-[#FAF0E2]">
                <MapPin className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <div>
                  <span className="font-mono text-[10px] text-[#A4AA93] uppercase block">Área de Cobertura:</span>
                  <strong className="font-medium text-[#FAF0E2]">San Francisco Bay Area & Peninsula</strong>
                </div>
              </div>

              {/* Navigation Links List */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] px-2 block mb-1">
                  Menú Principal
                </span>
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-colors text-sm font-medium",
                        item.highlight
                          ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                          : "bg-[#1B1E15] text-[#FAF0E2] hover:bg-[#25281D] hover:text-[#AA8B63]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={cn("h-4 w-4", item.highlight ? "text-[#161811]" : "text-[#AA8B63]")} />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-70" />
                    </a>
                  );
                })}
              </div>

              {/* Quick Contact Buttons */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] px-2 block">
                  Contacto Directo
                </span>
                <a
                  href="tel:+18509600034"
                  className="w-full py-3 px-4 rounded-xl bg-[#25281D] border border-[#FAF0E2]/15 text-[#FAF0E2] text-xs font-mono font-bold flex items-center justify-center gap-2 hover:border-[#AA8B63] transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#AA8B63]" />
                  <span>Llamar: +1 (850) 960-0034</span>
                </a>

                <a
                  href="https://wa.me/18509600034?text=Hello%20Souva%20Mobile%20Grooming%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment!"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-black text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>

              <div className="text-center pt-2 text-[10px] font-mono text-[#A4AA93]/60">
                Horario: Lunes a Domingo · 8:30 AM – 7:00 PM
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
