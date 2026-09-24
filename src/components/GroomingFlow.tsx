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
  AlertCircle,
  X,
  Search,
  Users,
  PlusCircle,
  RotateCcw,
  FileText,
  ExternalLink,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetBlueprint } from "@/components/PetBlueprint";
import { TermsModal } from "@/components/TermsModal";
import breedsList from "@/data/breeds.json";
import { SOUVA_PACKAGES, SPA_UPGRADES, SIZE_GUIDE, type PetSize } from "@/data/services";
import { checkCoverage, SOUVA_COVERAGE_ZONES, SUGGESTED_AREAS } from "@/data/coverage";
import { addDispatchRequest, getStoredRequests } from "@/lib/dispatchStore";
import {
  createAirtableBooking,
  fetchBookedSlots,
  formatToIsoDate,
  isTimeMatching,
  type BookedSlot,
} from "@/lib/airtable";

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
  // Paso 1: Tamaño del perro
  size: PetSize;

  // Paso 2: Servicio & Upgrades ("Know your price")
  packageId: string;
  addons: string[];

  // Paso 3: Locación & Cobertura & Parking
  address: string;
  zipCode: string;
  parkingNotes: string;
  latitude: number | null;
  longitude: number | null;

  // Paso 4: Información del cliente
  firstName: string;
  lastName: string;
  ownerName: string;
  email: string;
  phone: string;

  // Paso 5: Información del perro
  dogCount: number;
  petName: string;
  breed: string;
  petAge: string;
  gender: "male" | "female";

  // Paso 6: Condición del perro
  petCondition: string;
  temperament: string;
  vaccinated: "yes" | "no";
  medicalConditions: string;
  groomerNotes: string;
  petPhoto: string | null;

  // Paso 7: Calendario de disponibilidad
  scheduledDate: string;
  scheduledDateIso?: string;
  scheduledTime: string;

  // Paso 8: Disclaimer (botón de confirmación directa + firma opcional)
  signature: string | null;
  agreedToTerms: boolean;
}

const STEPS_TOTAL = 8;
const STORAGE_KEY = "souva_booking_draft_v3";

// Full Year Calendar Availability (365 Days)
export interface AvailableDate {
  dayLabel: string;
  month: string;
  monthFull: string;
  year: number;
  dayNum: number;
  fullDate: string;
  isoDate: string;
  dayOfWeek: number;
}

