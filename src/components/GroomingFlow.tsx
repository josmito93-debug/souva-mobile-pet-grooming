import { useState, useRef, useMemo, useEffect } from "react";
import {
  Sparkles,
  Scissors,
  Check,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  Phone,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetBlueprint } from "@/components/PetBlueprint";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { SOUVA_PACKAGES, SPA_UPGRADES, SIZE_GUIDE, type PetSize } from "@/data/services";

export const SQUARE_BOOKING_URL = "https://souva-mobile-pet-grooming.square.site";

export interface CompletedPet {
  id: string;
  petName: string;
  size: PetSize;
  breed: string;
  petAge: string;
  gender: "male" | "female";
  packageId: string;
  packageName: string;
  addons: string[];
  petCondition: string;
  temperament: string;
  vaccinated: "yes" | "no";
  medicalConditions: string;
  groomerNotes: string;
  petPhoto: string | null;
  basePrice: number;
  addonsCost: number;
  discount: number;
  totalPrice: number;
}

export interface GroomingFlowState {
  size: PetSize;
  packageId: string;
  addons: string[];
  address: string;
  zipCode: string;
  parkingNotes: string;
  latitude: number | null;
  longitude: number | null;
  firstName: string;
  lastName: string;
  ownerName: string;
  email: string;
  phone: string;
  dogCount: number;
  petName: string;
  breed: string;
  petAge: string;
  gender: "male" | "female";
  petCondition: string;
  temperament: string;
  vaccinated: "yes" | "no";
  medicalConditions: string;
  groomerNotes: string;
  petPhoto: string | null;
  scheduledDate: string;
  scheduledDateIso?: string;
  scheduledTime: string;
  signature: string | null;
  agreedToTerms: boolean;
}

// Full Year Calendar Availability (Preserved for compatibility with Manage/Modify Appointment Modals)
export interface AvailableDate {
  dayLabel: string;
  month: string;
  monthFull: string;
  year: number;
  dayNum: number;
  fullDate: string;
  isoDate: string;
  dayOfWeek: number;
  isBlocked?: boolean;
}

export const BLOCKED_WEEK_START = "";
export const BLOCKED_WEEK_END = "";

export function isDateBlocked(_isoDate?: string): boolean {
  return false;
}

export function getAvailableDates(): AvailableDate[] {
  const dates: AvailableDate[] = [];
  const now = new Date();
  const startOffset = now.getHours() >= 17 ? 2 : 1;

  for (let i = startOffset; i < startOffset + 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayOfWeek = d.getDay();
    const dayLabel = i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const monthFull = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();
    const dayNum = d.getDate();
    const fullDate = `${dayLabel}, ${month} ${dayNum}`;
    const monthNum = String(d.getMonth() + 1).padStart(2, "0");
    const dayPad = String(d.getDate()).padStart(2, "0");
    const isoDate = `${year}-${monthNum}-${dayPad}`;
    const isBlocked = isDateBlocked(isoDate);
    dates.push({ dayLabel, month, monthFull, year, dayNum, fullDate, isoDate, dayOfWeek, isBlocked });
  }
  return dates;
}

export interface TimeSlot {
  id: string;
  period: string;
  time: string;
}

