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
  Instagram,
  Facebook,
  ChevronRight,
  Droplets,
  Zap,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { InteractiveTile } from "@/components/InteractiveTile";
import { GroomingFlow } from "@/components/GroomingFlow";
import { StepCard } from "@/components/StepCard";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { AdminDashboard } from "@/components/AdminDashboard";
import {
  SOUVA_PACKAGES,
  SPA_UPGRADES,
  ADDITIONAL_SERVICE_FEES,
  PRICING_INFORMATION,
  SIZE_GUIDE,
  type PetSize,
} from "@/data/services";
import { cn } from "@/lib/utils";

export default function App() {
  return <AppContent />;
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
  const [previewSize, setPreviewSize] = useState<PetSize>("small");
  const [flowStatus, setFlowStatus] = useState({ armed: false, dispatched: false });
  const [burst, setBurst] = useState(0);
  const prevDispatched = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const skipIntro = () => {
    if (tlRef.current) {
      tlRef.current.seek(8.0);
    }
    setLoading(false);
  };

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

  if (currentView === "admin") {
    return <AdminDashboard onBackToSite={navigateToSite} />;
  }

  // High-end GSAP entrance animations with BG Video playing until second 8
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1. Initial preloader logo badge draw (0.0s - 0.7s)
      tl.from(".preloader-badge", {
        opacity: 0,
        scale: 0.85,
        rotation: -8,
        duration: 0.7,
        ease: "power3.out",
      });

      tl.fromTo(
        ".preloader-glow",
        { opacity: 0, scale: 0.7 },
        { opacity: 0.6, scale: 1.2, duration: 0.7, ease: "power2.out" },
        "<"
      );

      // 2. Preloader curtain fades away at 0.8s so full video plays front & center
      tl.to(
        ".preloader",
        {
          opacity: 0,
          duration: 0.7,
          ease: "power3.inOut",
          onComplete: () => {
            const el = document.querySelector(".preloader") as HTMLElement | null;
            if (el) el.style.pointerEvents = "none";
          },
        },
        0.8
      );

      // 3. Background video plays until second 8.0
      tl.to(
        ".hero-bg-video",
        {
          opacity: 0.20,
          duration: 1.2,
          ease: "power2.inOut",
        },
        8.0
      );

      // 4. Hero spa atmosphere & gold glow fade in at 8.0s
      tl.fromTo(".hero-spa-ambient", { opacity: 0 }, { opacity: 1, duration: 1.0 }, 8.0);
      tl.fromTo(".hero-gold-glow", { opacity: 0 }, { opacity: 0.85, duration: 1.0 }, 8.0);

      // 5. App Header reveals at 8.1s
      tl.fromTo(
        ".app-header",
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        8.1
      );

      // 6. Hero left content reveals at 8.2s
      tl.fromTo(
        ".hero-left-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        8.2
      );

      // 7. Hero cockpit card reveals at 8.3s
      tl.fromTo(
        ".hero-right-content",
        { opacity: 0, scale: 0.93 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
          onComplete: () => setLoading(false),
        },
        8.3
      );

      // 8. Bento step cards reveal at 8.5s
      tl.fromTo(
        ".bento-steps-section",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        8.5
      );
    });

    return () => ctx.revert();
  }, []);

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#161811] text-[#FAF0E2] flex flex-col justify-between selection:bg-[#AA8B63]/40 selection:text-[#FAF0E2] relative">
      {/* Background Video */}
      <video
        className="hero-bg-video fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src="/bg-video.mp4"
        autoPlay
        muted
        playsInline
        loop
      />

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
              SAN FRANCISCO BAY AREA & SELECT EAST BAY
            </span>
          </div>
        </div>
      )}

      {/* Floating Skip Intro Button during first 8 seconds */}
      {loading && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161811]/85 backdrop-blur-md border border-[#FAF0E2]/15 text-[10.5px] font-mono text-[#FAF0E2] shadow-xl">
            <span className="h-2 w-2 rounded-full bg-[#AA8B63] animate-pulse" />
            <span>SOUVA · CINEMATIC PRESENTATION</span>
          </div>
          <button
            type="button"
            onClick={skipIntro}
            className="px-4 py-2 rounded-full bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold tracking-wider uppercase hover:bg-[#C4A67E] transition-all cursor-pointer shadow-2xl flex items-center gap-1.5"
          >
            <span>Skip Intro</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header onBookClick={scrollToHero} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
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
                  {/* Location Status Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#FAF0E2]/15 bg-[#202419]/80 backdrop-blur-md px-4 py-1.5 text-xs font-medium tracking-wide text-[#FAF0E2]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FAF0E2]" />
                    </span>
                    <span>San Francisco Bay Area and select East Bay Area CA</span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight leading-[1.12] text-[#FAF0E2]">
                    The Bay Area’s elevated{" "}
                    <span className="text-gradient-gold block mt-1">
                      mobile grooming experience
                    </span>
                  </h1>

                  {/* Official User Copy */}
                  <p className="mt-4 text-sm sm:text-[15px] text-[#E2D7C5] leading-relaxed">
                    A private, one-on-one mobile grooming experience designed around your pet’s
                    comfort and individual needs. Our solar-powered van and thoughtfully selected
                    premium products support a more eco-conscious approach, while delivering
                    personalized care and beautifully tailored results directly to your doorstep.
                  </p>

                  {/* Quick Feature Callout */}
                  <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-[#1E2217]/70 border border-[#FAF0E2]/10 max-w-md shadow-lg">
                    <img
                      src="/assets/souva-hero-dog.png"
                      alt="Golden Retriever inside SOUVA Van"
                      className="h-16 w-20 object-cover rounded-xl border border-[#FAF0E2]/15 shrink-0"
                    />
                    <div className="text-xs">
                      <div className="font-display font-bold text-[#FAF0E2] flex items-center gap-1.5">
                        <span>100% Solar-Powered & Autonomous</span>
                        <Zap className="h-3 w-3 text-[#AA8B63] fill-[#AA8B63]" />
                      </div>
                      <p className="text-[11px] text-[#A4AA93] mt-0.5 leading-snug">
                        Zero electrical or water hookups required from your home. Completely self-contained luxury.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Core Mandated Trust Badges */}
                <div className="pt-5 border-t border-[#FAF0E2]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#FAF0E2]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full dot-success" />
                    <span className="font-semibold">Convenient Doorstep Service</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span className="font-semibold">No Cages, No Waiting</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span className="font-semibold">Private One-on-One Care</span>
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
            <div className="bento-steps-section mt-16 sm:mt-20 border-t border-[#FAF0E2]/10 pt-10">
              <div className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase mb-6 text-center">
                {"// HOW IT WORKS // THREE STEPS TO ELEVATED DOORSTEP PAMPERING"}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    n: "01",
                    icon: <Scissors className="h-5 w-5" />,
                    t: "Select Pet Size",
                    d: "Choose your dog's size to preview our 3D model and ensure custom suite preparation inside our solar van.",
                    delay: "0s",
                  },
                  {
                    n: "02",
                    icon: <Sparkles className="h-5 w-5" />,
                    t: "Choose Spa Treatment",
                    d: "From organic colloidal oat baths to blueberry facials, gentle deshedding, and paw restorative butter.",
                    delay: "1.5s",
                  },
                  {
                    n: "03",
                    icon: <Truck className="h-5 w-5" />,
                    t: "Drop Your Pin & We Arrive",
                    d: "Confirm your doorstep address. Our private solar van parks directly outside ready to pamper.",
                    delay: "3s",
                  },
                ].map((s) => (
                  <StepCard key={s.n} num={s.n} icon={s.icon} title={s.t} desc={s.d} delay={s.delay} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES & PRICING SECTION */}
        <section id="services" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#191C13]/75 relative">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
                {"// DOORSTEP CARE & TAILORED EXPERIENCES //"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2]">
                SERVICES & PRICING
              </h2>
              <p className="mt-3 text-[#E2D7C5] text-sm md:text-base leading-relaxed">
                Personalized, one-on-one grooming services delivered directly to your doorstep.
              </p>
            </div>

            {/* Interactive SIZE GUIDE Switcher */}
            <div className="mb-10 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63]">
                  SIZE GUIDE (Select to view starting rates):
                </span>
                <span className="text-[11px] font-mono text-[#FAF0E2]/70">
                  {SIZE_GUIDE.find((s) => s.id === previewSize)?.weight}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SIZE_GUIDE.map((sg) => {
                  const isActive = previewSize === sg.id;
                  return (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => setPreviewSize(sg.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer select-none",
                        isActive
                          ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-[0_0_18px_rgba(170,139,99,0.4)] font-bold scale-[1.02]"
                          : "bg-[#22261A] border-[#FAF0E2]/10 text-[#FAF0E2]/80 hover:border-[#AA8B63]/40"
                      )}
                    >
                      <div className="font-display font-bold text-sm leading-tight">{sg.label}</div>
                      <div className={cn("text-[10px] font-mono mt-0.5", isActive ? "text-[#161811]" : "text-[#AA8B63]")}>
                        {sg.weight}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The 4 Packages Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SOUVA_PACKAGES.map((pkg) => {
                const currentPrice = pkg.prices[previewSize];
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative group",
                      pkg.popular
                        ? "bg-[#22261A] border-[#AA8B63] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
                        : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                    )}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#AA8B63] text-[#161811] text-[10px] font-bold font-mono uppercase tracking-wider shadow-md">
                        Signature Choice
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono text-[#A4AA93] flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
                          {pkg.duration}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#A4AA93] block">Starting at</span>
                          <span className="font-display font-extrabold text-2xl text-[#FAF0E2]">
                            ${currentPrice}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-[#A4AA93] mt-2 mb-5 leading-relaxed">
                        {pkg.tagline}
                      </p>

                      <div className="border-t border-[#FAF0E2]/10 pt-4">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-2">
                          Includes:
                        </span>
                        <ul className="space-y-2 text-xs text-[#FAF0E2]/90">
                          {pkg.includes.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-[#AA8B63] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={scrollToHero}
                      className="mt-6 w-full py-2.5 rounded-xl border border-[#AA8B63]/40 bg-[#AA8B63]/10 text-xs font-bold text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Select This Service</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SPA UPGRADES / ADD ONS SUBSECTION */}
            <div className="mt-16 pt-12 border-t border-[#FAF0E2]/10">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-1">
                  {"// CURATED ENHANCEMENTS //"}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF0E2]">
                  SPA UPGRADES & ADD-ONS
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#A4AA93]">
                  Personalize your pet’s appointment with one of our thoughtfully selected spa enhancements.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SPA_UPGRADES.map((upgrade) => (
                  <div
                    key={upgrade.id}
                    className="p-5 rounded-2xl bg-[#1D2016] border border-[#FAF0E2]/10 hover:border-[#AA8B63]/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                          {upgrade.name}
                        </h4>
                        <span className="font-mono font-bold text-xs text-[#AA8B63] shrink-0">
                          {upgrade.price}
                        </span>
                      </div>
                      <p className="text-xs text-[#A4AA93] leading-relaxed">
                        {upgrade.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADDITIONAL SERVICE FEES SUBSECTION */}
            <div className="mt-12 pt-10 border-t border-[#FAF0E2]/10">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-1">
                  {"// SPECIALIZED TIME & CARE //"}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF0E2]">
                  ADDITIONAL SERVICE FEES
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#A4AA93]">
                  Every pet receives personalized care based on their individual needs. Additional fees may apply when coat condition or handling needs require extra time beyond the scheduled appointment.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {ADDITIONAL_SERVICE_FEES.map((fee) => (
                  <div
                    key={fee.id}
                    className="p-5 rounded-2xl bg-[#1C1F15] border border-[#FAF0E2]/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
                          {fee.title}
                        </h4>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#AA8B63] mb-2">
                        {fee.fee}
                      </div>
                      <p className="text-xs text-[#A4AA93] leading-relaxed">
                        {fee.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-mono text-[#AA8B63] text-center mt-4">
                We will communicate any anticipated additional charges whenever possible before proceeding.
              </p>
            </div>

            {/* PRICING INFORMATION DISCLAIMER BOX */}
            <div className="mt-12 p-6 rounded-3xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-xl max-w-4xl mx-auto text-center">
              <div className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase mb-2">
                {PRICING_INFORMATION.title}
              </div>
              <p className="text-xs sm:text-sm text-[#E2D7C5] leading-relaxed max-w-3xl mx-auto">
                {PRICING_INFORMATION.body}
              </p>
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
              Before & After Transformations
            </h2>
            <p className="mt-3 text-[#A4AA93] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
              Witness the visual transformation from dull, tangled fur to a brilliant, silky,
              delightfully scented finish.
            </p>

            <BeforeAfterSlider />
          </div>
        </section>

        {/* SALON GALLERY & SOLAR FLEET HIGHLIGHTS */}
        <section id="gallery" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#181B13]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
                {"// OUR SOLAR-POWERED FLEET //"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF0E2]">
                Cutting-Edge Technology & Gentle Care
              </h2>
              <p className="mt-3 text-[#A4AA93] text-sm leading-relaxed">
                Every SOUVA mobile salon features independent climate control, an ergonomic
                hydraulic lift table, silent warm airflow, and sanitized water filtration.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-salon-interior.png"
                    alt="Interior of SOUVA Mobile Grooming Salon"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Climate-Controlled & Sanitized Suite
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Precision hydraulic grooming table and stainless steel tub ensuring comfort, stability, and zero stress for dogs of all ages.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-products.png"
                    alt="SOUVA Botanical Pet Cosmetics"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Artisan Botanical Product Line
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Colloidal oat shampoos, silk detanglers, and healing paw butter formulated without parabens, sulfates, or artificial fragrances.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#FAF0E2]/15 bg-[#202418] shadow-xl group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/assets/souva-van-profile.png"
                    alt="SOUVA Solar Mobile Van"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    100% Solar-Powered Autonomous Fleet
                  </h4>
                  <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                    Self-sustaining clean battery systems, pure water tanks, and zero emissions while parked outside your Bay Area residence.
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
                {"// VERIFIED PET PARENT REVIEWS //"}
              </span>
              <h2 className="font-display text-3xl font-bold text-[#FAF0E2]">
                Adored by Pets & Families Across the Bay
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  author: "Sarah M. & Toby (Golden Retriever)",
                  text: "The most seamless grooming experience we've ever had in San Francisco. Toby used to dread cage dryers at traditional salons. SOUVA parked right on our street, and he came back calm, fluffy, and smelling heavenly.",
                  stars: 5,
                  city: "Pacific Heights, San Francisco",
                },
                {
                  author: "David L. & Luna (Toy Poodle)",
                  text: "Her scissor cut was immaculate. The eco-conscious solar van is whisper quiet, and the booking portal made coordinating arrival super easy. Hands down the premier service in the East Bay.",
                  stars: 5,
                  city: "Rockridge, Oakland",
                },
                {
                  author: "Elena K. & Thor (French Bulldog)",
                  text: "Thor has sensitive skin and allergy folds. Their hypoallergenic colloidal oat wash and blueberry facial kept his coat shiny and calm without any redness. Worth every penny.",
                  stars: 5,
                  city: "Walnut Creek, CA",
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
                Ready to elevate your pet's grooming?
              </h3>
              <p className="text-sm text-[#A4AA93] mt-1">
                Book your private doorstep appointment in 60 seconds with our interactive portal.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToHero}
              className="px-8 py-3.5 rounded-2xl btn-luxury font-bold text-xs tracking-wider cursor-pointer shadow-xl shrink-0"
            >
              Book Solar Van to Doorstep
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
  return (
    <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <SouvaLogo />
      </div>

      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#FAF0E2]/80">
        <a href="#services" className="hover:text-[#AA8B63] transition-colors">
          Services & Pricing
        </a>
        <a href="#before-after" className="hover:text-[#AA8B63] transition-colors">
          Before & After
        </a>
        <a href="#gallery" className="hover:text-[#AA8B63] transition-colors">
          The Solar Van
        </a>
        <a href="#reviews" className="hover:text-[#AA8B63] transition-colors">
          Reviews
        </a>
      </nav>

      <div className="flex items-center gap-3">
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
          BOOK NOW
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
            "The Bay Area’s elevated mobile grooming experience."
          </p>
          <span className="text-[10px] text-[#A4AA93]/60">
            © {new Date().getFullYear()} SOUVA Mobile Pet Grooming LLC. All rights reserved.
          </span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-[10px] text-[#A4AA93]/50 hover:text-[#AA8B63] transition-colors flex items-center gap-1.5 mt-2 cursor-pointer text-left w-fit"
          >
            <Shield className="h-3 w-3" />
            <span>Owner Portal / Fleet Dispatch (/admin)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              CONCIERGE / WHATSAPP
            </span>
            <a href="tel:+18509600034" className="text-[#FAF0E2] hover:text-[#AA8B63] transition-colors">
              +1 (850) 960-0034
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              OPERATING HOURS
            </span>
            <span className="text-[#FAF0E2]">Monday – Sunday (7 Days): 8:30 AM – 7:00 PM</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] uppercase tracking-wider text-[#AA8B63] font-bold">
              SERVICE AREA
            </span>
            <span className="text-[#FAF0E2]">San Francisco · Oakland · Berkeley · Walnut Creek · San Ramon</span>
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