export function getAvailableDates(): AvailableDate[] {
  const dates: AvailableDate[] = [];
  const now = new Date();
  
  // Las reservas requieren al menos 24 horas de anticipación
  // Si la hora actual es >= 17:00 (5 PM), se inicia pasado mañana para garantizar las 24h
  const startOffset = now.getHours() >= 17 ? 2 : 1;

  // Abrir calendario a todo el año (365 días en adelante)
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
    dates.push({ dayLabel, month, monthFull, year, dayNum, fullDate, isoDate, dayOfWeek });
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

/* -------------------- Status LED Grid Tracker (8 Steps) -------------------- */
function StatusLedGrid({ activeIndex, hot }: { activeIndex: number; hot: boolean }) {
  const steps = [
    { icon: Sparkles, label: "Size" },
    { icon: Scissors, label: "Service" },
    { icon: MapPin, label: "Location" },
    { icon: User, label: "Client" },
    { icon: Heart, label: "Dog" },
    { icon: ShieldCheck, label: "Care" },
    { icon: Calendar, label: "Schedule" },
    { icon: FileCheck, label: "Agreement" },
  ];

  return (
    <div
      className="ledgrid__track mb-6 select-none"
      style={{ "--cols": 8 } as React.CSSProperties}
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
                  "lg-cell relative flex flex-col justify-center gap-1 cursor-help h-full py-1",
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
                <IconComp className="h-3.5 w-3.5 relative z-10" />
                <span className="hidden sm:inline text-[7px] uppercase tracking-wider font-mono font-extrabold relative z-10 truncate max-w-full px-0.5">
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
  onStatus?: (s: { armed: boolean; dispatched: boolean; currentStep?: number }) => void;
}) {
  const availableDates = useMemo(() => getAvailableDates(), []);
  const initialDate = availableDates[0];
  const initialSlots = SCHEDULE_BY_DAY[initialDate?.dayOfWeek ?? 1] || [];

  const flowTopRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // 1. REHYDRATE FROM LOCALSTORAGE IF EXISTS
  const initialDataState: GroomingFlowState = {
    size: "small",
    packageId: "",
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
    petName: "",
    breed: "",
    petAge: "Adult (1–7 yrs)",
    gender: "male",
    petCondition: "Healthy & Well-Maintained",
    temperament: "Friendly & Calm",
    vaccinated: "yes",
    medicalConditions: "None / Healthy",
    groomerNotes: "",
    petPhoto: null,
    scheduledDate: initialDate?.fullDate || "Tomorrow",
    scheduledDateIso: initialDate?.isoDate || "",
    scheduledTime: initialSlots[0]?.time || "9:30 AM",
    signature: null,
    agreedToTerms: true,
  };

  const [data, setData] = useState<GroomingFlowState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.data) return { ...initialDataState, ...parsed.data };
      }
    } catch (e) {
      console.warn("Draft restore error", e);
    }
    return initialDataState;
  });

  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.step === "number" && parsed.step >= 0 && parsed.step < STEPS_TOTAL) {
          return parsed.step;
        }
      }
    } catch (e) {}
    return 0;
  });

  const [savedPets, setSavedPets] = useState<CompletedPet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.savedPets)) return parsed.savedPets;
      }
    } catch (e) {}
    return [];
  });

  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [completed, setCompleted] = useState(false);
  const [justArmed, setJustArmed] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [invoicePdf, setInvoicePdf] = useState<{ base64: string; fileName: string } | null>(null);
  const [emailNotice, setEmailNotice] = useState<{ type: "success" | "warning"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Airtable Live Availability State
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const loadBookedSlots = useCallback(async () => {
    setIsLoadingSlots(true);
    try {
      const slots = await fetchBookedSlots();
      setBookedSlots(slots);
    } catch (e) {
      console.warn("Slot sync failed:", e);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadBookedSlots();
    // Poll every 30 seconds to keep slots up to date in real time
    const interval = setInterval(loadBookedSlots, 30000);
    return () => clearInterval(interval);
  }, [loadBookedSlots]);

  const isSlotBooked = useCallback(
    (isoDate: string, time: string) => {
      if (!isoDate || !time) return false;
      const inAirtable = bookedSlots.some(
        (b) => b.date === isoDate && isTimeMatching(time, b.time)
      );
      if (inAirtable) return true;

      try {
        const local = getStoredRequests();
        const inLocal = local.some((req) => {
          if (req.status === "cancelled") return false;
          const reqIso = formatToIsoDate(req.scheduledDate || req.preferredTime || "");
          const reqTime = req.scheduledTime || req.preferredTime || "";
          return reqIso === isoDate && isTimeMatching(time, reqTime);
        });
        if (inLocal) return true;
      } catch {}

      return false;
    },
    [bookedSlots]
  );

  // 2. PERSIST DRAFT TO LOCALSTORAGE ON EVERY CHANGE
  useEffect(() => {
    if (!completed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step, savedPets }));
      } catch (e) {
        console.warn("Failed to persist booking session draft", e);
      }
    }
  }, [data, step, savedPets, completed]);

  // 3. AUTO-SCROLL TO COCKPIT TOP ON STEP CHANGE (NOT on initial page load!)
  const scrollToTop = useCallback(() => {
    if (flowTopRef.current) {
      const stickyHeaderOffset = 80;
      const rect = flowTopRef.current.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - stickyHeaderOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return; // Do NOT auto-scroll on initial mount! Page stays at top (top: 0)!
    }
    // Give browser a frame to paint the new step view before computing scroll
    const timer = setTimeout(() => {
      scrollToTop();
    }, 40);
    return () => clearTimeout(timer);
  }, [step, completed, scrollToTop]);

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setStep(0);
    setDir("back");
    setCompleted(false);
    setIsDescExpanded(false);
    setInvoicePdf(null);
    setEmailNotice(null);
    setSavedPets([]);
    setData(initialDataState);
  };

  // Step Completion Validation Rules
  const isCoveredZip = checkCoverage(data.zipCode).covered;
  const currentIsoDate = data.scheduledDateIso || formatToIsoDate(data.scheduledDate);
  const isCurrentSlotBooked = Boolean(
    data.scheduledDate &&
    data.scheduledTime &&
    isSlotBooked(currentIsoDate, data.scheduledTime)
  );

  const canNext = Boolean(
    (step === 0 && Boolean(data.size)) ||
    (step === 1 && Boolean(data.packageId)) ||
    (step === 2 && data.address.trim().length >= 4 && isCoveredZip) ||
    (step === 3 &&
      (data.firstName.trim().length >= 1 || data.ownerName.trim().length >= 2) &&
      data.email.includes("@") &&
      data.phone.trim().length >= 7) ||
    (step === 4 &&
      data.petName.trim().length >= 1 &&
      data.breed.trim().length >= 2 &&
      Boolean(data.gender) &&
      Boolean(data.petAge)) ||
    (step === 5 && Boolean(data.vaccinated) && Boolean(data.temperament)) ||
    (step === 6 &&
      Boolean(data.scheduledDate) &&
      Boolean(data.scheduledTime) &&
      !isCurrentSlotBooked) ||
    (step === 7 && data.agreedToTerms && !isCurrentSlotBooked)
  );

  useEffect(() => {
    onStatus?.({ armed: canNext && !completed, dispatched: completed, currentStep: step });
  }, [canNext, completed, onStatus, step]);

  const prevCanNext = useRef(false);
  useEffect(() => {
    if (canNext && !prevCanNext.current) {
      setJustArmed(true);
      const id = setTimeout(() => setJustArmed(false), 750);
      return () => clearTimeout(id);
    }
    prevCanNext.current = canNext;
  }, [canNext]);

  const activeIndex = completed ? 7 : step;

  // Pricing calculations for current dog
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId);
  const currentBasePrice = selectedPkg?.prices[data.size as PetSize] || 0;
  const currentAddonsCost = data.addons.reduce((sum, addId) => {
    const item = SPA_UPGRADES.find((u) => u.id === addId);
    if (!item) return sum;
    const num = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + num;
  }, 0);

  // Determine if this current dog gets 20% discount (if it is Dog #2)
  const isSecondDog = savedPets.length === 1;
  const currentDogDiscount = isSecondDog ? Math.round(currentBasePrice * 0.2) : 0;
  const currentDogTotal = currentBasePrice - currentDogDiscount + currentAddonsCost;

  // Aggregate with previously saved dogs
  const savedPetsCost = savedPets.reduce((sum, p) => sum + p.totalPrice, 0);
  const grandEstimatedTotal = savedPetsCost + (data.packageId ? currentDogTotal : 0);

  const totalDogsCount = savedPets.length + (data.petName.trim() ? 1 : 0);

  // 4. ACTION: ADD ANOTHER DOG LOOP
  const handleAddAnotherDog = () => {
    if (!data.packageId || !data.petName.trim()) {
      alert("Please complete the information and service selection for this pet before adding another.");
      return;
    }

    const newSavedPet: CompletedPet = {
      id: `pet-${Date.now()}`,
      petName: data.petName,
      size: data.size,
      breed: data.breed || "Mix",
      petAge: data.petAge,
      gender: data.gender,
      packageId: data.packageId,
      packageName: selectedPkg?.name || "Signature Grooming",
      addons: [...data.addons],
      petCondition: data.petCondition,
      temperament: data.temperament,
      vaccinated: data.vaccinated,
      medicalConditions: data.medicalConditions,
      groomerNotes: data.groomerNotes,
      petPhoto: data.petPhoto,
      basePrice: currentBasePrice,
      addonsCost: currentAddonsCost,
      discount: currentDogDiscount,
      totalPrice: currentDogTotal,
    };

    const updatedPets = [...savedPets, newSavedPet];
    setSavedPets(updatedPets);

    // Reset pet-specific fields only, KEEP client info, address and date!
    setData((prev) => ({
      ...prev,
      dogCount: updatedPets.length + 1,
      size: "small",
      packageId: "",
      addons: [],
      petName: "",
      breed: "",
      petAge: "Adult (1–7 yrs)",
      gender: "male",
      petCondition: "Healthy & Well-Maintained",
      temperament: "Friendly & Calm",
      vaccinated: "yes",
      medicalConditions: "None / Healthy",
      groomerNotes: "",
      petPhoto: null,
    }));

    // Return to Step 0 (Size of the next dog!)
    setStep(0);
    setDir("back");
    scrollToTop();
  };

  // 5. ACTION: FINALIZE ALL DOGS BOOKING
  const handleFinalizeBooking = async () => {
    setIsSubmitting(true);

    // Build the complete list of pets (saved pets + current active pet if completed)
    let allPets: CompletedPet[] = [...savedPets];
    if (data.packageId && data.petName.trim()) {
      allPets.push({
        id: `pet-${Date.now()}`,
        petName: data.petName,
        size: data.size,
        breed: data.breed || "Mix",
        petAge: data.petAge,
        gender: data.gender,
        packageId: data.packageId,
        packageName: selectedPkg?.name || "Signature Grooming",
        addons: [...data.addons],
        petCondition: data.petCondition,
        temperament: data.temperament,
        vaccinated: data.vaccinated,
        medicalConditions: data.medicalConditions,
        groomerNotes: data.groomerNotes,
        petPhoto: data.petPhoto,
        basePrice: currentBasePrice,
        addonsCost: currentAddonsCost,
        discount: currentDogDiscount,
        totalPrice: currentDogTotal,
      });
    }

    const resolvedOwnerName = data.ownerName || `${data.firstName} ${data.lastName}`.trim();
    const finalDogNames = allPets.map((p) => p.petName).join(" & ") || data.petName;
    const finalBreeds = allPets.map((p) => p.breed).join(" · ") || data.breed;
    const finalSizes = allPets.map((p) => p.size);
    const finalAges = allPets.map((p) => p.petAge).join(" · ");
    const finalGenders = allPets.map((p) => (p.gender === "male" ? "Male" : "Female")).join(" · ");
    const finalPackages = allPets.map((p) => p.packageName).join(" + ");
    const finalAddons = allPets.flatMap((p) => p.addons);
    const totalMultiDiscount = allPets.reduce((sum, p) => sum + p.discount, 0);
    const finalTotal = allPets.reduce((sum, p) => sum + p.totalPrice, 0);

    const bookingId = `SOU-${Math.floor(1000 + Math.random() * 9000)}`;
    const resolvedIsoDate = data.scheduledDateIso || formatToIsoDate(data.scheduledDate);

    // Guard: ensure arrival slot is still open in Airtable before proceeding
    if (isSlotBooked(resolvedIsoDate, data.scheduledTime)) {
      alert(
        `The arrival window on ${data.scheduledDate} at ${data.scheduledTime} was just booked. Please choose another available arrival window.`
      );
      setStep(6);
      setIsSubmitting(false);
      return;
    }

    // Save to Dispatch Admin Store
    addDispatchRequest({
      customerName: resolvedOwnerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      zipCode: data.zipCode,
      dogCount: allPets.length,
      lat: data.latitude || 37.7749 + (Math.random() - 0.5) * 0.08,
      lng: data.longitude || -122.4194 + (Math.random() - 0.5) * 0.08,
      petName: finalDogNames,
      breed: finalBreeds,
      size: data.size,
      gender: data.gender,
      petAge: data.petAge,
      vaccinated: data.vaccinated,
      medicalConditions: data.medicalConditions,
      temperament: allPets.map((p) => `${p.petName}: ${p.temperament}`).join(" | "),
      groomerNotes: data.groomerNotes,
      parkingNotes: data.parkingNotes,
      petPhoto: data.petPhoto,
      packageId: data.packageId || "signature-grooming",
      packageName: finalPackages,
      addons: finalAddons,
      estimatedTotal: finalTotal,
      preferredTime: `${data.scheduledDate} at ${data.scheduledTime}`,
      scheduledDate: resolvedIsoDate,
      scheduledTime: data.scheduledTime,
      etaMinutes: 20,
      vanId: "VAN-01",
      vanName: "Van 01 (SF & Peninsula Mobile Fleet)",
      status: "pending",
      signature: data.signature,
      notes: `Booked for ${data.scheduledDate} (${resolvedIsoDate}) @ ${data.scheduledTime}. Dogs (${allPets.length}): ${finalDogNames}. Parking: ${data.parkingNotes}.`,
    });

    // 6. SAVE RECORD DIRECTLY TO AIRTABLE
    let createdAirtableId: string | undefined;
    try {
      const coverage = checkCoverage(data.zipCode);
      const airRes = await createAirtableBooking({
        bookingId,
        customerName: resolvedOwnerName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        zipCode: data.zipCode,
        serviceZone: coverage.zone,
        parkingNotes: data.parkingNotes,
        scheduledDate: data.scheduledDate,
        scheduledDateIso: resolvedIsoDate,
        scheduledTime: data.scheduledTime,
        dogCount: allPets.length,
        dogNames: finalDogNames,
        breeds: finalBreeds,
        dogSizes: finalSizes,
        dogAges: finalAges,
        genders: finalGenders,
        vaccinated: data.vaccinated,
        temperament: allPets.map((p) => p.temperament),
        medicalConditions: allPets.map((p) => `${p.petName}: ${p.medicalConditions}`).join(" | "),
        groomerNotes: allPets.map((p) => `${p.petName}: ${p.groomerNotes}`).filter(Boolean).join(" | "),
        servicePackage: allPets[0]?.packageName || "Signature Grooming",
        spaUpgrades: finalAddons,
        basePrice: allPets.reduce((s, p) => s + p.basePrice, 0),
        addonsTotal: allPets.reduce((s, p) => s + p.addonsCost, 0),
        multiDogDiscount: totalMultiDiscount,
        estimatedTotal: finalTotal,
        paymentStatus: "Pendiente en Puerta",
        agreementAccepted: true,
        signatureUrl: data.signature,
      });
      if (airRes.success && airRes.id) {
        createdAirtableId = airRes.id;
      }
    } catch (err) {
      console.warn("Airtable sync note:", err);
    }

    // Immediately update local slot tracking
    setBookedSlots((prev) => [
      ...prev,
      { date: resolvedIsoDate, time: data.scheduledTime, status: "Pendiente" },
    ]);

    // 7. SEND EMAIL & PDF INVOICE VIA VERCEL SERVERLESS
    fetch("/api/send-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        airtableRecordId: createdAirtableId,
        ownerName: resolvedOwnerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        zipCode: data.zipCode,
        dogCount: allPets.length,
        parkingNotes: data.parkingNotes,
        petName: finalDogNames,
        breed: finalBreeds,
        size: data.size,
        gender: data.gender,
        petAge: data.petAge,
        petCondition: allPets.map((p) => `${p.petName}: ${p.temperament}`).join(" | "),
        vaccinated: data.vaccinated,
        medicalConditions: data.medicalConditions,
        groomerNotes: data.groomerNotes,
        packageName: finalPackages,
        packageDescription: selectedPkg?.tagline || "",
        packageDuration: selectedPkg?.duration || "",
        packageIncludes: selectedPkg?.includes || [],
        basePrice: allPets.reduce((s, p) => s + p.basePrice, 0),
        multiDogDiscount: totalMultiDiscount,
        addonsCost: allPets.reduce((s, p) => s + p.addonsCost, 0),
        addons: finalAddons,
        sizeLabel: SIZE_GUIDE.find((s) => s.id === data.size)?.label || data.size,
        sizeWeight: SIZE_GUIDE.find((s) => s.id === data.size)?.weight || "",
        estimatedTotal: finalTotal,
        scheduledDate: data.scheduledDate,
        scheduledDateIso: resolvedIsoDate,
        scheduledTime: data.scheduledTime,
        signature: data.signature,
        allPets,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.pdfBase64) {
          setInvoicePdf({
            base64: resData.pdfBase64,
            fileName: resData.fileName || `SOUVA-Invoice-${finalDogNames}.pdf`,
          });
        }
        if (resData?.emailSent) {
          setEmailNotice({
            type: "success",
            message: `Official invoice & confirmation sent to ${data.email}!`,
          });
        }
      })
      .catch((err) => {
        console.warn("Notification fallback:", err);
      });

    // Clear local storage draft after successful booking
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    setIsSubmitting(false);
    setDir("fwd");
    setCompleted(true);
  };

  const handleNext = () => {
    if (step < STEPS_TOTAL - 1) {
      setDir("fwd");
      setStep((prev) => prev + 1);
    } else {
      handleFinalizeBooking();
    }
  };

  const handleBack = () => {
    if (step > 0 && !completed) {
      setDir("back");
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div ref={flowTopRef} className="w-full">
      {/* Membrete Oficial: RESERVA AQUÍ */}
      <div className="mb-3.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#22271A] via-[#2A2419] to-[#22271A] border border-[#AA8B63]/60 shadow-[0_2px_14px_rgba(170,139,99,0.2)] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#AA8B63]" />
          </span>
          <span className="text-xs sm:text-sm font-mono font-black tracking-widest text-[#FAF0E2] uppercase">
            RESERVA AQUÍ
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#AA8B63] font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-[#AA8B63]" />
          <span>Doorstep Mobile Spa</span>
        </div>
      </div>

      <StatusLedGrid activeIndex={activeIndex} hot={completed} />

      {/* Header controls with multi-dog notification */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0 || completed}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FAF0E2]/15 bg-[#1B1E15] text-[#A4AA93] hover:text-[#FAF0E2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="text-xs font-semibold text-[#AA8B63] font-mono tracking-wider">
            {completed ? "BOOKING SUMMARY" : `STEP ${step + 1} OF ${STEPS_TOTAL}`}
          </div>
          {savedPets.length > 0 && !completed && (
            <div className="text-[10px] font-mono text-emerald-300 font-bold">
              Configuring Dog #{savedPets.length + 1} · ({savedPets.length} saved)
            </div>
          )}
        </div>

        {/* Start Over Button */}
        {!completed ? (
          <button
            type="button"
            onClick={() => {
              if (step > 0 || savedPets.length > 0) {
                if (window.confirm("Are you sure you want to start over? This will reset your booking.")) {
                  reset();
                }
              } else {
                reset();
              }
            }}
            className="px-2.5 py-1 rounded-full bg-[#1F2318] border border-[#FAF0E2]/15 text-[10px] font-mono font-bold text-[#AA8B63] hover:text-[#FAF0E2] hover:border-[#AA8B63] hover:bg-[#AA8B63]/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Reset and start over from step 1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Start Over</span>
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Progress Bar (8 Steps) */}
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

      {/* Multi-dog banner if dogs have been saved */}
      {savedPets.length > 0 && !completed && (
        <div className="mb-3 p-2.5 rounded-2xl bg-[#1C2216] border border-[#AA8B63]/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold shrink-0">
              Dogs in this session:
            </span>
            {savedPets.map((p, idx) => (
              <span
                key={p.id}
                className="px-2 py-0.5 rounded-md bg-[#252C1D] border border-[#AA8B63]/30 text-[#FAF0E2] text-[10.5px] font-medium shrink-0 flex items-center gap-1"
              >
                <span>🐶 #{idx + 1} {p.petName}</span>
                <span className="text-[#AA8B63] font-mono font-bold">${p.totalPrice}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Dynamic Step View */}
      <div className="pb-3 pt-1">
        <div
          key={completed ? "completed" : `step-${step}-${savedPets.length}`}
          className="flow-view relative z-20"
          data-dir={dir}
        >
          {completed ? (
            <BookingSummaryView
              data={data}
              savedPets={savedPets}
              invoicePdf={invoicePdf}
              emailNotice={emailNotice}
              onReset={reset}
            />
          ) : step === 0 ? (
            <StepPetSize data={data} setData={setData} petNumber={savedPets.length + 1} />
          ) : step === 1 ? (
            <StepServicePackage data={data} setData={setData} isSecondDog={isSecondDog} />
          ) : step === 2 ? (
            <StepLocationCoverage data={data} setData={setData} />
          ) : step === 3 ? (
            <StepClientInfo data={data} setData={setData} />
          ) : step === 4 ? (
            <StepDogInfo data={data} setData={setData} petNumber={savedPets.length + 1} />
          ) : step === 5 ? (
            <StepDogCareCondition data={data} setData={setData} petNumber={savedPets.length + 1} />
          ) : step === 6 ? (
            <StepBookingCalendar
              data={data}
              setData={setData}
              dates={availableDates}
              isSlotBooked={isSlotBooked}
              isLoadingSlots={isLoadingSlots}
              onRefreshSlots={loadBookedSlots}
            />
          ) : (
            <StepDisclaimerConfirm
              data={data}
              setData={setData}
              savedPets={savedPets}
              currentDogTotal={currentDogTotal}
              grandTotal={grandEstimatedTotal}
              onAddAnotherDog={handleAddAnotherDog}
              onFinalize={handleFinalizeBooking}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* PERSISTENT LIVE SUMMARY BAR & KNOW YOUR PRICE */}
        {!completed && (
          <div className="mt-3 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-md overflow-hidden transition-all">
            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-[#25281D] border border-[#AA8B63]/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">🐾</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#FAF0E2] truncate">
                      {data.petName.trim() ? data.petName : `Dog #${savedPets.length + 1}`}
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#25281D] text-[#AA8B63] font-bold uppercase shrink-0">
                      {SIZE_GUIDE.find((s) => s.id === data.size)?.label || data.size}
                    </span>
                    {isSecondDog && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold shrink-0">
                        20% OFF 2nd Dog
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-[#A4AA93] truncate">
                    {selectedPkg ? selectedPkg.name : "Select a service"}
                    {savedPets.length > 0 ? ` · (+${savedPets.length} prior dog${savedPets.length > 1 ? "s" : ""})` : ""}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-[#A4AA93] uppercase block">
                  {savedPets.length > 0 ? `Total (${savedPets.length + 1} Dogs)` : "Know Your Price"}
                </span>
                <span className="font-display font-extrabold text-base text-[#AA8B63]">
                  ${grandEstimatedTotal}
                </span>
              </div>
            </div>

            {/* Expandable inclusions */}
            {selectedPkg && (
              <div className="border-t border-[#FAF0E2]/10 bg-[#181B12]/80 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="w-full flex items-center justify-between text-[10.5px] font-medium text-[#AA8B63] hover:text-[#FAF0E2] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Info className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {isDescExpanded ? "Hide" : "View"} {selectedPkg.name} description & inclusions
                    </span>
                  </span>
                  {isDescExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>

                {isDescExpanded && (
                  <div className="mt-2 pt-2 border-t border-[#FAF0E2]/10 space-y-1.5 text-xs">
                    <p className="text-[#FAF0E2]/90 leading-relaxed text-[11px]">
                      {selectedPkg.tagline}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {selectedPkg.includes.map((inc) => (
                        <div key={inc} className="flex items-center gap-1.5 text-[10.5px] text-[#FAF0E2]/85">
                          <Check className="h-3 w-3 text-[#AA8B63] shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button (Steps 0 - 6) */}
        {!completed && step < STEPS_TOTAL - 1 && (
          <>
            <button
              type="button"
              disabled={!canNext}
              onClick={handleNext}
              className={cn(
                "mt-3 w-full py-3.5 text-xs sm:text-sm font-bold btn-luxury relative z-10 flex items-center justify-center gap-2",
                justArmed && "just-armed"
              )}
            >
              {step === 1 ? (
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Book Now · Check Coverage</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>

            {/* Warning if on Step 2 (Location) with non-covered ZIP */}
            {step === 2 && data.zipCode.length === 5 && !isCoveredZip && (
              <div className="mt-2 text-center text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-500/50 p-2.5 rounded-xl animate-pulse flex items-center justify-center gap-1.5 shadow-md">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>Please enter a covered ZIP code (San Francisco or Peninsula) to proceed</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------- STEP 1: TAMAÑO DEL PERRO (PASO 1) -------------------- */
function StepPetSize({
  data,
  setData,
  petNumber,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  petNumber: number;
}) {
  return (
    <div>
      <StepHeader
        eyebrow={`Step 1 · Pet Size ${petNumber > 1 ? `(#${petNumber})` : ""}`}
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

/* -------------------- STEP 2: SERVICIO (PASO 2) -------------------- */
function StepServicePackage({
  data,
  setData,
  isSecondDog,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  isSecondDog: boolean;
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
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "bath-refresh")?.prices[data.size as PetSize] || 65,
    },
    {
      id: "bath-tidy",
      title: "Bath & Tidy",
      subtitle: "+ sanitary, paw & face trim",
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "bath-tidy")?.prices[data.size as PetSize] || 80,
    },
    {
      id: "essential-full-groom",
      title: "Full Groom",
      subtitle: "Short haircut / shave-down",
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "essential-full-groom")?.prices[data.size as PetSize] || 110,
    },
    {
      id: "signature-grooming",
      title: "Signature Grooming",
      subtitle: 'Longer style ½"+ · Scissor finish',
      rawPrice: SOUVA_PACKAGES.find((p) => p.id === "signature-grooming")?.prices[data.size as PetSize] || 125,
    },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Service Selection & Know Your Price"
        title="Select Your Grooming Service"
        subtitle="Upfront pricing calibrated for your dog's size. Select any luxury spa upgrades."
      />

      {isSecondDog && (
        <div className="mt-3 p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Multi-dog booking detected! Automatically applying <strong>20% OFF</strong> to this dog's base grooming package.</span>
        </div>
      )}

      {/* 2x2 Segmented Grid */}
      <div className="mt-4 p-2 rounded-3xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-inner">
        <div className="grid grid-cols-2 gap-2">
          {services2x2.map((item) => {
            const isSelected = data.packageId === item.id;
            const finalPrice = isSecondDog ? Math.round(item.rawPrice * 0.8) : item.rawPrice;
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
                    {isSecondDog ? "-20% OFF" : "From"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isSecondDog && (
                      <span className="line-through opacity-50 text-[10px] font-mono">${item.rawPrice}</span>
                    )}
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm",
                        isSelected ? "text-[#161811]" : "text-[#AA8B63]"
                      )}
                    >
                      ${finalPrice}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spa Upgrades */}
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

/* -------------------- STEP 3: LOCACIÓN & COBERTURA (PASO 3) -------------------- */
function StepLocationCoverage({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [locateProgress, setLocateProgress] = useState(0);
  const [locateError, setLocateError] = useState("");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [showZonesList, setShowZonesList] = useState(false);

  const coverage = checkCoverage(data.zipCode);

  useEffect(() => {
    if (data.zipCode.length === 5) {
      if (!coverage.covered) {
        setShowCoverageModal(true);
      } else {
        setShowCoverageModal(false);
      }
    }
  }, [data.zipCode, coverage.covered]);

  const handleAddressChange = (address: string) => {
    const zipMatch = address.match(/\b(9\d{4})\b/);
    if (zipMatch && zipMatch[1]) {
      setData((prev) => ({ ...prev, address, zipCode: zipMatch[1] }));
    } else {
      setData((prev) => ({ ...prev, address }));
    }
    setShowAddressDropdown(true);
  };

  const filteredSuggestions = useMemo(() => {
    if (!data.address.trim()) return SUGGESTED_AREAS.slice(0, 5);
    const q = data.address.toLowerCase();
    return SUGGESTED_AREAS.filter(
      (s) => s.city.toLowerCase().includes(q) || s.area.toLowerCase().includes(q) || s.zip.includes(q)
    ).slice(0, 5);
  }, [data.address]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocateProgress(10);
    setLocateError("");

    const interval = setInterval(() => {
      setLocateProgress((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 250);

    if (!navigator.geolocation) {
      clearInterval(interval);
      setLocateError("Geolocation not supported by your browser");
      setIsLocating(false);
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
          const postcode = (addrObj.postcode || "").slice(0, 5);

          const cleanAddr =
            [houseNumber && street ? `${houseNumber} ${street}` : street, city, state, postcode]
              .filter(Boolean)
              .join(", ") || result.display_name;

          clearInterval(interval);
          setLocateProgress(100);
          setTimeout(() => {
            setData((prev) => ({
              ...prev,
              latitude,
              longitude,
              address: cleanAddr,
              zipCode: postcode,
            }));
            setIsLocating(false);
          }, 400);
        } catch {
          clearInterval(interval);
          setLocateProgress(100);
          setTimeout(() => {
            setData((prev) => ({
              ...prev,
              latitude,
              longitude,
              address: `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            }));
            setIsLocating(false);
          }, 400);
        }
      },
      (error) => {
        clearInterval(interval);
        setLocateError(error.message || "Failed to locate");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const parkingOptions = [
    "🏡 Private Driveway",
    "🚗 Curbside Street Parking",
    "🅿️ Dedicated Assigned Space",
    "🔒 Gated Community (Code Provided)",
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · Service Location & Coverage"
        title="Check Service Coverage & Address"
        subtitle="We service San Francisco (Select zones) and Peninsula. Verify if our solar van covers your doorstep."
      />

      <div className="mt-4 space-y-3.5">
        <div className="relative">
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Doorstep Address
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => setShowAddressDropdown(true)}
              placeholder="e.g. 1420 19th Ave, San Francisco, CA"
              className="w-full pl-9 pr-28 h-11 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
            <button
              type="button"
              disabled={isLocating}
              onClick={handleUseMyLocation}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[9px] font-bold font-mono tracking-wide text-[#AA8B63] border border-[#AA8B63]/30 hover:border-[#AA8B63] hover:bg-[#AA8B63]/10 rounded-lg transition-all cursor-pointer select-none disabled:opacity-50"
            >
              {isLocating ? "SYNCING..." : "GPS LOCATE"}
            </button>
          </div>

          {showAddressDropdown && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-[#FAF0E2]/15 bg-[#1C1F16]/95 backdrop-blur-md p-1.5 shadow-2xl space-y-1">
              <span className="text-[9.5px] font-mono text-[#AA8B63] px-2 block uppercase font-bold">
                Covered Peninsula & SF Presets:
              </span>
              {filteredSuggestions.map((item) => (
                <button
                  key={item.zip + item.area}
                  type="button"
                  onClick={() => {
                    setData((prev) => ({
                      ...prev,
                      address: `${item.area}, ${item.city}, CA ${item.zip}`,
                      zipCode: item.zip,
                    }));
                    setShowAddressDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#FAF0E2] hover:bg-[#AA8B63]/20 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="truncate">{item.city} ({item.area})</span>
                  <span className="font-mono text-[10px] text-[#AA8B63] font-bold">{item.zip}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider">
              ZIP Code (5 digits)
            </label>
            <span className="text-[10px] font-mono text-[#AA8B63]">
              {coverage.covered ? "✓ Area Covered" : "Instant Verification"}
            </span>
          </div>

          <input
            type="text"
            maxLength={5}
            value={data.zipCode}
            onChange={(e) => {
              const zipCode = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
              setData({ ...data, zipCode });
            }}
            placeholder="e.g. 94122, 94010, 94401..."
            className={cn(
              "w-full px-3 h-11 bg-[#1B1E15] border rounded-xl text-xs font-mono font-bold tracking-wider placeholder:text-[#FAF0E2]/30 focus:outline-none transition-all shadow-inner",
              data.zipCode.length === 5 && coverage.covered
                ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : data.zipCode.length === 5 && !coverage.covered
                ? "border-red-500 bg-red-950/25 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
                : "border-[#FAF0E2]/15 text-[#FAF0E2] focus:border-[#AA8B63]"
            )}
          />
        </div>

        {/* GREEN CONFIRMATION BADGE IF COVERED */}
        {data.zipCode.length === 5 && coverage.covered && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/80 flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-300 block">
                ✓ ¡Excelente noticia! Cubrimos tu área en {coverage.cityArea} ({coverage.zone})
              </span>
              <p className="text-[11.5px] text-emerald-200/90 leading-snug">
                Nuestra van solar autónoma llega directamente a la puerta de tu hogar en el ZIP {coverage.zipCode}.
              </p>
            </div>
          </div>
        )}

        {/* ── RED ALERT MESSAGE IF ZIP CODE IS OUT OF COVERAGE ────────── */}
        {data.zipCode.length === 5 && !coverage.covered && (
          <div className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500 text-red-100 flex items-start gap-3.5 shadow-[0_0_30px_rgba(239,68,68,0.35)] animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-red-200 uppercase font-mono tracking-wider">
                  ⚠️ Out of Service Area (ZIP {data.zipCode})
                </span>
                <span className="text-[9px] font-mono bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40 shrink-0 font-bold">
                  Not Available Yet
                </span>
              </div>
              <p className="text-[11.5px] text-red-200/90 leading-relaxed">
                We're sorry, our mobile spa currently services select <strong>San Francisco neighborhoods</strong> and across the <strong>Peninsula</strong> (Daly City through Mountain View & Half Moon Bay). We do not cover ZIP code <strong>{data.zipCode}</strong> yet.
              </p>
              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoverageModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer shadow-md flex items-center gap-1"
                >
                  <span>Join Route Waitlist</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, zipCode: "" })}
                  className="px-3 py-1.5 rounded-xl bg-[#25281D] hover:bg-[#333827] text-red-300 hover:text-white text-[11px] font-mono font-bold transition-colors cursor-pointer border border-red-500/30"
                >
                  Enter Another ZIP Code
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Parking Notes for Solar Van</span>
          </label>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {parkingOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setData({ ...data, parkingNotes: opt.replace(/^[^\w]+/, "").trim() })}
                className={cn(
                  "p-2 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer truncate",
                  data.parkingNotes.toLowerCase().includes(opt.split(" ")[1]?.toLowerCase() || "")
                    ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2]"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={data.parkingNotes}
            onChange={(e) => setData({ ...data, parkingNotes: e.target.value })}
            placeholder="e.g. Park on right driveway, gate code #4821, van needs 2 car lengths..."
            className="w-full px-3 h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
          />
        </div>
      </div>

      {showCoverageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161811] border-2 border-red-500/80 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] p-6 space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowCoverageModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-300 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 block">
                  Coverage Notice · Out of Area
                </span>
                <h4 className="font-display font-bold text-lg text-white">
                  We do not service ZIP {data.zipCode} yet
                </h4>
              </div>
            </div>

            <p className="text-xs text-[#FAF0E2]/90 leading-relaxed">
              We currently operate in <strong className="text-[#AA8B63]">San Francisco (select zones)</strong> and across the <strong className="text-[#AA8B63]">Peninsula</strong>.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#1D2116] border border-[#FAF0E2]/15 space-y-2">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#AA8B63] block">
                Join Route Waitlist
              </span>
              {!waitlistJoined ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="flex-1 px-3 h-9 bg-[#14160F] border border-[#FAF0E2]/20 rounded-xl text-xs text-[#FAF0E2]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (waitlistEmail.includes("@")) setWaitlistJoined(true);
                    }}
                    className="px-3 h-9 rounded-xl bg-red-500 text-white text-[11px] font-mono font-bold uppercase tracking-wider hover:bg-red-400 cursor-pointer"
                  >
                    Notify Me
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>Saved! We will notify you when we expand to {data.zipCode}.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCoverageModal(false);
                setData((prev) => ({ ...prev, zipCode: "" }));
              }}
              className="w-full py-3 rounded-xl bg-[#25281D] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Try Another Address or ZIP Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- STEP 4: INFO CLIENTE (PASO 4) -------------------- */
function StepClientInfo({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 4 · Pet Parent Contact Information"
        title="Pet Parent Contact Information"
        subtitle="We will coordinate doorstep arrival, send appointment reminders, and deliver your invoice to these details."
      />

      <div className="mt-4 space-y-3.5">
        <div className="grid sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              First Name
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
              Last Name
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

        <div className="grid sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Phone Number
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
              Email Address (Correo)
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
      </div>
    </div>
  );
}

/* -------------------- STEP 5: INFO PERRO (PASO 5) -------------------- */
function StepDogInfo({
  data,
  setData,
  petNumber,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  petNumber: number;
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
        eyebrow={`Step 5 · Dog Details ${petNumber > 1 ? `(#${petNumber})` : ""}`}
        title={`Tell Us About Dog #${petNumber}`}
        subtitle="Essential details for our master groomer before preparing the luxury van suite."
      />

      <div className="mt-4 space-y-3.5">
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dog's Name
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

        <div className="relative" ref={dropdownRef}>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dog's Breed or Mix
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

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Gender
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
                <span>♂ Male</span>
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
                <span>♀ Female</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Age Bracket
            </label>
            <div className="grid grid-cols-3 gap-1">
              {ageOptions.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setData({ ...data, petAge: age })}
                  className={cn(
                    "py-2 rounded-xl border text-center text-[10.5px] font-medium transition-all cursor-pointer",
                    data.petAge === age
                      ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-sm"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  {age.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 6: CONDICIÓN DEL PERRO (PASO 6) -------------------- */
function StepDogCareCondition({
  data,
  setData,
  petNumber,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  petNumber: number;
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

  const temperamentOptions = [
    "Friendly & Calm",
    "Anxious / Sensitive",
    "Active & Playful",
    "Shy / Extra Patience Needed",
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
        eyebrow={`Step 6 · Dog Coat & Temperament ${petNumber > 1 ? `(#${petNumber})` : ""}`}
        title="Pet Health, Temperament & Photos"
        subtitle="Help our master groomer prepare specialized handling and calming botanicals."
      />

      <div className="mt-4 space-y-3.5">
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#AA8B63]" />
            <span>Rabies Vaccine Status</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setData({ ...data, vaccinated: "yes" })}
              className={cn(
                "p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer",
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
                "p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer",
                data.vaccinated === "no"
                  ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-sm"
                  : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
            >
              Pending / In Progress
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Pet Temperament
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {temperamentOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setData({ ...data, temperament: opt })}
                className={cn(
                  "p-2 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer truncate",
                  data.temperament === opt
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-sm"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Activity className="h-3 w-3 text-[#AA8B63]" />
            <span>Medical Conditions or Sensitivities</span>
          </label>
          <select
            value={data.medicalConditions}
            onChange={(e) => setData({ ...data, medicalConditions: e.target.value })}
            className="w-full h-10 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl px-3 text-xs text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63] cursor-pointer"
          >
            {medicalOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#191C13] text-[#FAF0E2]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Notes for the Groomer
          </label>
          <textarea
            value={data.groomerNotes}
            onChange={(e) => setData({ ...data, groomerNotes: e.target.value })}
            placeholder="Special handling, sensitive spots, haircut preferences..."
            rows={2}
            className="w-full p-2.5 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Dog Photo (Optional)</span>
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
                  Helps assess coat thickness & styling
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

/* -------------------- STEP 7: CALENDARIO (PASO 7) -------------------- */
function StepBookingCalendar({
  data,
  setData,
  dates,
  isSlotBooked,
  isLoadingSlots,
  onRefreshSlots,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  dates: AvailableDate[];
  isSlotBooked: (isoDate: string, time: string) => boolean;
  isLoadingSlots: boolean;
  onRefreshSlots: () => void;
}) {
  const selectedDateObj = dates.find((d) => d.fullDate === data.scheduledDate) || dates[0];

  // Derive unique months across the whole year (365 days)
  const months = useMemo(() => {
    const map = new Map<string, { key: string; label: string; year: number; month: string }>();
    for (const d of dates) {
      const key = `${d.year}-${d.month}`;
      if (!map.has(key)) {
        map.set(key, { key, label: `${d.month} ${d.year}`, year: d.year, month: d.month });
      }
    }
    return Array.from(map.values());
  }, [dates]);

  const [activeMonthKey, setActiveMonthKey] = useState<string>(
    () => `${selectedDateObj.year}-${selectedDateObj.month}`
  );

  // Sync active month tab if selected date changes externally
  useEffect(() => {
    if (selectedDateObj) {
      setActiveMonthKey(`${selectedDateObj.year}-${selectedDateObj.month}`);
    }
  }, [selectedDateObj]);

  const visibleDays = useMemo(() => {
    return dates.filter((d) => `${d.year}-${d.month}` === activeMonthKey);
  }, [dates, activeMonthKey]);

  const isDateFull = (d: AvailableDate) => {
    const slots = SCHEDULE_BY_DAY[d.dayOfWeek] || [];
    if (slots.length === 0) return true;
    return slots.every((s) => isSlotBooked(d.isoDate, s.time));
  };

  const handleSelectDate = (d: AvailableDate) => {
    if (isDateFull(d)) return;
    const daySlots = SCHEDULE_BY_DAY[d.dayOfWeek] || [];
    const currentStillAvailable = daySlots.some(
      (s) => s.time === data.scheduledTime && !isSlotBooked(d.isoDate, s.time)
    );
    const firstAvailable = daySlots.find((s) => !isSlotBooked(d.isoDate, s.time));

    setData((prev) => ({
      ...prev,
      scheduledDate: d.fullDate,
      scheduledDateIso: d.isoDate,
      scheduledTime: currentStillAvailable ? prev.scheduledTime : firstAvailable?.time || "",
    }));
  };

  const handleSelectMonth = (monthKey: string) => {
    setActiveMonthKey(monthKey);
    const daysInNewMonth = dates.filter((d) => `${d.year}-${d.month}` === monthKey);
    // If currently selected date is already within this month, keep it
    if (daysInNewMonth.some((d) => d.fullDate === data.scheduledDate)) return;
    // Otherwise select first available day in this month
    const firstOpenDay = daysInNewMonth.find((d) => !isDateFull(d)) || daysInNewMonth[0];
    if (firstOpenDay) {
      handleSelectDate(firstOpenDay);
    }
  };

  const handleJumpDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (!isoVal) return;
    const found = dates.find((d) => d.isoDate === isoVal);
    if (found) {
      setActiveMonthKey(`${found.year}-${found.month}`);
      handleSelectDate(found);
    }
  };

  const activeSlots = SCHEDULE_BY_DAY[selectedDateObj.dayOfWeek] || [];
  const isAllSlotsReserved = activeSlots.length > 0 && activeSlots.every((s) => isSlotBooked(selectedDateObj.isoDate, s.time));

  const minIso = dates[0]?.isoDate;
  const maxIso = dates[dates.length - 1]?.isoDate;

  return (
    <div>
      <StepHeader
        eyebrow="Step 7 · Availability & Date Selection"
        title="Schedule Your Doorstep Window"
        subtitle="Select your preferred date and 30-minute arrival window for our mobile spa van (Available 365 Days a Year)."
      />

      <div className="mt-4 space-y-4">
        {/* 24-Hour Advance Booking Policy Notice */}
        <div className="p-3 rounded-2xl bg-[#1C2116] border border-[#AA8B63]/40 flex items-center gap-2.5 text-xs shadow-inner">
          <Clock className="h-4 w-4 text-[#AA8B63] shrink-0" />
          <div className="text-[11px] text-[#FAF0E2] leading-snug">
            <strong className="text-[#AA8B63]">24-Hour Advance Booking Policy:</strong> Appointments open for the entire year (365 days). Daily slots prepared with autonomous clean solar suites.
          </div>
        </div>

        {/* ── FULL YEAR MONTH NAVIGATOR + JUMP TO ANY DATE ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Full Year Calendar · Select Month</span>
            </label>
            {/* Quick date picker input */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-mono text-[#AA8B63] uppercase hidden sm:inline font-bold">Pick Date:</span>
              <input
                type="date"
                min={minIso}
                max={maxIso}
                value={selectedDateObj.isoDate}
                onChange={handleJumpDateInput}
                className="bg-[#1C2016] border border-[#AA8B63]/50 rounded-lg px-2 py-0.5 text-[11px] font-mono text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63] cursor-pointer shadow-sm"
                title="Pick any date across the entire year"
              />
            </div>
          </div>

          {/* Horizontal Month Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {months.map((m) => {
              const isSelectedMonth = activeMonthKey === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => handleSelectMonth(m.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 shrink-0 cursor-pointer",
                    isSelectedMonth
                      ? "bg-[#AA8B63] text-[#161811] shadow-md scale-102"
                      : "bg-[#1B1E15] text-[#A4AA93] border border-[#FAF0E2]/10 hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Days of Selected Month */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {visibleDays.map((d) => {
              const isSelected = data.scheduledDate === d.fullDate;
              const full = isDateFull(d);
              const daySlots = SCHEDULE_BY_DAY[d.dayOfWeek] || [];
              const availableCount = daySlots.filter((s) => !isSlotBooked(d.isoDate, s.time)).length;

              return (
                <button
                  key={d.isoDate}
                  type="button"
                  disabled={full}
                  onClick={() => handleSelectDate(d)}
                  className={cn(
                    "min-w-[72px] p-2.5 rounded-2xl border text-center transition-all duration-200 shrink-0 flex flex-col items-center justify-center relative",
                    full
                      ? "opacity-40 bg-[#161811]/60 border-stone-800 text-[#A4AA93]/40 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-lg scale-105 cursor-pointer"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-[9px] font-mono uppercase",
                      full ? "text-[#A4AA93]/50" : isSelected ? "text-[#161811]/90 font-bold" : "text-[#AA8B63]"
                    )}
                  >
                    {d.dayLabel}
                  </span>
                  <span className="font-display font-extrabold text-base my-0.5">{d.dayNum}</span>
                  <span className="text-[9px] font-mono opacity-80">{d.month}</span>
                  {full ? (
                    <span className="text-[8px] font-mono font-bold text-red-400 mt-0.5 uppercase tracking-wider">
                      Full
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "text-[8px] font-mono mt-0.5 font-bold",
                        isSelected ? "text-[#161811]/80" : "text-emerald-400/90"
                      )}
                    >
                      {availableCount} open
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TIME WINDOWS ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Available Arrival Windows ({activeSlots.length} slots)</span>
            </label>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-semibold">Airtable Live</span>
              <button
                type="button"
                onClick={onRefreshSlots}
                disabled={isLoadingSlots}
                title="Refresh live availability from Airtable"
                className="ml-1 p-1 hover:text-[#FAF0E2] text-[#AA8B63] transition-colors cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={cn("h-3 w-3", isLoadingSlots && "animate-spin")} />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-2",
              activeSlots.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
            )}
          >
            {activeSlots.map((slot) => {
              const booked = isSlotBooked(selectedDateObj.isoDate, slot.time);
              const isSelected = data.scheduledTime === slot.time && !booked;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={booked}
                  onClick={() => {
                    if (!booked) {
                      setData((prev) => ({
                        ...prev,
                        scheduledTime: slot.time,
                        scheduledDate: selectedDateObj.fullDate,
                        scheduledDateIso: selectedDateObj.isoDate,
                      }));
                    }
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center relative",
                    booked
                      ? "opacity-50 bg-[#14160E] border-red-500/25 text-[#A4AA93]/60 cursor-not-allowed select-none"
                      : isSelected
                      ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] font-bold shadow-sm scale-102 cursor-pointer"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/30 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {booked && <Lock className="h-3 w-3 text-red-400 shrink-0" />}
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        booked ? "line-through text-[#A4AA93]/60" : "text-[#FAF0E2]"
                      )}
                    >
                      {slot.time}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[8.5px] font-mono mt-0.5",
                      booked ? "text-red-400 font-bold" : "text-[#AA8B63] opacity-80"
                    )}
                  >
                    {booked ? "Booked · Airtable" : slot.period}
                  </span>
                </button>
              );
            })}
          </div>

          {isAllSlotsReserved && (
            <div className="mt-3 text-center text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>All arrival windows on {selectedDateObj.dayLabel}, {selectedDateObj.month} {selectedDateObj.dayNum} are reserved in Airtable. Please choose another date above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 8: DISCLAIMER & MULTI-DOG DECISION (PASO 8) -------------------- */
function StepDisclaimerConfirm({
  data,
  setData,
  savedPets,
  currentDogTotal,
  grandTotal,
  onAddAnotherDog,
  onFinalize,
  isSubmitting,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
  savedPets: CompletedPet[];
  currentDogTotal: number;
  grandTotal: number;
  onAddAnotherDog: () => void;
  onFinalize: () => void;
  isSubmitting: boolean;
}) {
  const [showOptionalSignature, setShowOptionalSignature] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const totalDogsInSession = savedPets.length + 1;

  return (
    <div>
      <StepHeader
        eyebrow="Step 8 · Policies, Review & Confirmation"
        title="Service Agreement & Final Step"
        subtitle="Review our transparent care policies. Below you can decide to finish your booking or add another dog to this session!"
      />

      <div className="mt-4 space-y-4">
        {/* Service Agreement Box */}
        <div className="rounded-2xl border border-[#FAF0E2]/10 bg-[#161811] p-3.5 text-xs text-[#A4AA93] space-y-2 leading-relaxed">
          <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
            <h4 className="font-display font-bold text-sm text-[#FAF0E2]">
              Terms & Conditions of Service
            </h4>
            <span className="text-[10px] font-mono text-[#AA8B63] font-bold">SOUVA CORP</span>
          </div>
          <p className="font-medium text-[#FAF0E2]/90">
            Pets are accepted for grooming under our professional corporate care policies:
          </p>
          <div className="space-y-1 text-[11px] text-[#E2D7C5]/90">
            <p>• <strong>Health & Comfort:</strong> Pet safety always takes priority over coat styling. We never crate or rush.</p>
            <p>• <strong>Rabies & Vaccinations:</strong> Up-to-date rabies vaccination compliance confirmed.</p>
            <p>• <strong>Parking & Access:</strong> Safe, legal van parking required within reasonable distance.</p>
            <p>• <strong>Cancellation Policy:</strong> 24-hour advance notice required for schedule modifications.</p>
            <p>• <strong>Payment at Doorstep:</strong> Cash, Check, Card, or Zelle upon completion.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="pt-1.5 text-xs font-mono font-bold text-[#AA8B63] hover:text-[#C4A67E] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Read Full Terms & Conditions of Service (16 Articles)</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/10 cursor-pointer text-xs select-none">
          <input
            type="checkbox"
            checked={data.agreedToTerms}
            onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
            className="mt-0.5 accent-[#AA8B63] h-4 w-4 rounded cursor-pointer shrink-0"
          />
          <span className="text-[#FAF0E2]/90 leading-snug">
            I have read and agree to the{" "}
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTermsModal(true);
              }}
              className="text-[#AA8B63] underline font-semibold hover:text-[#C4A67E] cursor-pointer"
            >
              Terms & Conditions of Service
            </span>{" "}
            and authorize mobile spa grooming for{" "}
            <strong className="text-[#AA8B63]">{data.petName || "my pet"}</strong>.
          </span>
        </label>

        {/* Optional Signature Drawer */}
        <div>
          <button
            type="button"
            onClick={() => setShowOptionalSignature(!showOptionalSignature)}
            className="text-[11px] font-mono text-[#AA8B63] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showOptionalSignature ? "Hide" : "Add"} digital handwritten signature (Optional)</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showOptionalSignature && "rotate-180")} />
          </button>

          {showOptionalSignature && (
            <div className="mt-2.5 p-3 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 animate-in fade-in duration-200">
              <SignaturePad
                value={data.signature}
                onChange={(sig) => setData({ ...data, signature: sig })}
                onClear={() => setData({ ...data, signature: null })}
              />
            </div>
          )}
        </div>

        {/* ── THE MULTI-DOG DECISION PROMPT CARD (AS REQUESTED) ────── */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#202517] to-[#14160E] border-2 border-[#AA8B63]/60 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="font-display font-bold text-base text-[#FAF0E2]">
              Ready to finish, or would you like to add another dog?
            </h4>
          </div>

          <p className="text-xs text-[#A4AA93] leading-relaxed">
            You can add another dog to the same visit of our solar van. If you add a second dog,{" "}
            <strong className="text-emerald-300">you will receive a 20% discount on the second dog!</strong>
          </p>

          <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
            {/* BUTTON 1: AGREGAR OTRO PERRO */}
            <button
              type="button"
              onClick={onAddAnotherDog}
              className="py-3 px-3.5 rounded-2xl bg-[#252C1D] border border-[#AA8B63]/70 hover:bg-[#AA8B63]/30 text-[#FAF0E2] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group"
            >
              <PlusCircle className="h-4 w-4 text-[#AA8B63] group-hover:scale-110 transition-transform" />
              <span>➕ Add Another Dog (+20% OFF)</span>
            </button>

            {/* BUTTON 2: FINALIZAR RESERVA */}
            <button
              type="button"
              disabled={isSubmitting || !data.agreedToTerms}
              onClick={onFinalize}
              className="py-3 px-3.5 rounded-2xl bg-[#AA8B63] text-[#161811] hover:bg-[#C4A67E] text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming in System...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    ✓ Confirm Booking ({totalDogsInSession} dog{totalDogsInSession > 1 ? "s" : ""}) · ${grandTotal}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
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
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
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
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
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
          Handwritten Signature:
        </label>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-[#AA8B63] hover:text-[#FAF0E2] transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="relative w-full h-24 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 overflow-hidden flex items-center justify-center shadow-inner">
        {!hasStroke && !value && (
          <div className="absolute pointer-events-none select-none text-[#A4AA93]/40 font-sans text-xs font-medium">
            Sign here with finger or mouse
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

/* -------------------- FINAL COMPLETED VIEW: BOOKING SUMMARY -------------------- */
function BookingSummaryView({
  data,
  savedPets,
  invoicePdf,
  emailNotice,
  onReset,
}: {
  data: GroomingFlowState;
  savedPets: CompletedPet[];
  invoicePdf: { base64: string; fileName: string } | null;
  emailNotice: { type: "success" | "warning"; message: string } | null;
  onReset: () => void;
}) {
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId);
  const currentBasePrice = selectedPkg?.prices[data.size as PetSize] || 0;
  const currentAddonsCost = data.addons.reduce((sum, addId) => {
    const item = SPA_UPGRADES.find((u) => u.id === addId);
    if (!item) return sum;
    return sum + (parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0);
  }, 0);

  const isSecondDog = savedPets.length === 1;
  const currentDogDiscount = isSecondDog ? Math.round(currentBasePrice * 0.2) : 0;
  const currentDogTotal = currentBasePrice - currentDogDiscount + currentAddonsCost;

  const allPetsList: CompletedPet[] = [...savedPets];
  if (data.petName.trim() && data.packageId) {
    allPetsList.push({
      id: "active-pet",
      petName: data.petName,
      size: data.size,
      breed: data.breed || "Mix",
      petAge: data.petAge,
      gender: data.gender,
      packageId: data.packageId,
      packageName: selectedPkg?.name || "Signature Grooming",
      addons: data.addons,
      petCondition: data.petCondition,
      temperament: data.temperament,
      vaccinated: data.vaccinated,
      medicalConditions: data.medicalConditions,
      groomerNotes: data.groomerNotes,
      petPhoto: data.petPhoto,
      basePrice: currentBasePrice,
      addonsCost: currentAddonsCost,
      discount: currentDogDiscount,
      totalPrice: currentDogTotal,
    });
  }

  const grandTotal = allPetsList.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalSavings = allPetsList.reduce((sum, p) => sum + p.discount, 0);
  const resolvedOwner = data.ownerName || `${data.firstName} ${data.lastName}`.trim();

  const handleDownloadInvoice = () => {
    if (!invoicePdf?.base64) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${invoicePdf.base64}`;
    link.download = invoicePdf.fileName || `SOUVA-Invoice.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapsLink =
    data.latitude && data.longitude
      ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`;

  const waNumber = "18509600034";
  const petsSummaryText = allPetsList
    .map(
      (p, i) =>
        `• Dog #${i + 1}: ${p.petName} (${p.breed}, ${p.size.toUpperCase()}) - ${p.packageName} ($${p.totalPrice})`
    )
    .join("\n");

  const message = `✨ VIP BOOKING CONFIRMED - SOUVA MOBILE PET GROOMING ✨

📅 SCHEDULED APPOINTMENT:
• Date: ${data.scheduledDate}
• Time Window: ${data.scheduledTime}
• Dogs Booked: ${allPetsList.length}

🐾 PET COMPANIONS:
${petsSummaryText}
${totalSavings > 0 ? `\n🎉 Multi-Dog Discount Applied: -$${totalSavings}.00\n` : ""}
💰 ESTIMATED TOTAL DUE: $${grandTotal}

📍 DOORSTEP DESTINATION:
• Parent: ${resolvedOwner}
• Phone: ${data.phone}
• Email: ${data.email}
• Address: ${data.address} (ZIP ${data.zipCode})
• Parking: ${data.parkingNotes || "Driveway"}

📝 SOUVA SERVICE AGREEMENT ACCEPTED`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="py-2 text-left space-y-4">
      {/* Header Banner */}
      <div className="text-center pb-3 border-b border-[#FAF0E2]/10">
        <div className="relative mx-auto h-16 w-16 flex items-center justify-center mb-2">
          <div className="absolute inset-0 rounded-full bg-[#AA8B63]/25 blur-xl" />
          <img
            src="/assets/souva-badge-circle-transparent.png"
            alt="SOUVA Badge"
            className="h-12 w-12 object-contain rounded-full shadow-[0_0_20px_rgba(170,139,99,0.5)] relative z-10"
          />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5 font-mono">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Doorstep Appointment Confirmed & Saved in Airtable!</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-[#FAF0E2]">
          {data.scheduledDate}
          <span className="text-gradient-gold block font-mono text-xl sm:text-2xl mt-0.5">
            {data.scheduledTime}
          </span>
        </h3>
        <p className="text-xs text-[#A4AA93] mt-1 font-mono">
          30-Minute Arrival Window · Luxury Solar Van Dispatched Directly to Doorstep
        </p>
      </div>

      {/* Email Delivery Notification Banner */}
      {emailNotice && (
        <div className="p-3 rounded-2xl border text-xs flex items-start gap-2.5 bg-[#1B2317] border-[#AA8B63]/60 text-[#FAF0E2]">
          <Mail className="h-4 w-4 shrink-0 mt-0.5 text-[#AA8B63]" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="font-bold block text-[11px] font-mono uppercase tracking-wider">
              Confirmation Notice
            </span>
            <p className="text-[11px] text-[#A4AA93] leading-relaxed">
              {emailNotice.message}
            </p>
          </div>
        </div>
      )}

      {/* Booked Pets Summary */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-[#AA8B63] uppercase tracking-wider font-bold block">
          Booked Dogs in This Session ({allPetsList.length}):
        </span>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {allPetsList.map((pet, idx) => (
            <div key={pet.id} className="p-3 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
                <span className="font-bold text-xs text-[#FAF0E2] flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-[#AA8B63]" />
                  <span>#{idx + 1} {pet.petName}</span>
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#25281D] text-[#AA8B63] font-bold">
                  {pet.size}
                </span>
              </div>
              <div className="text-[11px] text-[#A4AA93]">
                <div>{pet.breed} · {pet.petAge}</div>
                <div className="text-[#FAF0E2] font-semibold mt-0.5">{pet.packageName}</div>
                {pet.discount > 0 && (
                  <div className="text-emerald-400 font-mono text-[10px]">
                    20% Multi-Dog Discount: -${pet.discount}
                  </div>
                )}
              </div>
              <div className="text-right font-mono font-bold text-xs text-[#AA8B63]">
                ${pet.totalPrice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client & Destination Card */}
      <div className="p-3.5 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/10 space-y-1 text-xs">
        <div className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>Doorstep Destination:</span>
        </div>
        <div className="font-bold text-[#FAF0E2]">{resolvedOwner} · {data.phone}</div>
        <div className="text-[#A4AA93]">{data.address} (ZIP {data.zipCode})</div>
        {data.parkingNotes && (
          <div className="text-[10.5px] text-[#FAF0E2]/80 pt-1">Parking: {data.parkingNotes}</div>
        )}
      </div>

      {/* Total Due */}
      <div className="p-4 rounded-2xl bg-[#14160F] border border-[#AA8B63]/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#A4AA93] block">Total Due at Service</span>
          <span className="text-[10.5px] text-[#AA8B63]">Cash, Check, Card or Zelle</span>
        </div>
        <span className="font-display font-extrabold text-2xl text-[#AA8B63]">${grandTotal}</span>
      </div>

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
            <span>📄 Official PDF Invoice emailed to {data.email || "your email address"}</span>
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
