import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  User,
  Mail,
  ChevronLeft,
  Clock,
  Truck,
  ArrowRight,
  Heart,
  Scissors,
  Check,
  Calendar,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetBlueprint } from "@/components/PetBlueprint";
import breedsList from "@/data/breeds.json";
import { SOUVA_PACKAGES, SPA_UPGRADES, SIZE_GUIDE, type PetSize } from "@/data/services";
import { addDispatchRequest } from "@/lib/dispatchStore";

export interface GroomingFlowState {
  size: PetSize;
  packageId: string; // Empty by default per user request
  addons: string[];
  petName: string;
  breed: string;
  petAge: string;
  vaccinated: "yes" | "no";
  medicalConditions: string;
  petPhoto: string | null;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  scheduledDate: string;
  scheduledTime: string;
}

const STEPS_TOTAL = 5;

// Dynamic Helper for next 10 days
function getAvailableDates() {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const fullDate = `${dayLabel}, ${month} ${dayNum}`;
    dates.push({ dayLabel, month, dayNum, fullDate });
  }
  return dates;
}

const TIME_SLOTS = [
  { id: "8:30 AM", period: "Morning", time: "8:30 AM" },
  { id: "10:30 AM", period: "Morning", time: "10:30 AM" },
  { id: "12:30 PM", period: "Midday", time: "12:30 PM" },
  { id: "2:30 PM", period: "Afternoon", time: "2:30 PM" },
  { id: "4:30 PM", period: "Afternoon", time: "4:30 PM" },
  { id: "6:00 PM", period: "Evening", time: "6:00 PM" },
];

/* -------------------- Status LED Grid -------------------- */
function StatusLedGrid({ activeIndex, hot }: { activeIndex: number; hot: boolean }) {
  const steps = [
    { icon: Sparkles, label: "Size" },
    { icon: Scissors, label: "Service" },
    { icon: Heart, label: "Pet Details" },
    { icon: MapPin, label: "Location" },
    { icon: Calendar, label: "Schedule" },
    { icon: Truck, label: "Dispatch" },
  ];

  return (
    <div
      className="ledgrid__track mb-6 select-none"
      style={{ "--cols": 6 } as React.CSSProperties}
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
                <IconComp className="h-4.5 w-4.5 relative z-10" />
                <span className="hidden sm:inline text-[8px] uppercase tracking-wider font-mono font-extrabold relative z-10">
                  {st.label.split(" ")[0]}
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
    <div>
      <div className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#FAF0E2]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#A4AA93] leading-relaxed">{subtitle}</p>
    </div>
  );
}