export const SCHEDULE_BY_DAY: Record<number, TimeSlot[]> = {
  1: [
    { id: "mon-930am", period: "Morning", time: "9:30 AM" },
    { id: "mon-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "mon-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "mon-630pm", period: "Evening", time: "6:30 PM" },
  ],
  2: [
    { id: "tue-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "tue-630pm", period: "Evening", time: "6:30 PM" },
  ],
  3: [
    { id: "wed-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "wed-630pm", period: "Evening", time: "6:30 PM" },
  ],
  4: [
    { id: "thu-930am", period: "Morning", time: "9:30 AM" },
    { id: "thu-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "thu-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "thu-630pm", period: "Evening", time: "6:30 PM" },
  ],
  5: [
    { id: "fri-930am", period: "Morning", time: "9:30 AM" },
    { id: "fri-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "fri-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "fri-630pm", period: "Evening", time: "6:30 PM" },
  ],
  6: [
    { id: "sat-830am", period: "Morning", time: "8:30 AM" },
    { id: "sat-1130am", period: "Midday", time: "11:30 AM" },
    { id: "sat-230pm", period: "Afternoon", time: "2:30 PM" },
    { id: "sat-530pm", period: "Evening", time: "5:30 PM" },
  ],
  0: [
    { id: "sun-830am", period: "Morning", time: "8:30 AM" },
    { id: "sun-1130am", period: "Midday", time: "11:30 AM" },
    { id: "sun-230pm", period: "Afternoon", time: "2:30 PM" },
    { id: "sun-530pm", period: "Evening", time: "5:30 PM" },
  ],
};

const STEPS_TOTAL = 3;
const STORAGE_KEY = "souva_pricing_calculator_draft";

/* -------------------- Status LED Grid Tracker (3 Steps) -------------------- */
function StatusLedGrid({ activeIndex, onSelectStep }: { activeIndex: number; onSelectStep: (idx: number) => void }) {
  const steps = [
    { icon: Sparkles, stepNum: "1", title: "Tamaño", subtitle: "Dog Size" },
    { icon: Scissors, stepNum: "2", title: "Servicios", subtitle: "Services" },
    { icon: Calendar, stepNum: "3", title: "Reserva Square", subtitle: "Square Booking" },
  ];

  return (
    <div
      className="ledgrid__track mb-4 select-none"
      style={{ "--cols": 3 } as React.CSSProperties}
    >
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {steps.map((st, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          const IconComp = st.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectStep(i)}
              className={cn(
                "relative p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none",
                isActive
                  ? "bg-[#252A1C] border-[#AA8B63] text-[#FAF0E2] shadow-[0_0_15px_rgba(170,139,99,0.3)]"
                  : isDone
                  ? "bg-[#181B13] border-emerald-500/30 text-emerald-300 hover:border-[#AA8B63]/40"
                  : "bg-[#151710] border-[#FAF0E2]/10 text-[#A4AA93]/60 hover:text-[#FAF0E2]/80"
              )}
            >
              <div className="flex items-center gap-1.5">
                <IconComp className={cn("h-3.5 w-3.5", isActive ? "text-[#AA8B63]" : isDone ? "text-emerald-400" : "text-[#A4AA93]/60")} />
                <span className={cn("text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider", isActive ? "text-[#FAF0E2]" : isDone ? "text-emerald-300" : "text-[#A4AA93]/70")}>
                  {st.title}
                </span>
              </div>
              <span className="hidden sm:inline text-[8px] font-mono opacity-60 uppercase">
                {st.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Step Header -------------------- */
function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1 text-left">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#AA8B63] animate-pulse" />
        <span className="text-[10px] font-bold tracking-widest text-[#AA8B63] uppercase font-mono">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-[#FAF0E2] break-words">
        {title}
      </h2>
      <p className="text-xs text-[#A4AA93] leading-relaxed max-w-xl break-words">
        {subtitle}
      </p>
    </div>
  );
}

/* -------------------- MAIN GROOMING FLOW (CONOCE TU PRECIO) -------------------- */
export function GroomingFlow({
  onStatus,
}: {
  onStatus?: (s: { armed: boolean; dispatched: boolean; currentStep?: number }) => void;
}) {
  const flowTopRef = useRef<HTMLDivElement>(null);

  const initialDataState: GroomingFlowState = {
    size: "small",
    packageId: "essential-full-groom", // Default to the popular $99 promo for immediate calculation
    addons: [],
    address: "",
    zipCode: "",
    parkingNotes: "Driveway available",
    latitude: null,
    longitude: null,
    firstName: "",
    lastName: "",
    ownerName: "",
    email: "",
    phone: "",
    dogCount: 1,
    petName: "My Dog",
    breed: "",
    petAge: "Adult (1–7 yrs)",
    gender: "male",
    petCondition: "Healthy & Well-Maintained",
    temperament: "Friendly & Calm",
    vaccinated: "yes",
    medicalConditions: "None / Healthy",
    groomerNotes: "",
    petPhoto: null,
    scheduledDate: "",
    scheduledDateIso: "",
    scheduledTime: "",
    signature: null,
    agreedToTerms: true,
  };

  const [data, setData] = useState<GroomingFlowState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.data) {
          return { ...initialDataState, ...parsed.data };
        }
      }
    } catch (e) {
      console.warn("Storage restore error", e);
    }
    return initialDataState;
  });

  const [step, setStep] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          data: {
            size: data.size,
            packageId: data.packageId,
            addons: data.addons,
          },
        })
      );
    } catch (e) {}
  }, [data.size, data.packageId, data.addons]);

  // Broadcast step status
  useEffect(() => {
    if (onStatus) {
      onStatus({
        armed: step >= 1,
        dispatched: step === 2,
        currentStep: step + 1,
      });
    }
  }, [step, onStatus]);

  // Price Calculation Logic
  const isOver50Lbs = data.size === "xlarge";
  const selectedPackage = SOUVA_PACKAGES.find((p) => p.id === data.packageId) || SOUVA_PACKAGES[2]; // Default Essential Full Groom

  const basePrice = useMemo(() => {
    if (data.packageId === "essential-full-groom") {
      // First 50 Bookings Promo: $99 for Small, Medium & Large; $129 for X-Large (over 50 lb)
      return isOver50Lbs ? 99 + 30 : 99;
    }
    return selectedPackage.prices[data.size as PetSize] || 99;
  }, [data.packageId, data.size, isOver50Lbs, selectedPackage]);

  const originalPrice = useMemo(() => {
    return selectedPackage.prices[data.size as PetSize] || 120;
  }, [selectedPackage, data.size]);

  const addonsTotal = useMemo(() => {
    return data.addons.reduce((sum, addonId) => {
      const up = SPA_UPGRADES.find((u) => u.id === addonId);
      if (!up) return sum;
      const num = parseInt(up.price.replace(/[^0-9]/g, ""), 10) || 0;
      return sum + num;
    }, 0);
  }, [data.addons]);

  const grandEstimatedTotal = basePrice + addonsTotal;

  const handleNext = () => {
    if (step < STEPS_TOTAL - 1) {
      setStep((prev) => prev + 1);
      if (flowTopRef.current) {
        flowTopRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setData(initialDataState);
    setStep(0);
  };

  const copyQuoteToClipboard = () => {
    const sizeObj = SIZE_GUIDE.find((s) => s.id === data.size);
    const addonsNames = data.addons
      .map((id) => SPA_UPGRADES.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const text = `SOUVA Mobile Pet Grooming Quote:
- Pet Size: ${sizeObj?.label} (${sizeObj?.weight})
- Package: ${selectedPackage.name}
- Add-ons: ${addonsNames || "None"}
- Estimated Total: $${grandEstimatedTotal}
Book link: ${SQUARE_BOOKING_URL}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div ref={flowTopRef} id="conoce-tu-precio" className="w-full max-w-full min-w-0">
      {/* ── TOP BADGE: CONOCE TU PRECIO ────────────────────────────── */}
      <div className="mb-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#22271A] via-[#2A2419] to-[#22271A] border border-[#AA8B63]/60 shadow-[0_2px_14px_rgba(170,139,99,0.2)] flex items-center justify-between select-none max-w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#AA8B63]" />
          </span>
          <span className="text-xs sm:text-sm font-mono font-black tracking-wider sm:tracking-widest text-[#FAF0E2] uppercase whitespace-nowrap">
            CONOCE TU PRECIO
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-mono text-[#AA8B63] font-bold uppercase tracking-wider min-w-0 truncate">
          <Sparkles className="h-3 w-3 text-[#AA8B63] shrink-0" />
          <span className="truncate">Paso {step + 1} de 3 · Square</span>
        </div>
      </div>

      {/* ── 3-STEP STATUS LED GRID ───────────────────────────────────── */}
      <StatusLedGrid activeIndex={step} onSelectStep={(idx) => setStep(idx)} />

      {/* ── CONTROLS STRIP (BACK / STEP / RESET) ────────────────────── */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#FAF0E2]/15 bg-[#1B1E15] text-[#A4AA93] hover:text-[#FAF0E2] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#AA8B63]">
            PASO {step + 1} DE {STEPS_TOTAL}
          </div>
          <div className="text-[9.5px] font-mono text-[#FAF0E2]/60">
            {step === 0 ? "Tamaño de Perro" : step === 1 ? "Servicios & Extras" : "Reserva en Square"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 rounded-full bg-[#1F2318] border border-[#FAF0E2]/15 text-[9.5px] font-mono font-bold text-[#AA8B63] hover:text-[#FAF0E2] hover:border-[#AA8B63] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          title="Reiniciar cotizador"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* ── DYNAMIC STEPS ───────────────────────────────────────────── */}
      <div className="pb-2 pt-1">
        {step === 0 && (
          <StepPetSize data={data} setData={setData} />
        )}

        {step === 1 && (
          <StepServicePackage
            data={data}
            setData={setData}
            isOver50Lbs={isOver50Lbs}
          />
        )}

        {step === 2 && (
          <StepSquareReservation
            data={data}
            selectedPackage={selectedPackage}
            basePrice={basePrice}
            addonsTotal={addonsTotal}
            grandTotal={grandEstimatedTotal}
            onBackToServices={() => setStep(1)}
            onBackToSize={() => setStep(0)}
            copied={copied}
            onCopy={copyQuoteToClipboard}
          />
        )}

        {/* ── PERSISTENT LIVE ESTIMATE BAR (STEPS 0 & 1) ──────────────── */}
        {step < 2 && (
          <div className="mt-4 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-md overflow-hidden transition-all">
            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-[#25281D] border border-[#AA8B63]/40 flex items-center justify-center shrink-0">
                  <span className="text-sm">🐾</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#FAF0E2] truncate">
                      {selectedPackage.name}
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#25281D] text-[#AA8B63] font-bold uppercase shrink-0">
                      {SIZE_GUIDE.find((s) => s.id === data.size)?.label || data.size}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#A4AA93] truncate">
                    {data.addons.length > 0 ? `+${data.addons.length} upgrade(s)` : "Doorstep Spa Rate"}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono uppercase text-[#A4AA93] block">
                  Estimado:
                </span>
                <span className="font-mono font-black text-base sm:text-lg text-amber-300">
                  ${grandEstimatedTotal}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP ACTION BUTTONS (STEPS 0 & 1) ────────────────────────── */}
        {step < 2 && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-3.5 w-full py-3.5 text-xs sm:text-sm font-display font-extrabold btn-luxury relative z-10 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-xl active:scale-[0.99] transition-all"
          >
            {step === 0 ? (
              <>
                <span>Continuar a Servicios →</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continuar a Reserva en Square (${grandEstimatedTotal}) →</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------- STEP 1: PET SIZE ("TAMAÑOS DE PERRO") -------------------- */
function StepPetSize({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  return (
    <div className="animate-in fade-in duration-200">
      <StepHeader
        eyebrow="Paso 1 · Tamaños de Perro"
        title="Elige el Tamaño de tu Perro"
        subtitle="Visualiza cada tamaño para asegurar la preparación del espacio y suite solar en nuestra van móvil."
      />

      <div className="mt-3.5">
        <PetBlueprint
          selectedSize={data.size}
          onSelectSize={(size) => setData((prev) => ({ ...prev, size }))}
        />
      </div>

      <div className="mt-3 p-3 rounded-2xl bg-[#181B13] border border-[#FAF0E2]/10 text-xs text-[#FAF0E2]/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-[11px] leading-snug">
            ¿No estás seguro del peso exacto? Nuestro groomer verificará la talla al llegar a tu puerta.
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 2: SERVICES ("LUEGO SERVICIOS") -------------------- */
function StepServicePackage({
  data,
  setData,
  isOver50Lbs,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  isOver50Lbs: boolean;
}) {
  const toggleAddon = (addonId: string) => {
    let next = [...data.addons];
    if (next.includes(addonId)) {
      next = next.filter((a) => a !== addonId);
    } else {
      next.push(addonId);
    }
    setData((prev) => ({ ...prev, addons: next }));
  };

  const fullGroomOriginalPrice =
    SOUVA_PACKAGES.find((p) => p.id === "essential-full-groom")?.prices[data.size as PetSize] ||
    (isOver50Lbs ? 180 : 120);
  const fullGroomPromoPrice = isOver50Lbs ? 99 + 30 : 99;

  const services2x2 = [
    {
      id: "bath-refresh",
      title: "Bath & Brush",
      subtitle: "Baño, secado, uñas, oídos",
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "bath-refresh")?.prices[data.size as PetSize] || 75,
      isPromo: false,
    },
    {
      id: "bath-tidy",
      title: "Bath & Tidy",
      subtitle: "+ corte higiénico, patitas y cara",
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "bath-tidy")?.prices[data.size as PetSize] || 90,
      isPromo: false,
    },
    {
      id: "essential-full-groom",
      title: "Full Groom",
      subtitle: isOver50Lbs ? "Corte completo · >50 lb: +$30" : "Corte completo bajo mantenimiento",
      rawPrice: fullGroomPromoPrice,
      originalPrice: fullGroomOriginalPrice,
      isPromo: true,
    },
    {
      id: "signature-grooming",
      title: "Signature Grooming",
      subtitle: 'Estilo tijera ½"+ · Acabado de lujo',
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "signature-grooming")?.prices[data.size as PetSize] || 150,
      isPromo: false,
    },
  ];

  return (
    <div className="animate-in fade-in duration-200">
      <StepHeader
        eyebrow="Paso 2 · Servicios & Precios"
        title="Selecciona el Servicio de Grooming"
        subtitle="Tarifas transparentes calibradas al tamaño de tu perro. Incluye nuestra promo activa."
      />

      {/* Intro Promo Banner */}
      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#292215] via-[#202517] to-[#181C12] border-2 border-[#AA8B63] shadow-[0_0_20px_rgba(170,139,99,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#AA8B63] to-[#826643] text-[#161811] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            🐾
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9.5px] font-mono font-black uppercase tracking-wider text-amber-300">
                PROMO NUEVOS CLIENTES
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#AA8B63]/25 border border-[#AA8B63]/50 text-[#FAF0E2] text-[8.5px] font-mono font-bold uppercase">
                25/50 CUPOS DISPONIBLES
              </span>
            </div>
            <p className="text-[11.5px] text-[#FAF0E2] font-semibold mt-0.5 leading-snug">
              Full Grooming Promo <strong className="text-amber-300 font-extrabold text-sm">$99</strong>{" "}
              <span className="text-amber-200 font-mono text-[10.5px]">
                {isOver50Lbs ? "(+$30 perro >50 lb · $129 Activo)" : "(+$30 si >50 lb)"}
              </span>
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold uppercase shrink-0 self-start sm:self-center">
          {isOver50Lbs ? "$129 Activo" : "$99 Activo"}
        </span>
      </div>

      {/* 2x2 Segmented Services Grid */}
      <div className="mt-3.5 p-1.5 sm:p-2 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-inner">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 items-stretch">
          {services2x2.map((item) => {
            const isSelected = data.packageId === item.id;

            const buttonContent = (
              <>
                <div>
                  {item.isPromo && (
                    <div className="mb-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#AA8B63] text-[#161811] text-[8px] font-mono font-black uppercase tracking-wider truncate max-w-full">
                        ⚡ $99 PROMO (25 RESTANTES)
                      </span>
                      <span className={cn(
                        "block text-[8px] font-mono font-bold mt-0.5 truncate",
                        isSelected ? "text-[#161811]" : "text-amber-300"
                      )}>
                        {isOver50Lbs ? "Incluye +$30 (>50 lb)" : "+$30 si >50 lb"}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "text-xs sm:text-sm font-display font-bold leading-tight",
                      isSelected ? "text-[#161811]" : "text-[#FAF0E2]"
                    )}
                  >
                    {item.title}
                  </div>
                  <div
                    className={cn(
                      "text-[9.5px] sm:text-[10px] font-mono mt-1 leading-snug line-clamp-2",
                      isSelected ? "text-[#59593E] font-medium" : "text-[#A4AA93]"
                    )}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[8.5px] font-mono uppercase tracking-wider",
                      isSelected ? "text-[#161811]/70" : "text-[#A4AA93]"
                    )}
                  >
                    {item.isPromo ? "PROMO" : "Desde"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.isPromo && (
                      <span
                        className={cn(
                          "line-through text-[10px] font-mono",
                          isSelected ? "text-[#161811]/50" : "text-[#A4AA93]/60"
                        )}
                      >
                        ${item.originalPrice}
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-mono font-black text-xs sm:text-sm",
                        isSelected ? "text-[#161811]" : item.isPromo ? "text-amber-300" : "text-[#AA8B63]"
                      )}
                    >
                      ${item.rawPrice}
                    </span>
                  </div>
                </div>
              </>
            );

            if (item.isPromo) {
              return (
                <div
                  key={item.id}
                  className={cn("promo-gold-border-wrapper rounded-xl", isSelected && "scale-[1.02]")}
                >
                  <div className="promo-gold-border-beam" />
                  <button
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, packageId: item.id }))}
                    className={cn(
                      "relative z-10 w-full h-full p-2.5 sm:p-3 rounded-xl text-left transition-all duration-300 cursor-pointer select-none flex flex-col justify-between min-h-[96px]",
                      isSelected
                        ? "bg-[#FAF0E2] text-[#161811] shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                        : "bg-[#181B13] text-[#FAF0E2]/95 hover:bg-[#1F2318]"
                    )}
                  >
                    {buttonContent}
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setData((prev) => ({ ...prev, packageId: item.id }))}
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl text-left transition-all duration-300 cursor-pointer select-none flex flex-col justify-between min-h-[96px] relative",
                  isSelected
                    ? "bg-[#FAF0E2] text-[#161811] shadow-[0_8px_20px_rgba(0,0,0,0.4)] scale-[1.02]"
                    : "bg-[#1C1F15]/70 text-[#FAF0E2]/90 hover:bg-[#25281D] hover:text-[#FAF0E2]"
                )}
              >
                {buttonContent}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spa Upgrades & Add-ons */}
      <div className="mt-3.5 pt-2.5 border-t border-[#FAF0E2]/10">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10.5px] text-[#A4AA93] font-semibold uppercase tracking-wider">
            Upgrades Opcionales de Spa
          </label>
          <span className="text-[9.5px] font-mono text-[#AA8B63]">Opcional</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {SPA_UPGRADES.map((add) => {
            const isSelected = data.addons.includes(add.id);
            return (
              <button
                key={add.id}
                type="button"
                onClick={() => toggleAddon(add.id)}
                className={cn(
                  "p-2 rounded-xl border text-left text-xs font-medium transition-all duration-300 cursor-pointer select-none flex flex-col justify-between",
                  isSelected
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
                title={add.desc}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-[#FAF0E2] line-clamp-1">{add.name}</span>
                  {isSelected && <Check className="h-3 w-3 text-[#AA8B63] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[9.5px] font-mono text-[#AA8B63] mt-1 font-bold">{add.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 3: RESERVA SQUARE ("TERCER PASO LINK SQUARE") -------------------- */
function StepSquareReservation({
  data,
  selectedPackage,
  basePrice,
  addonsTotal,
  grandTotal,
  onBackToServices,
  onBackToSize,
  copied,
  onCopy,
}: {
  data: GroomingFlowState;
  selectedPackage: { name: string; duration: string; includes: string[] };
  basePrice: number;
  addonsTotal: number;
  grandTotal: number;
  onBackToServices: () => void;
  onBackToSize: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const sizeObj = SIZE_GUIDE.find((s) => s.id === data.size);
  const selectedAddons = data.addons
    .map((id) => SPA_UPGRADES.find((u) => u.id === id))
    .filter(Boolean);

  const handleSquareClick = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: "Square Booking Step 3",
        value: grandTotal,
        currency: "USD",
      });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola SOUVA Mobile Grooming, coticé en la web para mi perro tamaño ${sizeObj?.label} (${sizeObj?.weight}) el servicio "${selectedPackage.name}" por $${grandTotal}. Me gustaría reservar.`
  );

  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      <StepHeader
        eyebrow="Paso 3 de 3 · Reserva en Square"
        title="¡Tu Precio Estimado Está Listo!"
        subtitle="Haz clic en el botón de abajo para elegir fecha, horario y completar tu cita en nuestro sistema oficial de Square."
      />

      {/* Main High-End Estimate Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1F2417] via-[#161811] to-[#12140D] border-2 border-[#AA8B63] shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#AA8B63]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Price Row */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF0E2]/15 relative z-10">
          <div>
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#AA8B63] block">
              PRECIO TOTAL ESTIMADO
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-sm">
                ${grandTotal}
              </span>
              <span className="text-[11px] font-mono text-[#A4AA93]">
                · Servicio a tu puerta
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wide">
              Tarifa Calculada
            </span>
            <div className="text-[10px] font-mono text-[#FAF0E2]/60 mt-1">
              ⏱ {selectedPackage.duration}
            </div>
          </div>
        </div>

        {/* Quote Breakdown */}
        <div className="py-3.5 space-y-2 text-xs relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#AA8B63]">🐶</span>
              <span className="text-[#FAF0E2] font-semibold">Tamaño seleccionado:</span>
            </div>
            <button
              type="button"
              onClick={onBackToSize}
              className="font-mono text-[#AA8B63] hover:underline font-bold text-[11px] cursor-pointer"
              title="Cambiar tamaño"
            >
              {sizeObj?.label} ({sizeObj?.weight}) ✏️
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#AA8B63]">✂️</span>
              <span className="text-[#FAF0E2] font-semibold">Servicio base:</span>
            </div>
            <button
              type="button"
              onClick={onBackToServices}
              className="font-mono text-[#FAF0E2] hover:text-[#AA8B63] font-bold text-[11px] cursor-pointer"
              title="Cambiar paquete"
            >
              {selectedPackage.name} (${basePrice}) ✏️
            </button>
          </div>

          {selectedAddons.length > 0 && (
            <div className="flex items-start justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[#AA8B63]">✨</span>
                <span className="text-[#FAF0E2] font-semibold">Upgrades incluidos:</span>
              </div>
              <div className="text-right">
                {selectedAddons.map((ad) => (
                  <div key={ad?.id} className="text-[10.5px] font-mono text-[#AA8B63]">
                    {ad?.name} ({ad?.price})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Highlights */}
        <div className="pt-3 border-t border-[#FAF0E2]/10 grid grid-cols-2 gap-2 text-[10.5px] text-[#E2D7C5]/85 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Van solar 100% autónoma</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Atención 1-a-1 sin jaulas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Cosméticos botánicos Hydra®</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>San Francisco & Península</span>
          </div>
        </div>
      </div>

      {/* ── BIG PRIMARY BUTTON: MANDAR AL LINK DE RESERVA SQUARE ──────── */}
      <div className="space-y-2 pt-1">
        <a
          href={SQUARE_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleSquareClick}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-display font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(170,139,99,0.5)] hover:shadow-[0_0_40px_rgba(170,139,99,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center group"
        >
          <span>RESERVAR EN SQUARE AHORA</span>
          <ExternalLink className="h-4.5 w-4.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        {/* Direct Link Info & Copy Button */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#151810] border border-[#FAF0E2]/10 text-[10px] font-mono text-[#A4AA93]">
          <span className="truncate">
            Enlace oficial: <strong className="text-[#FAF0E2]">souva-mobile-pet-grooming.square.site</strong>
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="px-2 py-0.5 rounded bg-[#202517] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] transition-colors cursor-pointer shrink-0 flex items-center gap-1 font-bold"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alternate Options (Phone / WhatsApp Concierge) */}
      <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
        <a
          href="tel:+14153755823"
          className="p-2.5 rounded-xl bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:border-[#AA8B63] transition-colors flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold"
          title="Llamar para reservar"
        >
          <Phone className="h-3.5 w-3.5 text-[#AA8B63]" />
          <span>Llamar: (415) 375-5823</span>
        </a>

        <a
          href={`https://wa.me/14153755823?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-[#152317] border border-[#25D366]/40 text-emerald-300 hover:border-[#25D366] transition-colors flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold"
          title="Consultar por WhatsApp"
        >
          <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
          <span>WhatsApp Concierge</span>
        </a>
      </div>
    </div>
  );
}
