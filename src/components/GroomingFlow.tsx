import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  User,
  Mail,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Heart,
  Scissors,
  Check,
  Calendar,
  Camera,
  Upload,
  Trash2,
  ShieldCheck,
  Activity,
  Info,
  Car,
  FileCheck,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetBlueprint } from "@/components/PetBlueprint";
import breedsList from "@/data/breeds.json";
import { SOUVA_PACKAGES, SPA_UPGRADES, SIZE_GUIDE, type PetSize } from "@/data/services";
import { addDispatchRequest } from "@/lib/dispatchStore";

export interface GroomingFlowState {
  size: PetSize;
  packageId: string;
  addons: string[];
  // Info Perro - Paso 1:
  petName: string;
  breed: string;
  petAge: string;
  gender: "male" | "female";
  // Info Perro - Paso 2:
  petCondition: string;
  vaccinated: "yes" | "no";
  medicalConditions: string;
  groomerNotes: string;
  petPhoto: string | null;
  // Info Cliente - Paso 3:
  firstName: string;
  lastName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  parkingNotes: string;
  latitude: number | null;
  longitude: number | null;
  // Calendario - Paso 4:
  scheduledDate: string;
  scheduledTime: string;
  // Disclaimer con firma - Paso 5:
  signature: string | null;
  agreedToTerms: boolean;
}

const STEPS_TOTAL = 7;