/* -------------------- Main Grooming Flow -------------------- */
export function GroomingFlow({
  onStatus,
}: {
  onStatus: (s: { armed: boolean; dispatched: boolean }) => void;
}) {
  const availableDates = getAvailableDates();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [dispatched, setDispatched] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(25 * 60);
  const [justArmed, setJustArmed] = useState(false);

  // NO service preselected by default (packageId: "") per user instruction!
  const [data, setData] = useState<GroomingFlowState>({
    size: "small",
    packageId: "",
    addons: [],
    petName: "",
    breed: "",
    petAge: "Adult (1–7 yrs)",
    vaccinated: "yes",
    medicalConditions: "None / Healthy",
    petPhoto: null,
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    latitude: null,
    longitude: null,
    scheduledDate: availableDates[1]?.fullDate || "Tomorrow",
    scheduledTime: "10:30 AM",
  });

  useEffect(() => {
    if (!dispatched) return;
    const id = setInterval(() => {
      setEtaSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [dispatched]);

  const reset = () => {
    setStep(0);
    setDir("back");
    setDispatched(false);
    setEtaSeconds(25 * 60);
    setData({
      size: "small",
      packageId: "",
      addons: [],
      petName: "",
      breed: "",
      petAge: "Adult (1–7 yrs)",
      vaccinated: "yes",
      medicalConditions: "None / Healthy",
      petPhoto: null,
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      latitude: null,
      longitude: null,
      scheduledDate: availableDates[1]?.fullDate || "Tomorrow",
      scheduledTime: "10:30 AM",
    });
  };

  const canNext = Boolean(
    (step === 0 && Boolean(data.size)) ||
      (step === 1 && Boolean(data.packageId)) || // Must pick service explicitly in Step 2
      (step === 2 && data.petName.trim().length >= 1 && data.breed.trim().length >= 2 && Boolean(data.vaccinated)) ||
      (step === 3 &&
        data.ownerName.trim().length >= 2 &&
        data.email.includes("@") &&
        data.phone.trim().length >= 6 &&
        data.address.trim().length >= 4) ||
      (step === 4 && Boolean(data.scheduledDate) && Boolean(data.scheduledTime))
  );

  useEffect(() => {
    onStatus({ armed: canNext && !dispatched, dispatched });
  }, [canNext, dispatched, onStatus]);

  const prevCanNext = useRef(false);
  useEffect(() => {
    if (canNext && !prevCanNext.current) {
      setJustArmed(true);
      const id = setTimeout(() => setJustArmed(false), 750);
      return () => clearTimeout(id);
    }
    prevCanNext.current = canNext;
  }, [canNext]);

  const activeIndex = dispatched ? 5 : step;

  // Calculate live dynamic totals
  const baseServicePrice = data.packageId
    ? SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.prices[data.size as PetSize] || 0
    : 0;

  const addonsCost = data.addons.reduce((sum, addId) => {
    const item = SPA_UPGRADES.find((u) => u.id === addId);
    if (!item) return sum;
    const num = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + num;
  }, 0);

  const currentEstimatedTotal = baseServicePrice + addonsCost;
  const currentSizeObj = SIZE_GUIDE.find((s) => s.id === data.size);
  const selectedPkgName = data.packageId
    ? SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.name
    : "No service selected yet";

  const handleNext = () => {
    if (step < STEPS_TOTAL - 1) {
      setDir("fwd");
      setStep(step + 1);
    } else {
      const waNumber = "18509600034";
      const pkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.name || "Signature Grooming";
      const addonsText = data.addons.length > 0 ? data.addons.join(", ") : "None";

      const mapsLink =
        data.latitude && data.longitude
          ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`;

      const message = `✨ VIP BOOKING - SOUVA MOBILE PET GROOMING ✨

📅 SCHEDULED APPOINTMENT:
• Date: ${data.scheduledDate}
• Time Window: ${data.scheduledTime}

🐾 PET COMPANION:
• Name: ${data.petName}
• Breed: ${data.breed}
• Size: ${data.size.toUpperCase()} (${currentSizeObj?.weight})
• Age: ${data.petAge}
• Core Vaccines Up-to-Date: ${data.vaccinated === "yes" ? "Yes" : "In Progress"}
• Medical / Physical Conditions: ${data.medicalConditions}
${data.petPhoto ? "• Photo: Attached on portal for stylist assessment\n" : ""}
✂️ SERVICE & SPA UPGRADES:
• Package: ${pkg} ($${baseServicePrice})
• Spa Upgrades: ${addonsText} (+$${addonsCost})
• Estimated Total: $${currentEstimatedTotal}

📍 CLIENT & DOORSTEP LOCATION:
• Parent: ${data.ownerName}
• Email: ${data.email}
• Phone: ${data.phone}
• Doorstep Address: ${data.address}
• Google Maps: ${mapsLink}

Please confirm our doorstep arrival! 🚐❤️`;

      // Save to Dispatch Admin Store
      addDispatchRequest({
        customerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        lat: data.latitude || 37.7749 + (Math.random() - 0.5) * 0.08,
        lng: data.longitude || -122.4194 + (Math.random() - 0.5) * 0.08,
        petName: data.petName,
        breed: data.breed,
        size: data.size,
        petAge: data.petAge,
        vaccinated: data.vaccinated,
        medicalConditions: data.medicalConditions,
        petPhoto: data.petPhoto,
        packageId: data.packageId,
        packageName: pkg,
        addons: data.addons,
        preferredTime: `${data.scheduledDate} at ${data.scheduledTime}`,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        etaMinutes: 25,
        vanId: "VAN-01",
        vanName: "Van 01 (SF & East Bay Fleet)",
        status: "assigned",
        notes: `Booked for ${data.scheduledDate} @ ${data.scheduledTime}. Medical: ${data.medicalConditions}`,
      });

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      setDir("fwd");
      setDispatched(true);
    }
  };

  return (
    <div className="w-full">
      <StatusLedGrid activeIndex={activeIndex} hot={dispatched} />

      {/* Header controls */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={() => {
            if (step > 0 && !dispatched) {
              setDir("back");
              setStep(step - 1);
            }
          }}
          disabled={step === 0 || dispatched}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FAF0E2]/15 bg-[#1B1E15] text-[#A4AA93] hover:text-[#FAF0E2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-xs font-semibold text-[#AA8B63] font-mono tracking-wider">
          {dispatched ? "DISPATCHED" : `STEP ${step + 1} OF ${STEPS_TOTAL}`}
        </div>

        <div className="w-9" />
      </div>

      {/* Energy Bar */}
      {!dispatched && (
        <div className="mt-2 mb-4 energy-bar-wrap">
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
          <div className="flex justify-between mt-1.5 px-0.5">
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
      <div className="pb-3 pt-2">
        <div
          key={dispatched ? "dispatched" : `step-${step}`}
          className="flow-view relative z-20"
          data-dir={dir}
        >
          {dispatched ? (
            <DispatchedSpaView eta={etaSeconds} data={data} onReset={reset} />
          ) : step === 0 ? (
            <StepPetSize data={data} setData={setData} />
          ) : step === 1 ? (
            <StepServicePackage data={data} setData={setData} />
          ) : step === 2 ? (
            <StepPetProfile data={data} setData={setData} />
          ) : step === 3 ? (
            <StepDoorstepLocation data={data} setData={setData} />
          ) : (
            <StepBookingSchedule data={data} setData={setData} dates={availableDates} />
          )}
        </div>

        {/* LIVE SELECTION SUMMARY & ESTIMATED TOTAL BAR */}
        {!dispatched && (
          <div className="mt-4 p-3 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-md flex items-center justify-between gap-3 text-xs select-none">
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
        )}

        {/* Action Button */}
        {!dispatched && (
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className={cn(
              "mt-4 w-full py-4 text-sm font-bold btn-luxury relative z-10 flex items-center justify-center gap-2",
              justArmed && "just-armed"
            )}
          >
            {step === STEPS_TOTAL - 1 ? (
              <span className="flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF0E2] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FAF0E2]" />
                </span>
                <Truck className="h-4.5 w-4.5" />
                <span>Confirm Booking & Dispatch Solar Van</span>
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

/* -------------------- STEP 1: PET SIZE & FLOATING ANIMATION -------------------- */
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
        eyebrow="Step 1 · Size"
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

/* -------------------- STEP 2: SERVICE (2x2 GRID - NO PRESELECTION) -------------------- */
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
      fullTitle: "Bath & Refresh",
      price: SOUVA_PACKAGES.find((p) => p.id === "bath-refresh")?.prices[data.size as PetSize] || 65,
    },
    {
      id: "bath-tidy",
      title: "Bath & Tidy",
      subtitle: "+ light trimming",
      fullTitle: "Bath & Tidy",
      price: SOUVA_PACKAGES.find((p) => p.id === "bath-tidy")?.prices[data.size as PetSize] || 80,
    },
    {
      id: "essential-full-groom",
      title: "Full Groom",
      subtitle: "Short / shave down",
      fullTitle: "Essential Full Groom",
      price: SOUVA_PACKAGES.find((p) => p.id === "essential-full-groom")?.prices[data.size as PetSize] || 110,
    },
    {
      id: "signature-grooming",
      title: "Signature Grooming",
      subtitle: 'Longer style ½"+ · Scissor finish',
      fullTitle: "Signature Grooming",
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

      {/* 2x2 Segmented Grid matching user image (NO preselected default) */}
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

      {/* Spa Upgrades / Add-ons (Full display without internal scroll) */}
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

/* -------------------- STEP 3: PET PROFILE (AGE, VACCINES, MEDICAL CONDITIONS, PHOTO) -------------------- */
function StepPetProfile({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, petPhoto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const filteredBreeds = data.breed
    ? breedsList.filter((b) => b.toLowerCase().includes(data.breed.toLowerCase())).slice(0, 6)
    : breedsList.slice(0, 5);

  const ageOptions = ["Puppy (< 1 yr)", "Adult (1–7 yrs)", "Senior (8+ yrs)"];

  const medicalOptions = [
    "None / Healthy",
    "Arthritis / Joint Stiffness",
    "Allergies / Sensitive Skin",
    "Vision / Hearing Loss",
    "Heart Condition / Senior Care",
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · Pet Details"
        title="Who is your companion?"
        subtitle="Provide their details, medical care notes, and vaccination status for safe handling."
      />

      {/* Step 3 Form Fields (Adaptive natural height - NO scrollbar) */}
      <div className="mt-4 space-y-3">
        {/* Pet Name & Breed Side-by-Side */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          {/* Pet Name */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Pet's Name
            </label>
            <div className="relative">
              <Heart className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AA8B63]" />
              <input
                type="text"
                value={data.petName}
                onChange={(e) => setData({ ...data, petName: e.target.value })}
                placeholder="e.g. Maya, Bruno..."
                className="w-full pl-9 pr-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>
          </div>

          {/* Breed Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Breed or Mix
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
                placeholder="e.g. Golden Retriever..."
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
        </div>

        {/* Pet Age & Vaccines Side-by-Side */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          {/* Pet Age */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Pet Age
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
                      "p-1.5 rounded-lg border text-center text-[10.5px] font-medium transition-all duration-200 cursor-pointer",
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

          {/* Vaccinated Question */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#AA8B63]" />
              <span>Core Vaccines?</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setData({ ...data, vaccinated: "yes" })}
                className={cn(
                  "p-1.5 rounded-lg border text-center text-[10.5px] font-semibold transition-all cursor-pointer",
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
                  "p-1.5 rounded-lg border text-center text-[10.5px] font-semibold transition-all cursor-pointer",
                  data.vaccinated === "no"
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                In Progress
              </button>
            </div>
          </div>
        </div>

        {/* Medical or Physical Conditions */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Medical or Physical Conditions?</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {medicalOptions.map((opt) => {
              const isSelected = data.medicalConditions === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setData({ ...data, medicalConditions: opt })}
                  className={cn(
                    "px-2 py-1 rounded-lg border text-[10.5px] font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-sm"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Pet Photo */}
        <div className="pt-2 border-t border-[#FAF0E2]/10">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Pet Photo (Optional)</span>
            </label>
            <span className="text-[9.5px] font-mono text-[#AA8B63] bg-[#AA8B63]/15 px-2 py-0.5 rounded-full">
              For coat assessment
            </span>
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
            <div className="p-3 rounded-2xl bg-[#14160F] border border-[#AA8B63]/60 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src={data.petPhoto}
                  alt="Pet preview"
                  className="h-12 w-12 object-cover rounded-xl border border-[#FAF0E2]/20"
                />
                <div>
                  <div className="text-xs font-bold text-[#FAF0E2] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span>Photo attached for stylist</span>
                  </div>
                  <span className="text-[10px] text-[#A4AA93]">
                    Helps us prepare custom scissors & combs
                  </span>
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
              className="w-full p-3 rounded-2xl border border-dashed border-[#FAF0E2]/20 hover:border-[#AA8B63] bg-[#14160F]/60 hover:bg-[#1C1F15] transition-all flex items-center justify-between gap-3 cursor-pointer group text-left"
            >
              <div className="h-8 w-8 rounded-xl bg-[#22261A] group-hover:bg-[#AA8B63] group-hover:text-[#161811] text-[#AA8B63] flex items-center justify-center shrink-0">
                <Camera className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] block">
                  Snap photo or upload from library
                </span>
                <span className="text-[10px] text-[#A4AA93] block truncate">
                  Show us their current coat length
                </span>
              </div>
              <Upload className="h-4 w-4 text-[#A4AA93] group-hover:text-[#AA8B63] shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 4: LOCATION & CONTACT (INCLUDES EMAIL) -------------------- */
function StepDoorstepLocation({
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
            setData({
              ...data,
              latitude,
              longitude,
              address: cleanAddr,
            });
            setIsLocating(false);
          }, 500);
        } catch {
          clearInterval(interval);
          setLocateProgress(100);
          setTimeout(() => {
            setData({
              ...data,
              latitude,
              longitude,
              address: `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            });
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
        eyebrow="Step 4 · Location"
        title="Where should we park our van?"
        subtitle="We arrive directly at your doorstep in the SF Bay Area & select East Bay."
      />

      <div className="mt-4 space-y-3">
        {/* Parent Name */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Pet Parent Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.ownerName}
              onChange={(e) => setData({ ...data, ownerName: e.target.value })}
              placeholder="e.g. Jessica Miller"
              className="w-full pl-10 pr-4 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>
        </div>

        {/* Email Address (Newly Added) */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="e.g. jessica@example.com"
              className="w-full pl-10 pr-4 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Mobile Phone (WhatsApp or Call)
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="e.g. +1 (850) 960-0034"
              className="w-full pl-10 pr-4 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>
        </div>

        {/* Address & GPS */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Doorstep Street Address
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Street, number, apt (SF Bay Area & East Bay)"
              className="w-full pl-10 pr-24 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
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
        </div>

        {isLocating && (
          <div className="mt-1 space-y-1">
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
          <div className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wide">
            ERROR: {locateError}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- STEP 5: BOOKING SYSTEM WITH SCHEDULE DATE & TIME -------------------- */
function StepBookingSchedule({
  data,
  setData,
  dates,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  dates: { dayLabel: string; month: string; dayNum: number; fullDate: string }[];
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 5 · Schedule"
        title="Choose Date & Time Window"
        subtitle="Select your preferred doorstep arrival window for our solar mobile spa van."
      />

      <div className="mt-4 space-y-4">
        {/* Date Selector Carousel */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Select Preferred Day</span>
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((d) => {
              const isSelected = data.scheduledDate === d.fullDate;
              return (
                <button
                  key={d.fullDate}
                  type="button"
                  onClick={() => setData({ ...data, scheduledDate: d.fullDate })}
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

        {/* Time Slot Selection */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Select Arrival Window</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
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
            <Check className="h-4 w-4 text-[#AA8B63]" />
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

/* -------------------- STEP 6: DISPATCHED VIEW -------------------- */
function DispatchedSpaView({
  eta,
  data,
  onReset,
}: {
  eta: number;
  data: GroomingFlowState;
  onReset: () => void;
}) {
  const mins = Math.floor(eta / 60);
  const secs = String(eta % 60).padStart(2, "0");
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.name || "Signature Grooming";

  return (
    <div className="text-center py-2">
      <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#AA8B63]/30 to-[#59593E]/30 blur-2xl animate-pulse" />
        <img
          src="/assets/souva-badge-circle-transparent.png"
          alt="SOUVA Badge"
          className="h-18 w-18 object-contain rounded-full shadow-[0_0_25px_rgba(170,139,99,0.5)] relative z-10"
        />
        <div className="absolute -right-2 -top-1 h-7 w-7 rounded-full bg-[#AA8B63] text-[#161811] flex items-center justify-center shadow-lg animate-bounce">
          <Truck className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[#AA8B63] flex items-center justify-center gap-1.5 font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FAF0E2]" />
        </span>
        Booking Request Confirmed
      </div>

      <h3 className="font-display text-3xl sm:text-4xl font-bold mt-1.5 tracking-tight text-[#FAF0E2]">
        {data.scheduledDate}{" "}
        <span className="text-gradient-gold font-mono block mt-1 text-2xl sm:text-3xl">
          {data.scheduledTime}
        </span>
      </h3>

      {/* Real-time Van Progress Bar */}
      <div className="mt-5 mb-4 relative text-left">
        <div className="flex justify-between text-[9.5px] text-[#A4AA93] mb-1.5 font-mono font-bold uppercase tracking-wider">
          <span>BAY AREA CENTRAL HUB</span>
          <span className="text-[#AA8B63] animate-pulse">SCHEDULED DISPATCH...</span>
          <span>YOUR DOORSTEP</span>
        </div>

        <div className="energy-bar-wrap relative">
          <div className="energy-bar-track">
            <div
              className="energy-bar-fill transition-all duration-1000"
              style={{
                width: `${Math.min(100, Math.max(10, ((25 * 60 - eta) / (25 * 60)) * 100))}%`,
              }}
            >
              <span className="energy-dot energy-dot--1" />
              <span className="energy-dot energy-dot--2" />
              <span className="energy-dot energy-dot--3" />
            </div>
          </div>
        </div>

        <div
          className="absolute -top-3.5 transition-all duration-1000"
          style={{
            left: `calc(${Math.min(92, Math.max(0, ((25 * 60 - eta) / (25 * 60)) * 100))}% - 8px)`,
          }}
        >
          <div className="h-6 w-6 rounded-full bg-[#AA8B63] flex items-center justify-center text-[#161811] shadow-[0_0_10px_#AA8B63]">
            <Truck className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs sm:text-sm text-[#A4AA93]">
        Certified master pet stylist assigned to pamper{" "}
        <strong className="text-[#FAF0E2]">{data.petName || "your companion"}</strong> at:
        <br />
        <span className="text-[#FAF0E2] font-semibold text-sm mt-1 block">
          {data.address || "Your doorstep"}
        </span>
      </p>

      {/* Booking summary receipt */}
      <div className="mt-5 rounded-2xl border border-[#FAF0E2]/10 bg-[#1B1E15] p-3.5 text-left text-xs space-y-1.5">
        {data.petPhoto && (
          <div className="flex items-center gap-3 pb-2 border-b border-[#FAF0E2]/10">
            <img
              src={data.petPhoto}
              alt={data.petName}
              className="h-10 w-10 object-cover rounded-xl border border-[#AA8B63]/40"
            />
            <div>
              <span className="text-[9.5px] text-[#AA8B63] font-mono font-bold uppercase tracking-wider block">
                Pet Photo Attached
              </span>
              <span className="text-xs font-bold text-[#FAF0E2]">
                {data.petName} ({data.breed} · {data.petAge})
              </span>
            </div>
          </div>
        )}
        <Row label="Appointment Time" value={`${data.scheduledDate} at ${data.scheduledTime}`} />
        <Row label="Pet Companion" value={`${data.petName} (${data.breed} · ${data.size.toUpperCase()})`} />
        <Row label="Vaccinations & Health" value={`Vaccines: ${data.vaccinated === "yes" ? "Up to date" : "Pending"} · ${data.medicalConditions}`} />
        <Row label="Selected Service" value={selectedPkg} />
        {data.addons.length > 0 && <Row label="Spa Upgrades" value={data.addons.join(", ")} />}
        <Row label="Parent Contact" value={`${data.ownerName} · ${data.phone} (${data.email})`} />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 text-xs text-[#A4AA93] hover:text-[#AA8B63] transition-colors underline underline-offset-4 font-semibold cursor-pointer"
      >
        Book another appointment or edit details
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-[#FAF0E2]/5 last:border-b-0">
      <span className="text-[#A4AA93] text-[11px]">{label}</span>
      <span className="font-semibold text-right text-[#FAF0E2] text-[11px]">{value}</span>
    </div>
  );
}
