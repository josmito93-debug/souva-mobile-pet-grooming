import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Sparkles,
  MapPin,
  Phone,
  Shield,
  Clock,
  Truck,
  Heart,
  Scissors,
  Check,
  Star,
  Calendar,
  Instagram,
  Facebook,
  ChevronRight,
  Droplets,
  Award,
  ShoppingBag,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { InteractiveTile } from "@/components/InteractiveTile";
import { GroomingFlow } from "@/components/GroomingFlow";
import { StepCard } from "@/components/StepCard";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { StoreSection } from "@/components/StoreSection";
import { CartDrawer } from "@/components/CartDrawer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { CartProvider, useCart } from "@/lib/cartContext";
import { SOUVA_PACKAGES } from "@/data/services";
import { cn } from "@/lib/utils";

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<"site" | "admin">(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.pathname.startsWith("/admin") ||
        window.location.search.includes("admin")
      ) {
        return "admin";
      }
    }
    return "site";
  });

  const [loading, setLoading] = useState(true);
  const [flowStatus, setFlowStatus] = useState({ armed: false, dispatched: false });
  const [burst, setBurst] = useState(0);
  const prevDispatched = useRef(false);

  useEffect(() => {
    const onLocationChange = () => {
      if (
        window.location.pathname.startsWith("/admin") ||
        window.location.search.includes("admin")
      ) {
        setCurrentView("admin");
      } else {
        setCurrentView("site");
      }
    };
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, "", "/admin");
    setCurrentView("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToSite = () => {
    window.history.pushState({}, "", "/");
    setCurrentView("site");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (flowStatus.dispatched && !prevDispatched.current) {
      setBurst((b) => b + 1);
    }
    prevDispatched.current = flowStatus.dispatched;
  }, [flowStatus.dispatched]);

  const beamColor = flowStatus.dispatched
    ? "214, 185, 142"
    : flowStatus.armed
    ? "240, 215, 175"
    : "170, 139, 99";

  // If in admin view, render the AdminDashboard
  if (currentView === "admin") {
    return <AdminDashboard onBackToSite={navigateToSite} />;
  }

  // High-end GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Preloader badge draw & glow
      tl.from(".preloader-badge", {
        opacity: 0,
        scale: 0.85,
        rotation: -10,
        duration: 0.8,
        ease: "power3.out",
      });

      tl.fromTo(
        ".preloader-glow",
        { opacity: 0, scale: 0.7 },
        { opacity: 0.6, scale: 1.3, duration: 0.8, ease: "power2.out" },
        "<"
      );

      // 2. Slide up curtain
      tl.to(".preloader", {
        yPercent: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power4.inOut",
      }, "+=0.2");

      // 3. Reveal elements
      tl.fromTo(
        ".app-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

      tl.fromTo(
        ".hero-left-content",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.4"
      );

      tl.fromTo(
        ".hero-right-content",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => setLoading(false),
        },
        "-=0.5"
      );
    });

    return () => ctx.revert();
  }, []);

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#161811] text-[#FAF0E2] flex flex-col justify-between selection:bg-[#AA8B63]/40 selection:text-[#FAF0E2]">
      {/* GSAP Preloader Overlay */}
      {loading && (
        <div className="preloader fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#13150F] overflow-hidden select-none">
          <div className="relative flex items-center justify-center max-w-[280px] w-full px-6">
            <div className="preloader-glow absolute inset-0 bg-[#AA8B63]/25 blur-3xl rounded-full w-52 h-52 mx-auto" />
            <img
              src="/assets/souva-badge-circle-transparent.png"
              alt="SOUVA"
              className="preloader-badge w-36 h-36 object-contain relative z-10 shadow-2xl"
            />
          </div>
          <div className="mt-8 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#AA8B63] uppercase">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#AA8B63] animate-pulse" />
              <span>SOUVA · MOBILE PET GROOMING</span>
            </div>
            <span className="text-[8.5px] text-[#A4AA93] tracking-widest opacity-80">
              PREPARANDO EXPERIENCIA DE SPA EN TU PUERTA
            </span>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Header */}
      <Header onBookClick={scrollToHero} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* HERO SECTION WITH THE COCKPIT MODAL */}
        <section className="relative isolate px-4 py-8 md:py-12 md:px-8 flex-1 flex flex-col justify-center w-full overflow-hidden">
          <div className="hero-spa-ambient" aria-hidden="true" />
          <div className="hero-gold-glow" aria-hidden="true" />

          {/* Floating Luxury Spa Bubbles */}
          <div className="spa-bubbles-grid">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" stroke="rgba(170, 139, 99, 0.14)" strokeWidth="1.2">
                <circle cx="10%" cy="20%" r="28" strokeDasharray="4 4" />
                <circle cx="12%" cy="22%" r="14" />
                <circle cx="88%" cy="15%" r="35" strokeDasharray="6 6" />
                <circle cx="92%" cy="30%" r="18" />
                <circle cx="50%" cy="8%" r="22" stroke="rgba(250, 240, 226, 0.1)" />
                <circle cx="20%" cy="85%" r="40" strokeDasharray="5 5" />
                <circle cx="82%" cy="88%" r="30" />
              </g>
            </svg>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Side: Brand Story & Value Prop */}
              <div className="hero-left-content lg:col-span-5 flex flex-col justify-between py-2 space-y-6">
                <div>
                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#FAF0E2]/15 bg-[#202419]/80 backdrop-blur-md px-4 py-1.5 text-xs font-medium tracking-wide text-[#FAF0E2]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FAF0E2]" />
                    </span>
                    <span>Austin & Central Texas · Spa Móvil Activo</span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-[#FAF0E2]">
                    Your pet's mobile
                    <br />
                    <span className="text-gradient-gold">pampering parlor.</span>
                  </h1>

                  <p className="mt-4 text-base md:text-lg text-[#E2D7C5] font-serif italic">
                    Luxury Grooming, Right at Your Doorstep.
                  </p>

                  <p className="mt-3 text-sm md:text-[15px] text-[#A4AA93] leading-relaxed max-w-md">
                    El spa canino que llega directo a tu casa. Sin jaulas, sin esperas
                    angustiantes y con estilistas dedicados 1 a 1 para consentir a tu
                    peludo con agua tibia ozonizada y productos botánicos de alta gama.
                  </p>

                  {/* Quick Highlight Image */}
                  <div className="mt-6 flex items-center gap-3 p-2.5 rounded-2xl bg-[#1E2217]/70 border border-[#FAF0E2]/10 max-w-md">
                    <img
                      src="/assets/souva-hero-dog.png"
                      alt="Golden Retriever en Van SOUVA"
                      className="h-16 w-20 object-cover rounded-xl border border-[#FAF0E2]/15"
                    />
                    <div className="text-xs">
                      <div className="font-display font-bold text-[#FAF0E2] flex items-center gap-1.5">
                        <span>Experiencia 100% Sin Estrés</span>
                        <Heart className="h-3 w-3 text-[#AA8B63] fill-[#AA8B63]" />
                      </div>
                      <p className="text-[11px] text-[#A4AA93] mt-0.5">
                        Van totalmente autónoma: no conectamos agua ni electricidad de tu hogar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-5 border-t border-[#FAF0E2]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#A4AA93]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full dot-success" />
                    <span>Llegamos a tu Puerta</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-[#AA8B63]" />
                    <span>Asegurados & Certificados</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-[#AA8B63]" />
                    <span>Cosmética Orgánica</span>
                  </span>
                </div>
              </div>

              {/* Right Side: The Interactive Cockpit Card */}
              <div className="hero-right-content lg:col-span-7 flex flex-col justify-center">
                <div className="relative w-full max-w-xl mx-auto lg:mr-0">
                  <div
                    className={cn(
                      "absolute -inset-3 blur-3xl rounded-[3rem] transition-colors duration-700",
                      flowStatus.dispatched ? "bg-[#AA8B63]/25" : "bg-[#AA8B63]/10"
                    )}
                  />

                  {/* Cockpit Card Container */}
                  <InteractiveTile
                    beamColor={beamColor}
                    live={flowStatus.dispatched}
                    celebrate={burst}
                    enableSparks={flowStatus.dispatched}
                    className="p-5 sm:p-7"
                  >
                    <GroomingFlow onStatus={setFlowStatus} />
                  </InteractiveTile>
                </div>
              </div>
            </div>

            {/* Premium Step-by-Step Bento Cards */}
            <div className="mt-16 sm:mt-20 border-t border-[#FAF0E2]/10 pt-10">
              <div className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase mb-6 text-center">
                {"// CÓMO FUNCIONA // TRES PASOS HACIA EL SPA EN TU PUERTA"}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    n: "01",
                    icon: <Scissors className="h-5 w-5" />,
                    t: "Personaliza en el Blueprint",
                    d: "Selecciona el tamaño de tu perro, toca las zonas a cuidar y adjunta su foto opcional para evaluación.",
                    delay: "0s",
                  },
                  {
                    n: "02",
                    icon: <Sparkles className="h-5 w-5" />,
                    t: "Elige su Paquete de Mimos",
                    d: "Desde baño con aromaterapia de avena hasta mascarilla de arándanos y cepillado dental enzimático.",
                    delay: "1.5s",
                  },
                  {
                    n: "03",
                    icon: <Truck className="h-5 w-5" />,
                    t: "Fija tu Ubicación & Llega la Van",
                    d: "Usa GPS o tu dirección. Nuestra van de última generación estaciona en tu puerta lista para consentir.",
                    delay: "3s",
                  },
                ].map((s) => (
                  <StepCard key={s.n} num={s.n} icon={s.icon} title={s.t} desc={s.d} delay={s.delay} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* E-COMMERCE BOUTIQUE & COSMETICS LINE */}
        <StoreSection />

        {/* SERVICES SECTION */}
        <section id="services" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#191C13]/60 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
                {"// SERVICIOS EXCLUSIVOS DE SPA MÓVIL //"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF0E2]">
                Tratamientos de Grooming en tu Puerta
              </h2>
              <p className="mt-3 text-[#A4AA93] text-sm md:text-base leading-relaxed">
                Diseñados para brindar el máximo confort y brillo sedoso a tu mascota,
                empleando únicamente productos ecológicos hipoalergénicos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SOUVA_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={cn(
                    "p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative group",
                    pkg.popular
                      ? "bg-[#22261A] border-[#AA8B63]/60 shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:border-[#AA8B63]"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                  )}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#AA8B63] text-[#161811] text-[10px] font-bold font-mono uppercase tracking-wider">
                      Más Elegido
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-[#A4AA93] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
                        {pkg.duration}
                      </span>
                      <span className="font-display font-bold text-lg text-[#FAF0E2]">
                        {pkg.priceRange}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#A4AA93] mt-1 mb-5">
                      {pkg.tagline}
                    </p>

                    <ul className="space-y-2 text-xs text-[#FAF0E2]/90 border-t border-[#FAF0E2]/10 pt-4">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#AA8B63] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToHero}
                    className="mt-6 w-full py-2.5 rounded-xl border border-[#AA8B63]/40 bg-[#AA8B63]/10 text-xs font-bold text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Reservar Servicio</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEFORE & AFTER TRANSFORMATION SHOWCASE */}
        <section id="before-after" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
              {"// THE SOUVA EXPERIENCE //"}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF0E2]">
              Antes y Después de Cada Sesión
            </h2>
            <p className="mt-3 text-[#A4AA93] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
              Observa el cambio de un pelaje apagado a un look brillante, limpio,
              esponjoso y libre de enredos.
            </p>

            <BeforeAfterSlider />
          </div>
        </section>

        {/* SALON GALLERY & FLEET HIGHLIGHTS */}
        <section id="gallery" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#181B13]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
                {"// NUESTRAS INSTALACIONES MÓVILES //"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF0E2]">
                Tecnología de Vanguardia & Cuidado Amoroso
              </h2>
              <p className="mt-3 text-[#A4AA93] text-sm leading-relaxed">
                Cada van SOUVA cuenta con aire acondicionado independiente, mesa hidráulica
                ergonómica, secador silencioso de temperatura controlada y agua tibia desinfectada.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-salon-interior.png"
                    alt="Interior de la Van Móvil SOUVA"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Interior Climatizado & Seguro
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Mesa hidráulica de precisión y bañera en acero inoxidable que garantiza comodidad absoluta para mascotas de cualquier edad.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-products.png"
                    alt="Productos de Estética Canina SOUVA"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Línea Exclusiva de Cosmética
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Champús de avena, acondicionadores desenredantes y bálsamo reparador formulados sin parabenos, sulfatos ni aromas sintéticos irritantes.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-van-profile.png"
                    alt="Van Móvil SOUVA Wrap"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Flota de Spa 100% Autónoma
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Nuestras unidades van equipadas con generador silencioso inversor y tanques de agua limpia y residual, sin conectarse a tu casa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="reviews" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#161811]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
                {"// LO QUE DICEN NUESTROS CLIENTES //"}
              </span>
              <h2 className="font-display text-3xl font-bold text-[#FAF0E2]">
                Amados por Mascotas & Familias
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  author: "María L. & Toby (Golden Retriever)",
                  text: "¡Mi perro quedó perfecto! Antes odiaba ir a la peluquería tradicional porque se ponía nervioso en la jaula. Con SOUVA lo atienden justo frente a nuestra casa con paciencia infinita.",
                  stars: 5,
                  city: "Austin, TX",
                },
                {
                  author: "Carlos D. & Luna (Caniche Toy)",
                  text: "El corte a tijera quedó impecable y el aroma de su champú dura semanas. La puntualidad de la van y la facilidad de reservar por el modal fue de 10.",
                  stars: 5,
                  city: "Pflugerville, TX",
                },
                {
                  author: "Elena R. & Thor (Bulldog Francés)",
                  text: "Excelente servicio para perros con piel delicada. El bálsamo en sus almohadillas y la limpieza facial de arándanos le dejó la cara limpia sin irritar sus pliegues.",
                  stars: 5,
                  city: "Round Rock, TX",
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-[#FAF0E2]/10 bg-[#1D2016] shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3 text-[#AA8B63]">
                      {Array.from({ length: rev.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#E2D7C5] leading-relaxed italic">
                      "{rev.text}"
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#FAF0E2]/5 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-[#FAF0E2]">{rev.author}</h5>
                      <span className="text-[10.5px] text-[#A4AA93] font-mono">{rev.city}</span>
                    </div>
                    <Check className="h-4 w-4 text-[#AA8B63]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA STRIP */}
        <section className="py-12 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-gradient-to-r from-[#21261B] via-[#2A3022] to-[#1E2216]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#FAF0E2]">
                ¿Listo para consentir a tu peludo?
              </h3>
              <p className="text-sm text-[#A4AA93] mt-1">
                Agenda tu cita VIP en 60 segundos con nuestro selector interactivo en la cabecera.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToHero}
              className="px-8 py-3.5 rounded-2xl btn-luxury font-bold text-xs tracking-wider cursor-pointer shadow-xl shrink-0"
            >
              Pedir Van a Mi Puerta
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={navigateToAdmin} />
    </div>
  );
}

/* -------------------- HEADER COMPONENT -------------------- */
function Header({ onBookClick }: { onBookClick: () => void }) {
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <SouvaLogo />
      </div>

      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#FAF0E2]/80">
        <a href="#store" className="hover:text-[#AA8B63] transition-colors flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-[#AA8B63]" />
          <span>Boutique & Cosmética</span>
        </a>
        <a href="#services" className="hover:text-[#AA8B63] transition-colors">
          Servicios Móviles
        </a>
        <a href="#before-after" className="hover:text-[#AA8B63] transition-colors">
          Antes & Después
        </a>
        <a href="#gallery" className="hover:text-[#AA8B63] transition-colors">
          La Van & Spa
        </a>
        <a href="#reviews" className="hover:text-[#AA8B63] transition-colors">
          Testimonios
        </a>
      </nav>

      <div className="flex items-center gap-3">
        {/* Shopping Cart Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative p-2 rounded-full bg-[#25281D] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:border-[#AA8B63] transition-colors cursor-pointer shadow-sm"
          aria-label="Abrir Carrito"
        >
          <ShoppingBag className="h-4 w-4 text-[#AA8B63]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AA8B63] text-[#161811] text-[9.5px] font-bold flex items-center justify-center shadow-md">
              {totalItems}
            </span>
          )}
        </button>

        <a
          href="tel:+18509600034"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#FAF0E2]/15 bg-[#25281D] px-3.5 py-1.5 text-xs font-mono font-bold text-[#FAF0E2] hover:border-[#AA8B63]/60 transition-colors"
        >
          <Phone className="h-3.5 w-3.5 text-[#AA8B63]" />
          <span>+1 (850) 960-0034</span>
        </a>

        <button
          type="button"
          onClick={onBookClick}
          className="px-4 py-2 text-xs font-bold font-mono tracking-wide rounded-full bg-[#AA8B63] text-[#161811] hover:bg-[#C4A67E] transition-colors cursor-pointer shadow-md"
        >
          RESERVAR
        </button>
      </div>
    </header>
  );
}

/* -------------------- FOOTER COMPONENT -------------------- */
function Footer({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return (
    <footer className="px-5 py-8 md:px-8 border-t border-[#FAF0E2]/10 text-[11px] font-mono text-[#A4AA93] bg-[#14160F]">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#FAF0E2] uppercase tracking-wider text-xs">
              SOUVA MOBILE PET GROOMING
            </span>
            <span className="text-[#AA8B63]">♥</span>
          </div>
          <p className="text-[#A4AA93] text-[10px]">
            "Nuestro amor por los peludos, entregado en tu puerta."
          </p>
          <span className="text-[10px] text-[#A4AA93]/60">
            © {new Date().getFullYear()} SOUVA Pet Grooming LLC. Todos los derechos reservados.
          </span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-[10px] text-[#A4AA93]/50 hover:text-[#AA8B63] transition-colors flex items-center gap-1.5 mt-2 cursor-pointer text-left w-fit"
          >
            <Shield className="h-3 w-3" />
            <span>Portal Dueños / Despacho & Mapa (/admin)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              CONTACTO / WHATSAPP
            </span>
            <a href="tel:+18509600034" className="text-[#FAF0E2] hover:text-[#AA8B63] transition-colors">
              +1 (850) 960-0034
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              HORARIO DE ATENCIÓN
            </span>
            <span className="text-[#FAF0E2]">Lunes a Sábado: 8:00 AM - 7:00 PM</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              ZONA DE COBERTURA
            </span>
            <span className="text-[#FAF0E2]">Austin · Pflugerville · Round Rock · Cedar Park</span>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#1F2318] border border-[#FAF0E2]/10 hover:border-[#AA8B63] text-[#FAF0E2] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#1F2318] border border-[#FAF0E2]/10 hover:border-[#AA8B63] text-[#FAF0E2] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