// Dynamic Helper for next 14 days
export interface AvailableDate {
  dayLabel: string;
  month: string;
  dayNum: number;
  fullDate: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

export function getAvailableDates(): AvailableDate[] {
  const dates: AvailableDate[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayOfWeek = d.getDay();
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const fullDate = `${dayLabel}, ${month} ${dayNum}`;
    dates.push({ dayLabel, month, dayNum, fullDate, dayOfWeek });
  }
  return dates;
}

// Operating Hours / Arrival Windows per Day of Week
export interface TimeSlot {
  id: string;
  period: string;
  time: string;
}

export const SCHEDULE_BY_DAY: Record<number, TimeSlot[]> = {
  // Lunes (Monday = 1)
  1: [
    { id: "mon-930am", period: "Morning", time: "9:30 AM" },
    { id: "mon-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "mon-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "mon-630pm", period: "Evening", time: "6:30 PM" },
  ],
  // Martes (Tuesday = 2)
  2: [
    { id: "tue-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "tue-630pm", period: "Evening", time: "6:30 PM" },
  ],
  // Miércoles (Wednesday = 3)
  3: [
    { id: "wed-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "wed-630pm", period: "Evening", time: "6:30 PM" },
  ],
  // Jueves (Thursday = 4)
  4: [
    { id: "thu-930am", period: "Morning", time: "9:30 AM" },
    { id: "thu-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "thu-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "thu-630pm", period: "Evening", time: "6:30 PM" },
  ],
  // Viernes (Friday = 5)
  5: [
    { id: "fri-930am", period: "Morning", time: "9:30 AM" },
    { id: "fri-1230pm", period: "Midday", time: "12:30 PM" },
    { id: "fri-330pm", period: "Afternoon", time: "3:30 PM" },
    { id: "fri-630pm", period: "Evening", time: "6:30 PM" },
  ],
  // Sábado (Saturday = 6)
  6: [
    { id: "sat-830am", period: "Morning", time: "8:30 AM" },
    { id: "sat-1130am", period: "Midday", time: "11:30 AM" },
    { id: "sat-230pm", period: "Afternoon", time: "2:30 PM" },
    { id: "sat-530pm", period: "Evening", time: "5:30 PM" },
  ],
  // Domingo (Sunday = 0)
  0: [
    { id: "sun-830am", period: "Morning", time: "8:30 AM" },
    { id: "sun-1130am", period: "Midday", time: "11:30 AM" },
    { id: "sun-230pm", period: "Afternoon", time: "2:30 PM" },
    { id: "sun-530pm", period: "Evening", time: "5:30 PM" },
  ],
};

/* -------------------- Status LED Grid Tracker (7 Steps) -------------------- */
function StatusLedGrid({ activeIndex, hot }: { activeIndex: number; hot: boolean }) {
  const steps = [
    { icon: Sparkles, label: "Size" },
    { icon: Scissors, label: "Service" },
    { icon: Heart, label: "Dog" },
    { icon: ShieldCheck, label: "Care" },
    { icon: User, label: "Client" },
    { icon: Calendar, label: "Schedule" },
    { icon: FileCheck, label: "Agreement" },
  ];

  return (
    <div
      className="ledgrid__track mb-6 select-none"
      style={{ "--cols": 7 } as React.CSSProperties}
    >
      <div className="lg-row">
        {steps.map((st, i) => {
          const isOn = i === activeIndex;
          const IconComp = st.icon;
          return (
            <div
              key={i}
              className={cn("lg-cell-wrap", isOn && "is-on", isOn && hot && "is-hot")}
              title={st.label}
            >
              <div
                className={cn(
                  "lg-cell relative flex flex-col justify-center gap-1 cursor-help h-full",
                  isOn && "is-on",
                  isOn && hot && "is-hot"
                )}
              >
                {isOn && (
                  <>
                    <span className="lg-corner lg-corner--tl" />
                    <span className="lg-corner lg-corner--tr" />
                    <span className="lg-corner lg-corner--bl" />
                    <span className="lg-corner lg-corner--br" />
                  </>
                )}
                <IconComp className="h-4 w-4 relative z-10" />
                <span className="hidden sm:inline text-[7.5px] uppercase tracking-wider font-mono font-extrabold relative z-10">
                  {st.label}
                </span>
              </div>
            </div>
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
      <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#FAF0E2]">
        {title}
      </h3>
      <p className="text-xs text-[#A4AA93] leading-relaxed max-w-xl">
        {subtitle}
      </p>
    </div>
  );
}

/* -------------------- MAIN GROOMING FLOW COMPONENT -------------------- */
export function GroomingFlow({
  onStatus,
}: {
  onStatus: (s: { armed: boolean; dispatched: boolean }) => void;
}) {
  const availableDates = useMemo(() => getAvailableDates(), []);
  const initialDate = availableDates[1] || availableDates[0];
  const initialSlots = SCHEDULE_BY_DAY[initialDate?.dayOfWeek ?? 1] || [];

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [completed, setCompleted] = useState(false);
  const [justArmed, setJustArmed] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [invoicePdf, setInvoicePdf] = useState<{ base64: string; fileName: string } | null>(null);
  const [emailNotice, setEmailNotice] = useState<{ type: "success" | "warning"; message: string } | null>(null);

  const [data, setData] = useState<GroomingFlowState>({
    size: "small",
    packageId: "",
    addons: [],
    // Info Perro - Paso 1:
    petName: "",
    breed: "",
    petAge: "Adult (1–7 yrs)",
    gender: "male",
    // Info Perro - Paso 2:
    petCondition: "Healthy & Well-Maintained",
    vaccinated: "yes",
    medicalConditions: "None / Healthy",
    groomerNotes: "",
    petPhoto: null,
    // Info Cliente - Paso 3:
    firstName: "",
    lastName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    parkingNotes: "Driveway available",
    latitude: null,
    longitude: null,
    // Calendario - Paso 4:
    scheduledDate: initialDate?.fullDate || "Tomorrow",
    scheduledTime: initialSlots[0]?.time || "9:30 AM",
    // Disclaimer con firma - Paso 5:
    signature: null,
    agreedToTerms: true,
  });

  const reset = () => {
    setStep(0);
    setDir("back");
    setCompleted(false);
    setIsDescExpanded(false);
    setInvoicePdf(null);
    setEmailNotice(null);
    setData({
      size: "small",
      packageId: "",
      addons: [],
      petName: "",
      breed: "",
      petAge: "Adult (1–7 yrs)",
      gender: "male",
      petCondition: "Healthy & Well-Maintained",
      vaccinated: "yes",
      medicalConditions: "None / Healthy",
      groomerNotes: "",
      petPhoto: null,
      firstName: "",
      lastName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      parkingNotes: "Driveway available",
      latitude: null,
      longitude: null,
      scheduledDate: initialDate?.fullDate || "Tomorrow",
      scheduledTime: initialSlots[0]?.time || "9:30 AM",
      signature: null,
      agreedToTerms: true,
    });
  };

  // Step Completion Validation Rules
  const canNext = Boolean(
    (step === 0 && Boolean(data.size)) ||
      (step === 1 && Boolean(data.packageId)) ||
      (step === 2 && data.petName.trim().length >= 1 && data.breed.trim().length >= 2 && Boolean(data.gender)) ||
      (step === 3 && Boolean(data.petCondition) && Boolean(data.vaccinated)) ||
      (step === 4 &&
        (data.firstName.trim().length >= 1 || data.ownerName.trim().length >= 2) &&
        data.email.includes("@") &&
        data.phone.trim().length >= 6 &&
        data.address.trim().length >= 4) ||
      (step === 5 && Boolean(data.scheduledDate) && Boolean(data.scheduledTime)) ||
      (step === 6 && Boolean(data.signature) && data.agreedToTerms)
  );

  useEffect(() => {
    onStatus({ armed: canNext && !completed, dispatched: completed });
  }, [canNext, completed, onStatus]);

  const prevCanNext = useRef(false);
  useEffect(() => {
    if (canNext && !prevCanNext.current) {
      setJustArmed(true);
      const id = setTimeout(() => setJustArmed(false), 750);
      return () => clearTimeout(id);
    }
    prevCanNext.current = canNext;
  }, [canNext]);

  const activeIndex = completed ? 6 : step;

  // Pricing calculations
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId);
  const baseServicePrice = selectedPkg?.prices[data.size as PetSize] || 0;
  const addonsCost = data.addons.reduce((sum, addId) => {
    const item = SPA_UPGRADES.find((u) => u.id === addId);
    if (!item) return sum;
    const num = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + num;
  }, 0);
  const currentEstimatedTotal = baseServicePrice + addonsCost;
  const currentSizeObj = SIZE_GUIDE.find((s) => s.id === data.size);
  const selectedPkgName = selectedPkg ? selectedPkg.name : "Select a service";

  const handleNext = () => {
    if (step < STEPS_TOTAL - 1) {
      setDir("fwd");
      setStep(step + 1);
    } else {
      // Step 6 completed: Finalize booking!
      const pkg = selectedPkg?.name || "Signature Grooming";
      const addonsText = data.addons.length > 0 ? data.addons.join(", ") : "None";
      const resolvedOwnerName = data.ownerName || `${data.firstName} ${data.lastName}`.trim();

      // Save to Dispatch Admin Store
      addDispatchRequest({
        customerName: resolvedOwnerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        lat: data.latitude || 37.7749 + (Math.random() - 0.5) * 0.08,
        lng: data.longitude || -122.4194 + (Math.random() - 0.5) * 0.08,
        petName: data.petName,
        breed: data.breed,
        size: data.size,
        gender: data.gender,
        petAge: data.petAge,
        vaccinated: data.vaccinated,
        medicalConditions: data.medicalConditions,
        temperament: data.petCondition,
        groomerNotes: data.groomerNotes,
        parkingNotes: data.parkingNotes,
        petPhoto: data.petPhoto,
        packageId: data.packageId || "signature-grooming",
        packageName: pkg,
        addons: data.addons,
        estimatedTotal: currentEstimatedTotal,
        preferredTime: `${data.scheduledDate} at ${data.scheduledTime}`,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        etaMinutes: 20,
        vanId: "VAN-01",
        vanName: "Van 01 (SF Bay Area Mobile Fleet)",
        status: "pending",
        signature: data.signature,
        notes: `Booked for ${data.scheduledDate} @ ${data.scheduledTime}. Parking: ${data.parkingNotes}. Medical: ${data.medicalConditions}. Groomer: ${data.groomerNotes}`,
      });

      // Asynchronously trigger Resend email via Vercel serverless function
      fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: resolvedOwnerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          parkingNotes: data.parkingNotes,
          petName: data.petName,
          breed: data.breed,
          size: data.size,
          gender: data.gender,
          petAge: data.petAge,
          petCondition: data.petCondition,
          vaccinated: data.vaccinated,
          medicalConditions: data.medicalConditions,
          groomerNotes: data.groomerNotes,
          packageName: pkg,
          addons: data.addons,
          estimatedTotal: currentEstimatedTotal,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          signature: data.signature,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          console.log("Resend API response:", resData);
          if (resData?.pdfBase64) {
            setInvoicePdf({
              base64: resData.pdfBase64,
              fileName: resData.fileName || "SOUVA-Invoice.pdf",
            });
          }
          if (resData?.emailSent) {
            setEmailNotice({
              type: "success",
              message: `Official invoice & confirmation sent to ${data.email}!`,
            });
          } else if (resData?.hint) {
            setEmailNotice({
              type: "warning",
              message: resData.hint,
            });
          } else if (resData?.message) {
            setEmailNotice({
              type: "warning",
              message: resData.message,
            });
          }
        })
        .catch((err) => {
          console.warn("Resend email notification queued/sent with local fallback:", err);
        });

      setDir("fwd");
      setCompleted(true);
    }
  };

  return (
    <div className="w-full">
      <StatusLedGrid activeIndex={activeIndex} hot={completed} />

      {/* Header controls */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={() => {
            if (step > 0 && !completed) {
              setDir("back");
              setStep(step - 1);
            }
          }}
          disabled={step === 0 || completed}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FAF0E2]/15 bg-[#1B1E15] text-[#A4AA93] hover:text-[#FAF0E2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-xs font-semibold text-[#AA8B63] font-mono tracking-wider">
          {completed ? "BOOKING SUMMARY" : `STEP ${step + 1} OF ${STEPS_TOTAL}`}
        </div>

        <div className="w-9" />
      </div>

      {/* Progress Bar */}
      {!completed && (
        <div className="mt-1 mb-4 energy-bar-wrap">
          <div className="energy-bar-track">
            <div
              className="energy-bar-fill"
              style={{ width: `${((step + 1) / STEPS_TOTAL) * 100}%` }}
            >
              <span className="energy-dot energy-dot--1" />
              <span className="energy-dot energy-dot--2" />
              <span className="energy-dot energy-dot--3" />
            </div>
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {Array.from({ length: STEPS_TOTAL }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "text-[8px] font-mono font-bold transition-colors",
                  i <= step ? "text-[#FAF0E2]/80" : "text-[#FAF0E2]/20"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Dynamic Step View */}
      <div className="pb-3 pt-1">
        <div
          key={completed ? "completed" : `step-${step}`}
          className="flow-view relative z-20"
          data-dir={dir}
        >
          {completed ? (
            <BookingSummaryView
              data={data}
              invoicePdf={invoicePdf}
              emailNotice={emailNotice}
              onReset={reset}
            />
          ) : step === 0 ? (
            <StepPetSize data={data} setData={setData} />
          ) : step === 1 ? (
            <StepServicePackage data={data} setData={setData} />
          ) : step === 2 ? (
            <StepDogBasics data={data} setData={setData} />
          ) : step === 3 ? (
            <StepDogHealthCare data={data} setData={setData} />
          ) : step === 4 ? (
            <StepClientInfo data={data} setData={setData} />
          ) : step === 5 ? (
            <StepBookingCalendar data={data} setData={setData} dates={availableDates} />
          ) : (
            <StepServiceAgreement data={data} setData={setData} />
          )}
        </div>

        {/* PERSISTENT LIVE SUMMARY BAR & PRICE COUNTER WITH EXPANDABLE SERVICE DETAILS */}
        {!completed && (
          <div className="mt-4 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-md overflow-hidden transition-all">
            {/* Summary Top Row */}
            <div className="p-3 flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-[#25281D] border border-[#AA8B63]/40 flex items-center justify-center shrink-0">
                  <span className="text-sm">🐾</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#FAF0E2] truncate">
                      {data.petName.trim() ? data.petName : "Your Dog"}
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#25281D] text-[#AA8B63] font-bold uppercase shrink-0">
                      {currentSizeObj?.label || data.size}
                    </span>
                    {data.gender && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C1F15] text-[#A4AA93] capitalize shrink-0">
                        {data.gender}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#A4AA93] truncate">
                    {selectedPkgName}
                    {data.addons.length > 0 ? ` · +${data.addons.length} upgrade${data.addons.length > 1 ? "s" : ""}` : ""}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-[#A4AA93] uppercase block">
                  Estimated Total
                </span>
                <span className="font-display font-extrabold text-lg text-[#AA8B63]">
                  {data.packageId ? `$${currentEstimatedTotal}` : "—"}
                </span>
              </div>
            </div>

            {/* Expandable Service Inclusions Dropdown */}
            {selectedPkg ? (
              <div className="border-t border-[#FAF0E2]/10 bg-[#181B12]/80 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="w-full flex items-center justify-between text-[11px] font-medium text-[#AA8B63] hover:text-[#FAF0E2] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {isDescExpanded ? "Hide" : "View"} {selectedPkg.name} description & what's included
                    </span>
                  </span>
                  {isDescExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  )}
                </button>

                {isDescExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#FAF0E2]/10 space-y-3 text-xs animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#A4AA93] uppercase tracking-wider mb-1">
                        <span>About this service</span>
                        <span className="text-[#AA8B63] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Est. {selectedPkg.duration}</span>
                        </span>
                      </div>
                      <p className="text-[#FAF0E2]/90 leading-relaxed text-[11.5px]">
                        {selectedPkg.tagline}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#A4AA93] uppercase tracking-wider block mb-1.5">
                        What's included ({selectedPkg.includes.length} treatments):
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedPkg.includes.map((inc) => (
                          <div key={inc} className="flex items-center gap-1.5 text-[11px] text-[#FAF0E2]/85">
                            <Check className="h-3 w-3 text-[#AA8B63] shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {data.addons.length > 0 && (
                      <div className="pt-2 border-t border-[#FAF0E2]/10">
                        <span className="text-[10px] font-mono text-[#AA8B63] uppercase tracking-wider block mb-1">
                          Selected Spa Upgrades ({data.addons.length}):
                        </span>
                        <div className="space-y-1">
                          {data.addons.map((addId) => {
                            const addObj = SPA_UPGRADES.find((u) => u.id === addId);
                            if (!addObj) return null;
                            return (
                              <div key={addId} className="flex items-center justify-between text-[11px]">
                                <span className="text-[#FAF0E2]/90 font-medium">✨ {addObj.name}</span>
                                <span className="font-mono text-[#AA8B63] font-bold">{addObj.price}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-[#FAF0E2]/5 bg-[#181B12]/40 px-3 py-2 text-[10.5px] font-mono text-[#A4AA93]/70 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[#AA8B63]/70 shrink-0" />
                <span>Select a service above to review its full description and treatment inclusions.</span>
              </div>
            )}
          </div>
        )}

        {/* Main Action Button */}
        {!completed && (
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className={cn(
              "mt-4 w-full py-4 text-sm font-bold btn-luxury relative z-10 flex items-center justify-center gap-2",
              justArmed && "just-armed"
            )}
          >
            {step === 1 ? (
              <span className="flex items-center justify-center gap-2">
                <Calendar className="h-4.5 w-4.5" />
                <span>Schedule Now · Book Appointment</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            ) : step === STEPS_TOTAL - 1 ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Confirm Booking</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------- STEP 0: TAMAÑO DEL PERRO -------------------- */
function StepPetSize({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 1 · Dog Size"
        title="Choose Your Pet's Size"
        subtitle="View the 3D model of each size to ensure custom space and suite preparation inside our solar van."
      />
      <div className="mt-4">
        <PetBlueprint
          selectedSize={data.size}
          onSelectSize={(size) => setData({ ...data, size })}
        />
      </div>
    </div>
  );
}

/* -------------------- STEP 1: SERVICIO (2x2 GRID + SPA UPGRADES) -------------------- */
function StepServicePackage({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const toggleAddon = (addonId: string) => {
    let next = [...data.addons];
    if (next.includes(addonId)) {
      next = next.filter((a) => a !== addonId);
    } else {
      next.push(addonId);
    }
    setData({ ...data, addons: next });
  };

  const services2x2 = [
    {
      id: "bath-refresh",
      title: "Bath & Brush",
      subtitle: "Bath, dry, nails, ears",
      price: SOUVA_PACKAGES.find((p) => p.id === "bath-refresh")?.prices[data.size as PetSize] || 65,
    },
    {
      id: "bath-tidy",
      title: "Bath & Tidy",
      subtitle: "+ sanitary, paw & face trim",
      price: SOUVA_PACKAGES.find((p) => p.id === "bath-tidy")?.prices[data.size as PetSize] || 80,
    },
    {
      id: "essential-full-groom",
      title: "Full Groom",
      subtitle: "Short haircut / shave-down",
      price: SOUVA_PACKAGES.find((p) => p.id === "essential-full-groom")?.prices[data.size as PetSize] || 110,
    },
    {
      id: "signature-grooming",
      title: "Signature Grooming",
      subtitle: 'Longer style ½"+ · Scissor finish',
      price: SOUVA_PACKAGES.find((p) => p.id === "signature-grooming")?.prices[data.size as PetSize] || 125,
    },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Service"
        title="Select Your Grooming Service"
        subtitle="Choose the service that fits your pet's styling and maintenance needs."
      />

      {/* 2x2 Segmented Grid */}
      <div className="mt-4 p-2 rounded-3xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-inner">
        <div className="grid grid-cols-2 gap-2">
          {services2x2.map((item) => {
            const isSelected = data.packageId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setData({ ...data, packageId: item.id })}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer select-none flex flex-col justify-between min-h-[96px]",
                  isSelected
                    ? "bg-[#FAF0E2] text-[#161811] shadow-[0_8px_20px_rgba(0,0,0,0.4)] scale-[1.02]"
                    : "bg-[#1C1F15]/60 text-[#FAF0E2]/90 hover:bg-[#25281D] hover:text-[#FAF0E2]"
                )}
              >
                <div>
                  <div
                    className={cn(
                      "text-sm sm:text-base font-display font-bold leading-tight",
                      isSelected ? "text-[#161811]" : "text-[#FAF0E2]"
                    )}
                  >
                    {item.title}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] font-mono mt-1 leading-snug",
                      isSelected ? "text-[#59593E] font-medium" : "text-[#A4AA93]"
                    )}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9.5px] font-mono uppercase tracking-wider",
                      isSelected ? "text-[#161811]/70" : "text-[#A4AA93]"
                    )}
                  >
                    From
                  </span>
                  <span
                    className={cn(
                      "font-mono font-extrabold text-sm",
                      isSelected ? "text-[#161811]" : "text-[#AA8B63]"
                    )}
                  >
                    ${item.price}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!data.packageId && (
        <div className="mt-2 text-center text-[10.5px] font-mono text-[#AA8B63] animate-pulse">
          Please select one of the 4 services above to continue
        </div>
      )}

      {/* Spa Upgrades / Add-ons */}
      <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider">
            Spa Upgrades & Add-ons
          </label>
          <span className="text-[10px] font-mono text-[#AA8B63]">Optional</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SPA_UPGRADES.map((add) => {
            const isSelected = data.addons.includes(add.id);
            return (
              <button
                key={add.id}
                type="button"
                onClick={() => toggleAddon(add.id)}
                className={cn(
                  "p-2.5 rounded-xl border text-left text-xs font-medium transition-all duration-300 cursor-pointer select-none flex flex-col justify-between",
                  isSelected
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
                title={add.desc}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[11px] font-bold text-[#FAF0E2] line-clamp-1">{add.name}</span>
                  {isSelected && <Check className="h-3 w-3 text-[#AA8B63] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[10px] font-mono text-[#AA8B63] mt-1 font-bold">{add.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 2: INFO PERRO (PASO 1) -------------------- */
function StepDogBasics({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filteredBreeds = data.breed
    ? breedsList.filter((b) => b.toLowerCase().includes(data.breed.toLowerCase())).slice(0, 6)
    : breedsList.slice(0, 5);

  const ageOptions = ["Puppy (< 1 yr)", "Adult (1–7 yrs)", "Senior (8+ yrs)"];

  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · Dog Info (Part 1)"
        title="Tell Us About Your Dog"
        subtitle="Basic details so our master groomer knows who they will be pampering."
      />

      <div className="mt-4 space-y-3.5">
        {/* Pet Name */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dog's Name (Nombre del perro)
          </label>
          <div className="relative">
            <Heart className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
            <input
              type="text"
              value={data.petName}
              onChange={(e) => setData({ ...data, petName: e.target.value })}
              placeholder="e.g. Milo, Luna, Bella..."
              className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>
        </div>

        {/* Breed Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dog's Breed or Mix (Raza del perro)
          </label>
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
            <input
              type="text"
              value={data.breed}
              onChange={(e) => {
                setData({ ...data, breed: e.target.value });
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="e.g. Golden Retriever, Doodle, Frenchie..."
              className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              autoComplete="off"
            />
          </div>

          {isOpen && filteredBreeds.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[#FAF0E2]/15 bg-[#1F2318]/95 backdrop-blur-md p-1 shadow-2xl">
              {filteredBreeds.map((breed) => (
                <button
                  key={breed}
                  type="button"
                  onClick={() => {
                    setData({ ...data, breed });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#FAF0E2] hover:bg-[#AA8B63]/20 rounded-lg transition-colors cursor-pointer font-medium flex items-center justify-between"
                >
                  <span>{breed}</span>
                  <span className="text-[10px] text-[#AA8B63]">Select</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender (Macho o Hembra) & Age Side-by-Side */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Gender: Macho o Hembra */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Gender (Macho o Hembra)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setData({ ...data, gender: "male" })}
                className={cn(
                  "py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  data.gender === "male"
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-md"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                <span>♂ Macho (Male)</span>
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, gender: "female" })}
                className={cn(
                  "py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  data.gender === "female"
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-md"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                <span>♀ Hembra (Female)</span>
              </button>
            </div>
          </div>

          {/* Age Selection */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Age (Edad del perro)
            </label>
            <div className="grid grid-cols-3 gap-1">
              {ageOptions.map((age) => {
                const isSelected = data.petAge === age;
                return (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setData({ ...data, petAge: age })}
                    className={cn(
                      "py-2 rounded-xl border text-center text-[10.5px] font-medium transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-sm"
                        : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                    )}
                  >
                    {age.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 3: INFO PERRO (PASO 2 - CONDICIÓN Y SALUD) -------------------- */
function StepDogHealthCare({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, petPhoto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const coatConditions = [
    "Healthy & Smooth",
    "Light Tangles",
    "Matted / Needs Detangling",
    "Calm & Gentle",
    "Anxious / Sensitive",
  ];

  const medicalOptions = [
    "None / Healthy",
    "Arthritis / Joint Stiffness",
    "Allergies / Sensitive Skin",
    "Senior Special Care",
    "Ear Sensitivity / Infection Prone",
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 4 · Dog Info (Part 2)"
        title="Health, Condition & Notes"
        subtitle="Help our master groomer prepare specialized handling, hypoallergenic shampoos, and customized tools."
      />

      <div className="mt-4 space-y-3">
        {/* Coat / Overall Condition */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dog's Condition & Temperament (Condición del perro)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {coatConditions.map((cond) => {
              const isSelected = data.petCondition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setData({ ...data, petCondition: cond })}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-sm"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vaccines & Medical Condition */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          {/* Vacunas */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#AA8B63]" />
              <span>Rabies Vaccine (Vacunas)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setData({ ...data, vaccinated: "yes" })}
                className={cn(
                  "p-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer",
                  data.vaccinated === "yes"
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                ✓ Up to Date
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, vaccinated: "no" })}
                className={cn(
                  "p-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer",
                  data.vaccinated === "no"
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                In Progress
              </button>
            </div>
          </div>

          {/* Medical Condition Dropdown / Select */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-[#AA8B63]" />
              <span>Medical Conditions (Médica)</span>
            </label>
            <select
              value={data.medicalConditions}
              onChange={(e) => setData({ ...data, medicalConditions: e.target.value })}
              className="w-full h-9 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-lg px-2.5 text-xs text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63] cursor-pointer"
            >
              {medicalOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#191C13] text-[#FAF0E2]">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notas para el Groomer */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Notes for the Groomer (Notas para el groomer)
          </label>
          <textarea
            value={data.groomerNotes}
            onChange={(e) => setData({ ...data, groomerNotes: e.target.value })}
            placeholder="e.g. Sensitive around front paws, loves belly rubs, preferred haircut style..."
            rows={2}
            className="w-full p-2.5 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] resize-none"
          />
        </div>

        {/* Foto del Perro */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Dog Photo (Foto del perro)</span>
            </label>
            <span className="text-[9.5px] font-mono text-[#AA8B63]">Optional</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {data.petPhoto ? (
            <div className="p-2.5 rounded-xl bg-[#14160F] border border-[#AA8B63]/60 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <img
                  src={data.petPhoto}
                  alt="Pet preview"
                  className="h-10 w-10 object-cover rounded-lg border border-[#FAF0E2]/20"
                />
                <div>
                  <span className="text-xs font-bold text-[#FAF0E2] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span>Photo attached</span>
                  </span>
                  <span className="text-[10px] text-[#A4AA93]">Ready for coat assessment</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-xs text-[#AA8B63] hover:bg-[#25281D] rounded-lg"
                  title="Change photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, petPhoto: null })}
                  className="p-1.5 text-xs text-red-400 hover:bg-red-950/30 rounded-lg"
                  title="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-2.5 rounded-xl border border-dashed border-[#FAF0E2]/20 hover:border-[#AA8B63] bg-[#14160F]/60 hover:bg-[#1C1F15] transition-all flex items-center justify-between gap-3 cursor-pointer group text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-[#22261A] group-hover:bg-[#AA8B63] group-hover:text-[#161811] text-[#AA8B63] flex items-center justify-center shrink-0">
                <Camera className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] block">
                  Upload dog photo
                </span>
                <span className="text-[10px] text-[#A4AA93] block truncate">
                  Helps us see coat length & styling
                </span>
              </div>
              <Upload className="h-3.5 w-3.5 text-[#A4AA93] group-hover:text-[#AA8B63] shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 4: INFORMACIÓN DEL CLIENTE (PASO 3) -------------------- */
function StepClientInfo({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [locateProgress, setLocateProgress] = useState(0);
  const [locateError, setLocateError] = useState("");

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocateProgress(10);
    setLocateError("");

    const interval = setInterval(() => {
      setLocateProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 250);

    if (!navigator.geolocation) {
      clearInterval(interval);
      setLocateProgress(100);
      setLocateError("Geolocation is not supported by your browser");
      setTimeout(() => setIsLocating(false), 800);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const result = await response.json();
          const addrObj = result.address || {};
          const street = addrObj.road || addrObj.suburb || "";
          const houseNumber = addrObj.house_number || "";
          const city = addrObj.city || addrObj.town || addrObj.village || "San Francisco";
          const state = addrObj.state || "CA";
          const postcode = addrObj.postcode || "";

          const cleanAddr =
            [
              houseNumber && street ? `${houseNumber} ${street}` : street || result.name,
              city,
              state,
              postcode,
            ]
              .filter(Boolean)
              .join(", ") ||
            result.display_name ||
            `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

          clearInterval(interval);
          setLocateProgress(100);
          setTimeout(() => {
            setData((prev) => ({
              ...prev,
              latitude,
              longitude,
              address: cleanAddr,
            }));
            setIsLocating(false);
          }, 500);
        } catch {
          clearInterval(interval);
          setLocateProgress(100);
          setTimeout(() => {
            setData((prev) => ({
              ...prev,
              latitude,
              longitude,
              address: `GPS Doorstep (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            }));
            setIsLocating(false);
          }, 500);
        }
      },
      (error) => {
        clearInterval(interval);
        setLocateProgress(100);
        setLocateError(error.message || "Failed to locate");
        setTimeout(() => setIsLocating(false), 1000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div>
      <StepHeader
        eyebrow="Step 5 · Client Info"
        title="Client Contact & Doorstep Address"
        subtitle="Where should our luxury mobile spa van park for your dog's appointment?"
      />

      <div className="mt-4 space-y-3">
        {/* Nombre & Apellido */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              First Name (Nombre)
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
              <input
                type="text"
                value={data.firstName}
                onChange={(e) => {
                  const firstName = e.target.value;
                  setData({
                    ...data,
                    firstName,
                    ownerName: `${firstName} ${data.lastName}`.trim(),
                  });
                }}
                placeholder="e.g. Jessica"
                className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Last Name (Apellido)
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => {
                const lastName = e.target.value;
                setData({
                  ...data,
                  lastName,
                  ownerName: `${data.firstName} ${lastName}`.trim(),
                });
              }}
              placeholder="e.g. Miller"
              className="w-full px-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Phone Number (Teléfono)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Email Address (Email)
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>
          </div>
        </div>

        {/* Address & GPS */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Doorstep Street Address (Dirección)
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Street, number, apt (SF Bay Area & East Bay)"
              className="w-full pl-10 pr-28 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
            <button
              type="button"
              disabled={isLocating}
              onClick={handleUseMyLocation}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[9px] font-bold font-mono tracking-wide text-[#AA8B63] border border-[#AA8B63]/30 hover:border-[#AA8B63] hover:bg-[#AA8B63]/10 rounded-lg transition-all cursor-pointer select-none disabled:opacity-50"
            >
              {isLocating ? "LOCATING..." : "GPS LOCATE"}
            </button>
          </div>

          {isLocating && (
            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between text-[9.5px] text-[#AA8B63] font-mono font-bold uppercase tracking-wide animate-pulse">
                <span>SYNCING SATELLITES...</span>
                <span>{locateProgress}%</span>
              </div>
              <div className="energy-bar-wrap">
                <div className="energy-bar-track">
                  <div
                    className="energy-bar-fill animate-pulse"
                    style={{ width: `${locateProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {locateError && (
            <div className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wide mt-1">
              ERROR: {locateError}
            </div>
          )}
        </div>

        {/* Parking Notes (Nota sobre parking) */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Parking Notes for Van (Nota sobre parking)</span>
          </label>
          <input
            type="text"
            value={data.parkingNotes}
            onChange={(e) => setData({ ...data, parkingNotes: e.target.value })}
            placeholder="e.g. Private driveway, curbside street parking, gate code #1234..."
            className="w-full px-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
          />
          <span className="text-[10px] text-[#A4AA93]/70 font-mono mt-0.5 block">
            Our solar van is self-contained and needs approx. 2 car lengths to park.
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 5: CALENDARIO DE DISPONIBILIDAD (PASO 4) -------------------- */
function StepBookingCalendar({
  data,
  setData,
  dates,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  dates: AvailableDate[];
}) {
  const selectedDateObj = dates.find((d) => d.fullDate === data.scheduledDate) || dates[0];
  const activeSlots = SCHEDULE_BY_DAY[selectedDateObj.dayOfWeek] || [];

  return (
    <div>
      <StepHeader
        eyebrow="Step 6 · Schedule"
        title="Calendar & Arrival Window"
        subtitle="Select your preferred date and 30-minute arrival window for our mobile spa van."
      />

      <div className="mt-4 space-y-4">
        {/* Date Selector Carousel */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Select Date (Next 14 Days)</span>
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((d) => {
              const isSelected = data.scheduledDate === d.fullDate;
              return (
                <button
                  key={d.fullDate}
                  type="button"
                  onClick={() => {
                    const daySlots = SCHEDULE_BY_DAY[d.dayOfWeek] || [];
                    const keepTime = daySlots.some((s) => s.time === data.scheduledTime);
                    setData({
                      ...data,
                      scheduledDate: d.fullDate,
                      scheduledTime: keepTime ? data.scheduledTime : daySlots[0]?.time || "",
                    });
                  }}
                  className={cn(
                    "min-w-[70px] p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer shrink-0 flex flex-col items-center justify-center",
                    isSelected
                      ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-lg scale-105"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                  )}
                >
                  <span className={cn("text-[9px] font-mono uppercase", isSelected ? "text-[#161811]/90 font-bold" : "text-[#AA8B63]")}>
                    {d.dayLabel}
                  </span>
                  <span className="font-display font-extrabold text-base my-0.5">
                    {d.dayNum}
                  </span>
                  <span className="text-[9px] font-mono opacity-80">
                    {d.month}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Time Slot Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Available Arrival Windows ({activeSlots.length} available)</span>
            </label>
            <span className="text-[10px] font-mono text-[#AA8B63]">
              {selectedDateObj?.dayLabel} Schedule
            </span>
          </div>

          <div
            className={cn(
              "grid gap-2",
              activeSlots.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
            )}
          >
            {activeSlots.map((slot) => {
              const isSelected = data.scheduledTime === slot.time;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setData({ ...data, scheduledTime: slot.time })}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center",
                    isSelected
                      ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] font-bold shadow-sm scale-102"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/30"
                  )}
                >
                  <span className="font-mono text-xs font-bold text-[#FAF0E2]">{slot.time}</span>
                  <span className="text-[8.5px] font-mono text-[#AA8B63] opacity-80 mt-0.5">{slot.period}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Window Confirmation Callout */}
        <div className="p-3 rounded-2xl bg-[#14160F] border border-[#AA8B63]/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#AA8B63] shrink-0" />
            <div>
              <span className="text-[10px] text-[#A4AA93] font-mono block">Confirmed Doorstep Window:</span>
              <strong className="text-[#FAF0E2] font-display text-xs sm:text-sm">
                {data.scheduledDate} · {data.scheduledTime}
              </strong>
            </div>
          </div>
          <span className="text-[9px] font-mono text-[#AA8B63] bg-[#AA8B63]/15 px-2 py-1 rounded-lg shrink-0">
            30-Min Arrival Window
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 6: DISCLAIMER CON FIRMA (PASO 5) -------------------- */
function StepServiceAgreement({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 7 · Agreement"
        title="Service Agreement & Signature"
        subtitle="Review our pet care policies and provide your digital signature to confirm your booking."
      />

      <div className="mt-4 space-y-3.5">
        {/* Disclaimer Text Box matching user image exactly */}
        <div className="rounded-2xl border border-[#FAF0E2]/10 bg-[#161811] p-3.5 text-xs text-[#A4AA93] space-y-2.5 leading-relaxed">
          <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
            Service Agreement
          </h4>
          <p className="font-medium text-[#FAF0E2]/90">
            Pets are accepted for grooming only under the following circumstances....
          </p>
          <p>
            The pet is fit and healthy, Grooming which takes place on an elderly or infirm pet will be at the owner's risk. Grooming may expose pre-existing health\skin conditions for which Souva Mobile Pet Grooming cannot be held liable.
          </p>
          <p>
            The pet's rabies vaccine is up to date (as required by law) unless otherwise discussed.
          </p>
          <p>
            In the event of an emergency, in your absence, you authorize Souva to contact the nearest Veterinarian and authorize the Vet to treat the pet as necessary at your expense.
          </p>
          <p>
            Payment is to be made at the time of service. Payment can be cash, check or credit card zelle.
          </p>
        </div>

        {/* Digital Signature Pad */}
        <SignaturePad
          value={data.signature}
          onChange={(sig) => setData({ ...data, signature: sig })}
          onClear={() => setData({ ...data, signature: null })}
        />

        {/* Consent Checkbox */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/10 cursor-pointer text-xs select-none">
          <input
            type="checkbox"
            checked={data.agreedToTerms}
            onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
            className="mt-0.5 accent-[#AA8B63] h-4 w-4 rounded cursor-pointer shrink-0"
          />
          <span className="text-[#A4AA93] leading-snug">
            I confirm that I am authorized to sign on behalf of{" "}
            <strong className="text-[#FAF0E2]">{data.petName || "my pet"}</strong>, agree to all terms of the Service Agreement, and approve doorstep grooming.
          </span>
        </label>
      </div>
    </div>
  );
}

/* -------------------- SIGNATURE PAD CANVAS COMPONENT -------------------- */
function SignaturePad({
  value,
  onChange,
  onClear,
}: {
  value: string | null;
  onChange: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(Boolean(value));

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#FAF0E2";
    ctx.lineWidth = 2.5;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasStroke(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onClear();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-[#FAF0E2] uppercase tracking-wider font-mono">
          Signature:
        </label>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-[#AA8B63] hover:text-[#FAF0E2] transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="relative w-full h-28 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/20 overflow-hidden flex items-center justify-center shadow-inner">
        {!hasStroke && !value && (
          <div className="absolute pointer-events-none select-none text-[#A4AA93]/40 font-sans text-sm font-medium">
            Sign here
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair relative z-10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
    </div>
  );
}

/* -------------------- FINAL COMPLETED VIEW: BOOKING SUMMARY (NO ETA) -------------------- */
function BookingSummaryView({
  data,
  invoicePdf,
  emailNotice,
  onReset,
}: {
  data: GroomingFlowState;
  invoicePdf: { base64: string; fileName: string } | null;
  emailNotice: { type: "success" | "warning"; message: string } | null;
  onReset: () => void;
}) {
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId);
  const baseServicePrice = selectedPkg?.prices[data.size as PetSize] || 0;
  const addonsCost = data.addons.reduce((sum, addId) => {
    const item = SPA_UPGRADES.find((u) => u.id === addId);
    if (!item) return sum;
    return sum + (parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0);
  }, 0);
  const total = baseServicePrice + addonsCost;
  const sizeObj = SIZE_GUIDE.find((s) => s.id === data.size);
  const resolvedOwner = data.ownerName || `${data.firstName} ${data.lastName}`.trim();

  const handleDownloadInvoice = () => {
    if (!invoicePdf?.base64) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${invoicePdf.base64}`;
    link.download = invoicePdf.fileName || `SOUVA-Invoice-${data.petName || "Pet"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapsLink =
    data.latitude && data.longitude
      ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`;

  const waNumber = "18509600034";
  const message = `✨ VIP BOOKING CONFIRMED - SOUVA MOBILE PET GROOMING ✨

📅 SCHEDULED APPOINTMENT:
• Date: ${data.scheduledDate}
• Time Window: ${data.scheduledTime}

🐾 PET COMPANION:
• Name: ${data.petName}
• Breed: ${data.breed}
• Size: ${data.size.toUpperCase()} (${sizeObj?.weight})
• Age: ${data.petAge}
• Gender: ${data.gender.toUpperCase()}
• Condition: ${data.petCondition}
• Rabies Vaccine: ${data.vaccinated === "yes" ? "Up to date" : "In Progress"}
• Medical Notes: ${data.medicalConditions}
• Groomer Notes: ${data.groomerNotes || "None"}

✂️ SERVICE & PRICING:
• Package: ${selectedPkg?.name || "Signature Grooming"} ($${baseServicePrice})
• Spa Upgrades: ${data.addons.length > 0 ? data.addons.join(", ") : "None"} (+$${addonsCost})
• Estimated Total: $${total}

📍 DOORSTEP LOCATION:
• Parent: ${resolvedOwner}
• Phone: ${data.phone}
• Email: ${data.email}
• Address: ${data.address}
• Parking: ${data.parkingNotes || "Driveway / Curbside"}

📝 SERVICE AGREEMENT:
• Digitally Signed & Accepted by ${resolvedOwner}`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="py-2 text-left space-y-4">
      {/* Header Banner */}
      <div className="text-center pb-3 border-b border-[#FAF0E2]/10">
        <div className="relative mx-auto h-18 w-18 flex items-center justify-center mb-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#AA8B63]/30 to-[#59593E]/30 blur-xl" />
          <img
            src="/assets/souva-badge-circle-transparent.png"
            alt="SOUVA Badge"
            className="h-14 w-14 object-contain rounded-full shadow-[0_0_20px_rgba(170,139,99,0.5)] relative z-10"
          />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-[#AA8B63] flex items-center justify-center gap-1.5 font-mono">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#AA8B63]" />
          <span>Doorstep Appointment Confirmed</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-[#FAF0E2]">
          {data.scheduledDate}
          <span className="text-gradient-gold block font-mono text-xl sm:text-2xl mt-0.5">
            {data.scheduledTime}
          </span>
        </h3>
        <p className="text-xs text-[#A4AA93] mt-1 font-mono">
          30-Minute Arrival Window · Solar Van Dispatched Directly to Your Doorstep
        </p>
      </div>

      {/* Email Delivery Notification Banner */}
      {emailNotice && (
        <div
          className={cn(
            "p-3 rounded-2xl border text-xs flex items-start gap-2.5",
            emailNotice.type === "success"
              ? "bg-[#1B2317] border-[#AA8B63]/60 text-[#FAF0E2]"
              : "bg-[#252219] border-[#E5A86D]/50 text-[#FAF0E2]"
          )}
        >
          <Mail
            className={cn(
              "h-4 w-4 shrink-0 mt-0.5",
              emailNotice.type === "success" ? "text-[#AA8B63]" : "text-[#E5A86D]"
            )}
          />
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="font-bold block text-[11px] font-mono uppercase tracking-wider">
              {emailNotice.type === "success"
                ? "Confirmation Email Sent"
                : "Email Notification Notice"}
            </span>
            <p className="text-[11px] text-[#A4AA93] leading-relaxed">
              {emailNotice.message}
            </p>
          </div>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        {/* Dog Card */}
        <div className="p-3.5 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10">
            <span className="font-bold text-[#AA8B63] uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
              <Heart className="h-3 w-3" />
              <span>Pet Companion</span>
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#25281D] text-[#FAF0E2]">
              {data.gender} · {sizeObj?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {data.petPhoto ? (
              <img
                src={data.petPhoto}
                alt={data.petName}
                className="h-12 w-12 object-cover rounded-xl border border-[#AA8B63]/40 shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-[#25281D] border border-[#FAF0E2]/10 flex items-center justify-center text-lg shrink-0">
                🐾
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-display font-bold text-base text-[#FAF0E2] truncate">
                {data.petName}
              </h4>
              <p className="text-[11px] text-[#A4AA93] truncate">{data.breed}</p>
              <p className="text-[10px] text-[#AA8B63] font-mono">{data.petAge}</p>
            </div>
          </div>

          <div className="pt-1.5 space-y-1 text-[11px] border-t border-[#FAF0E2]/5">
            <div className="flex justify-between">
              <span className="text-[#A4AA93]">Condition:</span>
              <span className="text-[#FAF0E2] font-medium">{data.petCondition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A4AA93]">Vaccines:</span>
              <span className="text-[#FAF0E2] font-medium">{data.vaccinated === "yes" ? "Up to Date (Rabies)" : "In Progress"}</span>
            </div>
            {data.medicalConditions && data.medicalConditions !== "None / Healthy" && (
              <div className="flex justify-between">
                <span className="text-[#A4AA93]">Medical:</span>
                <span className="text-[#FAF0E2] font-medium text-right">{data.medicalConditions}</span>
              </div>
            )}
            {data.groomerNotes && (
              <div className="pt-1 border-t border-[#FAF0E2]/5 text-[10.5px]">
                <span className="text-[#AA8B63] block font-mono">Groomer Notes:</span>
                <span className="text-[#FAF0E2]/80 italic">{data.groomerNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Client & Doorstep Card */}
        <div className="p-3.5 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10 mb-2">
              <span className="font-bold text-[#AA8B63] uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>Doorstep Location & Contact</span>
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[10px] text-[#A4AA93] font-mono uppercase block">Parent Name</span>
                <span className="font-bold text-[#FAF0E2]">{resolvedOwner}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A4AA93] font-mono uppercase block">Contact</span>
                <span className="text-[#FAF0E2]">{data.phone} · {data.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A4AA93] font-mono uppercase block">Doorstep Address</span>
                <span className="text-[#FAF0E2] font-medium block">{data.address}</span>
              </div>
              {data.parkingNotes && (
                <div className="pt-1 border-t border-[#FAF0E2]/5">
                  <span className="text-[10px] text-[#AA8B63] font-mono uppercase flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    <span>Parking Instructions</span>
                  </span>
                  <span className="text-[#FAF0E2]/90 block">{data.parkingNotes}</span>
                </div>
              )}
            </div>
          </div>

          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="text-[10.5px] font-mono text-[#AA8B63] hover:text-[#FAF0E2] underline underline-offset-2 flex items-center gap-1 mt-2"
          >
            <span>View Doorstep Pin on Google Maps</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Services & Pricing Receipt */}
      <div className="p-4 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 text-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#FAF0E2]/10">
          <span className="font-bold text-[#AA8B63] uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
            <Scissors className="h-3 w-3" />
            <span>Service & Price Breakdown</span>
          </span>
          <span className="text-[10px] font-mono text-[#A4AA93]">
            Doorstep Grooming Rate
          </span>
        </div>

        <div className="flex justify-between items-center py-1">
          <div>
            <span className="font-bold text-[#FAF0E2] text-sm block">
              {selectedPkg?.name || "Signature Grooming"}
            </span>
            <span className="text-[10px] text-[#A4AA93]">
              Custom tailored for {sizeObj?.label} ({sizeObj?.weight})
            </span>
          </div>
          <span className="font-mono font-extrabold text-sm text-[#FAF0E2]">
            ${baseServicePrice}
          </span>
        </div>

        {data.addons.length > 0 && (
          <div className="pt-2 border-t border-[#FAF0E2]/5 space-y-1">
            <span className="text-[10px] font-mono text-[#A4AA93] uppercase block">
              Selected Spa Upgrades:
            </span>
            {data.addons.map((addId) => {
              const upgrade = SPA_UPGRADES.find((u) => u.id === addId);
              if (!upgrade) return null;
              return (
                <div key={addId} className="flex justify-between text-[11px]">
                  <span className="text-[#A4AA93]">+{upgrade.name}</span>
                  <span className="font-mono text-[#FAF0E2] font-semibold">{upgrade.price}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2.5 mt-2 border-t border-[#FAF0E2]/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#A4AA93] block">
              Estimated Total Due
            </span>
            <span className="text-[10px] text-[#AA8B63]">
              Payment due at service: Cash, Check, Credit Card or Zelle
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl text-[#AA8B63]">
            ${total}
          </span>
        </div>
      </div>

      {/* Signature & Agreement Card */}
      {data.signature && (
        <div className="p-3.5 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold block flex items-center gap-1">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Service Agreement Verified</span>
            </span>
            <span className="text-xs text-[#FAF0E2] font-semibold block">
              Digitally Signed by {resolvedOwner}
            </span>
            <span className="text-[9.5px] text-[#A4AA93]">
              Accepted on {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="h-14 w-28 rounded-xl bg-[#14160F] border border-[#FAF0E2]/15 p-1 flex items-center justify-center shrink-0">
            <img
              src={data.signature}
              alt="Client signature"
              className="max-h-full max-w-full object-contain filter invert opacity-90"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 rounded-full bg-[#25D366] text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-[#20bd5a] transition-colors"
        >
          <span>Send Booking Confirmation via WhatsApp</span>
          <ArrowRight className="h-4 w-4" />
        </a>

        {invoicePdf ? (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="w-full py-3.5 rounded-full bg-[#1B1E15] border border-[#AA8B63] text-[#FAF0E2] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#AA8B63] hover:text-[#161811] transition-all cursor-pointer shadow-md group"
          >
            <FileDown className="h-4 w-4 text-[#AA8B63] group-hover:text-[#161811]" />
            <span>Download Official PDF Invoice & Receipt</span>
          </button>
        ) : (
          <div className="py-2.5 px-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10 text-center text-[10.5px] font-mono text-[#A4AA93]">
            <span>📄 Official PDF Invoice & Signed Agreement emailed to {data.email || "you"}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          className="w-full text-center py-2 text-xs text-[#A4AA93] hover:text-[#AA8B63] transition-colors font-semibold cursor-pointer underline underline-offset-4"
        >
          Book Another Appointment or Start Over
        </button>
      </div>
    </div>
  );
}
