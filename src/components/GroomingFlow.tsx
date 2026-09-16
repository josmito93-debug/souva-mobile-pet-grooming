import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  User,
  ChevronLeft,
  Shield,
  Clock,
  Truck,
  ArrowRight,
  Heart,
  Scissors,
  Check,
  Calendar,
  Smile,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetBlueprint, type GroomingZone, type PetSize } from "@/components/PetBlueprint";
import breedsList from "@/data/breeds.json";
import { SOUVA_PACKAGES, SPA_ADDONS } from "@/data/services";

export type CoatState = "smooth" | "tangles" | "matted";
export type Temperament = "calm" | "playful" | "nervous" | "senior";

export interface GroomingFlowState {
  size: PetSize;
  zones: GroomingZone[];
  petName: string;
  breed: string;
  petPhoto: string | null;
  temperament: Temperament;
  packageId: string;
  addons: string[];
  coatCondition: CoatState;
  ownerName: string;
  phone: string;
  address: string;
  preferredTime: string;
  latitude: number | null;
  longitude: number | null;
}

const STEPS_TOTAL = 5;

/* -------------------- Status LED Grid -------------------- */
function StatusLedGrid({ activeIndex, hot }: { activeIndex: number; hot: boolean }) {
  const steps = [
    { icon: Sparkles, label: "Talla & Spa" },
    { icon: Heart, label: "Mascota" },
    { icon: Scissors, label: "Servicio" },
    { icon: Shield, label: "Manto" },
    { icon: MapPin, label: "Tu Puerta" },
    { icon: Truck, label: "Van Móvil" },
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
                {/* Corner dots */}
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
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [dispatched, setDispatched] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(25 * 60);
  const [justArmed, setJustArmed] = useState(false);

  const [data, setData] = useState<GroomingFlowState>({
    size: "medium",
    zones: ["face", "body", "paws"],
    petName: "",
    breed: "",
    petPhoto: null,
    temperament: "calm",
    packageId: "full-grooming",
    addons: ["blueberry-facial"],
    coatCondition: "smooth",
    ownerName: "",
    phone: "",
    address: "",
    preferredTime: "Lo antes posible (Hoy)",
    latitude: null,
    longitude: null,
  });

  // Countdown when dispatched
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
      size: "medium",
      zones: ["face", "body", "paws"],
      petName: "",
      breed: "",
      petPhoto: null,
      temperament: "calm",
      packageId: "full-grooming",
      addons: ["blueberry-facial"],
      coatCondition: "smooth",
      ownerName: "",
      phone: "",
      address: "",
      preferredTime: "Lo antes posible (Hoy)",
      latitude: null,
      longitude: null,
    });
  };

  const canNext = Boolean(
    (step === 0 && data.zones.length > 0) ||
      (step === 1 && data.petName.trim().length >= 1 && data.breed.trim().length >= 2) ||
      (step === 2 && data.packageId) ||
      (step === 3 && data.coatCondition) ||
      (step === 4 &&
        data.ownerName.trim().length >= 2 &&
        data.phone.trim().length >= 6 &&
        data.address.trim().length >= 4)
  );

  useEffect(() => {
    onStatus({ armed: canNext && !dispatched, dispatched });
  }, [canNext, dispatched, onStatus]);

  // One-shot arming ring
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

  const handleNext = () => {
    if (step < STEPS_TOTAL - 1) {
      setDir("fwd");
      setStep(step + 1);
    } else {
      // Dispatch & open WhatsApp
      const waNumber = "15551234567"; // SOUVA booking concierge line
      const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.name || "Full Grooming";
      const addonsText = data.addons.length > 0 ? data.addons.join(", ") : "Ninguno";
      const coatText =
        data.coatCondition === "smooth"
          ? "Manto suave y sin nudos"
          : data.coatCondition === "tangles"
          ? "Algunos nudos o enredos"
          : "Manto muy anudado / Piel sensible";

      const mapsLink =
        data.latitude && data.longitude
          ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`;

      const message = `✨ RESERVA VIP - SOUVA MOBILE PET GROOMING ✨

🐾 MASCOTA:
• Nombre: ${data.petName}
• Raza: ${data.breed}
• Talla: ${data.size.toUpperCase()}
• Temperamento: ${data.temperament}
${data.petPhoto ? "• Foto del peludo: Adjunta en la web para evaluación del estilista\n" : ""}
✂️ SERVICIO SELECCIONADO:
• Paquete: ${selectedPkg}
• Mimos Extra (Add-ons): ${addonsText}
• Condición del pelaje: ${coatText}
• Horario preferido: ${data.preferredTime}

📍 CLIENTE & UBICACIÓN:
• Tutor/a: ${data.ownerName}
• Teléfono: ${data.phone}
• Dirección: ${data.address}
• Google Maps: ${mapsLink}

¡Por favor confirmar disponibilidad de la van móvil para consentir a mi peludo! 🚐❤️`;

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      setDir("fwd");
      setDispatched(true);
    }
  };

  return (
    <div className="w-full">
      {/* Animated Status LED Tracker */}
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
          aria-label="Volver"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-xs font-semibold text-[#AA8B63] font-mono tracking-wider">
          {dispatched ? "VAN EN RUTA" : `PASO ${step + 1} DE ${STEPS_TOTAL}`}
        </div>

        <div className="w-9" />
      </div>

      {/* Progress Energy Bar */}
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
            <StepPetProfile data={data} setData={setData} />
          ) : step === 2 ? (
            <StepServicePackage data={data} setData={setData} />
          ) : step === 3 ? (
            <StepCoatCondition data={data} setData={setData} />
          ) : (
            <StepDoorstepLocation data={data} setData={setData} />
          )}
        </div>

        {/* Action Button */}
        {!dispatched && (
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className={cn(
              "mt-6 w-full py-4 text-sm font-bold btn-luxury relative z-10 flex items-center justify-center gap-2",
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
                <span>Despachar Van a Mi Puerta</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------- STEP 1: PET SIZE & BLUEPRINT -------------------- */
function StepPetSize({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const toggleZone = (z: GroomingZone) => {
    let next = [...data.zones];
    if (next.includes(z)) {
      if (next.length > 1) {
        next = next.filter((item) => item !== z);
      }
    } else {
      next.push(z);
    }
    setData({ ...data, zones: next });
  };

  return (
    <div>
      <StepHeader
        eyebrow="Paso 1"
        title="Talla & Zonas de Cuidado"
        subtitle="Selecciona la talla de tu peludo y las áreas que requieren mayor atención."
      />
      <div className="mt-4">
        <PetBlueprint
          selectedZones={data.zones}
          onToggleZone={toggleZone}
          selectedSize={data.size}
          onSelectSize={(size) => setData({ ...data, size })}
        />
      </div>
    </div>
  );
}

/* -------------------- STEP 2: PET PROFILE & BREED -------------------- */
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

  const temperaments: { id: Temperament; label: string; icon: string }[] = [
    { id: "calm", label: "Tranquilo & Dócil", icon: "🐾" },
    { id: "playful", label: "Juguetón / Enérgico", icon: "⚡" },
    { id: "nervous", label: "Tímido o Nervioso", icon: "🤍" },
    { id: "senior", label: "Senior / Cuidados Suaves", icon: "✨" },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Paso 2"
        title="¿Quién es tu compañero?"
        subtitle="Dinos su nombre, raza y temperamento para personalizar su experiencia de spa."
      />

      <div className="mt-5 space-y-4">
        {/* Pet Name */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Nombre de la Mascota
          </label>
          <div className="relative">
            <Heart className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.petName}
              onChange={(e) => setData({ ...data, petName: e.target.value })}
              placeholder="Ej. Bruno, Maya, Toby..."
              className="w-full pl-10 pr-4 h-12 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-sm text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] focus:ring-1 focus:ring-[#AA8B63] transition-all"
            />
          </div>
        </div>

        {/* Breed Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Raza o Tipo
          </label>
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.breed}
              onChange={(e) => {
                setData({ ...data, breed: e.target.value });
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Ej. Golden Retriever, Poodle, Mestizo..."
              className="w-full pl-10 pr-4 h-12 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-sm text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] focus:ring-1 focus:ring-[#AA8B63] transition-all"
              autoComplete="off"
            />
          </div>

          {isOpen && filteredBreeds.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#FAF0E2]/15 bg-[#1F2318]/95 backdrop-blur-md p-1.5 shadow-2xl">
              {filteredBreeds.map((breed) => (
                <button
                  key={breed}
                  type="button"
                  onClick={() => {
                    setData({ ...data, breed });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#FAF0E2] hover:bg-[#AA8B63]/20 rounded-lg transition-colors cursor-pointer select-none font-medium flex items-center justify-between"
                >
                  <span>{breed}</span>
                  <span className="text-[10px] text-[#AA8B63]">Seleccionar</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Temperament */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1.5">
            Temperamento en el baño
          </label>
          <div className="grid grid-cols-2 gap-2">
            {temperaments.map((temp) => {
              const isSelected = data.temperament === temp.id;
              return (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() => setData({ ...data, temperament: temp.id })}
                  className={cn(
                    "p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-300 cursor-pointer select-none",
                    isSelected
                      ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] shadow-[0_0_12px_rgba(170,139,99,0.3)]"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                  )}
                >
                  <span className="text-base">{temp.icon}</span>
                  <span className="text-xs font-medium">{temp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Pet Photo (Camera / Gallery Upload) */}
        <div className="pt-2 border-t border-[#FAF0E2]/10">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-[#AA8B63]" />
              <span>Foto de tu Perrito (Opcional)</span>
            </label>
            <span className="text-[9.5px] font-mono text-[#AA8B63] bg-[#AA8B63]/15 px-2 py-0.5 rounded-full">
              Para evaluar manto
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
            <div className="relative p-3 rounded-2xl bg-[#14160F] border border-[#AA8B63]/60 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src={data.petPhoto}
                  alt="Foto del peludo"
                  className="h-14 w-14 object-cover rounded-xl border border-[#FAF0E2]/20 shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold text-[#FAF0E2] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span>Foto adjuntada para el estilista</span>
                  </div>
                  <span className="text-[10px] text-[#A4AA93]">
                    Ayudará a preparar las tijeras y peines indicados
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-xs text-[#AA8B63] hover:bg-[#25281D] transition-colors cursor-pointer"
                  title="Cambiar foto"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, petPhoto: null })}
                  className="p-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Eliminar foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 rounded-2xl border border-dashed border-[#FAF0E2]/20 hover:border-[#AA8B63] bg-[#14160F]/60 hover:bg-[#1C1F15] transition-all flex items-center justify-between gap-3 cursor-pointer group text-left"
            >
              <div className="h-9 w-9 rounded-xl bg-[#22261A] group-hover:bg-[#AA8B63] group-hover:text-[#161811] text-[#AA8B63] flex items-center justify-center transition-colors shrink-0 shadow-inner">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors block">
                  Tomar foto o subir de galería
                </span>
                <span className="text-[10px] text-[#A4AA93] block truncate">
                  Muestra su carita o cuerpo entero para conocerlo mejor
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

/* -------------------- STEP 3: SERVICE PACKAGE & ADDONS -------------------- */
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

  return (
    <div>
      <StepHeader
        eyebrow="Paso 3"
        title="Selecciona el Paquete de Spa"
        subtitle="Cada servicio incluye toallas tibias, champú orgánico y aromaterapia relajante."
      />

      {/* Packages Grid */}
      <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {SOUVA_PACKAGES.map((pkg) => {
          const isSelected = data.packageId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setData({ ...data, packageId: pkg.id })}
              className={cn(
                "w-full text-left p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer relative select-none",
                isSelected
                  ? "bg-[#AA8B63]/20 border-[#AA8B63] shadow-[0_0_15px_rgba(170,139,99,0.25)]"
                  : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
              )}
            >
              {pkg.popular && (
                <span className="absolute right-3 top-3 px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase rounded-full bg-[#AA8B63] text-[#161811]">
                  Más Solicitado
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-[#FAF0E2]">
                  {pkg.name}
                </span>
                <span className="font-mono text-xs font-bold text-[#AA8B63] mr-2">
                  {pkg.priceRange}
                </span>
              </div>
              <p className="text-[11px] text-[#A4AA93] mt-1 line-clamp-1">{pkg.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10">
        <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-2">
          Mimos Especiales (Add-ons opcionales)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SPA_ADDONS.map((add) => {
            const isSelected = data.addons.includes(add.id);
            return (
              <button
                key={add.id}
                type="button"
                onClick={() => toggleAddon(add.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 cursor-pointer select-none flex items-center gap-1.5",
                  isSelected
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-md"
                    : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
                title={add.desc}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>{add.label}</span>
                <span className="opacity-75 font-mono text-[10px]">{add.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- STEP 4: COAT CONDITION -------------------- */
function StepCoatCondition({
  data,
  setData,
}: {
  data: GroomingFlowState;
  setData: React.Dispatch<React.SetStateAction<GroomingFlowState>>;
}) {
  const coatOptions = [
    {
      id: "smooth" as const,
      title: "Manto Suave y Desenredado",
      desc: "Cepillado regular en casa, pelaje limpio sin nudos considerables.",
      icon: Smile,
    },
    {
      id: "tangles" as const,
      title: "Nudos Moderados / Manto Denso",
      desc: "Zonas con enredos ligeros (detrás de orejas, patitas o axilas) que requieren deslanado.",
      icon: Scissors,
    },
    {
      id: "matted" as const,
      title: "Manto Muy Anudado / Piel Sensible",
      desc: "Requiere técnica especializada de desanudado suave, hidratación profunda o corte de rescate.",
      icon: AlertCircle,
    },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Paso 4"
        title="Condición del Pelaje & Piel"
        subtitle="Esto ayuda a nuestro estilista móvil a preparar los bálsamos y herramientas adecuadas."
      />

      <div className="mt-5 space-y-3">
        {coatOptions.map((opt) => {
          const isSelected = data.coatCondition === opt.id;
          const IconComp = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setData({ ...data, coatCondition: opt.id })}
              className={cn(
                "relative w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 cursor-pointer select-none",
                isSelected
                  ? "bg-[#AA8B63]/20 border-[#AA8B63] shadow-[0_0_15px_rgba(170,139,99,0.3)] scale-102"
                  : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isSelected
                    ? "border-[#AA8B63] bg-[#AA8B63]/30 text-[#FAF0E2]"
                    : "border-[#FAF0E2]/15 bg-[#25281D] text-[#A4AA93]"
                )}
              >
                <IconComp className="h-5 w-5" />
              </div>

              <div className="pr-6">
                <div
                  className={cn(
                    "text-sm font-bold transition-colors font-display",
                    isSelected ? "text-[#FAF0E2]" : "text-[#E2D7C5]"
                  )}
                >
                  {opt.title}
                </div>
                <div className="text-[11.5px] text-[#A4AA93] mt-0.5 leading-normal">
                  {opt.desc}
                </div>
              </div>

              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#AA8B63] text-[#161811]">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- STEP 5: DOORSTEP & CONTACT WITH GPS -------------------- */
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
      setLocateError("La geolocalización no está soportada");
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
          const city = addrObj.city || addrObj.town || addrObj.village || "Austin";
          const state = addrObj.state || "TX";
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
              address: `Ubicación GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            });
            setIsLocating(false);
          }, 500);
        }
      },
      (error) => {
        clearInterval(interval);
        setLocateProgress(100);
        setLocateError(error.message || "Error al obtener ubicación");
        setTimeout(() => setIsLocating(false), 1000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div>
      <StepHeader
        eyebrow="Paso 5"
        title="¿A qué puerta enviamos la Van?"
        subtitle="Estacionamos frente a tu domicilio sin ensuciar ni requerir toma de agua ni electricidad."
      />

      <div className="mt-4 space-y-3.5">
        {/* Owner Name */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Tu Nombre y Apellido
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.ownerName}
              onChange={(e) => setData({ ...data, ownerName: e.target.value })}
              placeholder="Ej. Valeria Gómez"
              className="w-full pl-10 pr-4 h-12 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-sm text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] focus:ring-1 focus:ring-[#AA8B63] transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Teléfono Móvil (WhatsApp)
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="Ej. +1 (555) 123-4567"
              className="w-full pl-10 pr-4 h-12 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-sm text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] focus:ring-1 focus:ring-[#AA8B63] transition-all"
            />
          </div>
        </div>

        {/* Address & GPS */}
        <div>
          <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
            Dirección del Servicio
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Calle, número, departamento o barrio"
              className="w-full pl-10 pr-24 h-12 bg-[#1B1E15] border border-[#FAF0E2]/15 rounded-xl text-sm text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] focus:ring-1 focus:ring-[#AA8B63] transition-all"
            />
            <button
              type="button"
              disabled={isLocating}
              onClick={handleUseMyLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-[9.5px] font-bold font-mono tracking-wide text-[#AA8B63] border border-[#AA8B63]/30 hover:border-[#AA8B63] hover:bg-[#AA8B63]/10 rounded-lg transition-all cursor-pointer select-none disabled:opacity-50"
            >
              {isLocating ? "BUSCANDO..." : "GPS LOCALIZAR"}
            </button>
          </div>
        </div>

        {/* Locating Progress */}
        {isLocating && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-[#AA8B63] font-mono font-bold uppercase tracking-wide animate-pulse">
              <span>SINCRONIZANDO CON SATÉLITES GPS...</span>
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

/* -------------------- STEP 6: DISPATCHED / VAN EN RUTA VIEW -------------------- */
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
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === data.packageId)?.name || "Full Grooming";

  return (
    <div className="text-center py-2">
      {/* Animated Van & Crest Icon */}
      <div className="relative mx-auto h-28 w-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#AA8B63]/30 to-[#59593E]/30 blur-2xl animate-pulse" />
        <img
          src="/assets/souva-badge-circle-transparent.png"
          alt="SOUVA Badge"
          className="h-20 w-20 object-contain rounded-full shadow-[0_0_25px_rgba(170,139,99,0.5)] relative z-10"
        />
        <div className="absolute -right-2 -top-1 h-7 w-7 rounded-full bg-[#AA8B63] text-[#161811] flex items-center justify-center shadow-lg animate-bounce">
          <Truck className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#AA8B63] flex items-center justify-center gap-1.5 font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AA8B63]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FAF0E2]" />
        </span>
        Van Móvil de Spa en Camino
      </div>

      <h3 className="font-display text-4xl font-bold mt-2 tracking-tight text-[#FAF0E2]">
        LLEGADA ESTIMADA{" "}
        <span className="text-gradient-gold font-mono block mt-1">
          {mins}:{secs} min
        </span>
      </h3>

      {/* Real-time Van Progress Bar */}
      <div className="mt-6 mb-4 relative text-left">
        <div className="flex justify-between text-[9.5px] text-[#A4AA93] mb-1.5 font-mono font-bold uppercase tracking-wider">
          <span>CENTRAL SOUVA SPA</span>
          <span className="text-[#AA8B63] animate-pulse">EN TRÁNSITO VIP...</span>
          <span>TU DOMICILIO</span>
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

        {/* Animated Van marker riding along the bar */}
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

      <p className="mt-3 text-sm text-[#A4AA93]">
        Estilista canino profesional asignado/a para consentir a{" "}
        <strong className="text-[#FAF0E2]">{data.petName || "tu peludo"}</strong> en:
        <br />
        <span className="text-[#FAF0E2] font-semibold text-base mt-1 block">
          {data.address || "Tu puerta"}
        </span>
      </p>

      {/* Booking summary receipt */}
      <div className="mt-6 rounded-2xl border border-[#FAF0E2]/10 bg-[#1B1E15] p-4 text-left text-xs space-y-2">
        {data.petPhoto && (
          <div className="flex items-center gap-3 pb-2 border-b border-[#FAF0E2]/10">
            <img
              src={data.petPhoto}
              alt={data.petName}
              className="h-12 w-12 object-cover rounded-xl border border-[#AA8B63]/40 shadow-sm"
            />
            <div>
              <span className="text-[10px] text-[#AA8B63] font-mono font-bold uppercase tracking-wider block">
                Foto Adjunta
              </span>
              <span className="text-xs font-bold text-[#FAF0E2]">
                {data.petName} ({data.breed})
              </span>
            </div>
          </div>
        )}
        <Row label="Mascota" value={`${data.petName} (${data.breed} · ${data.size.toUpperCase()})`} />
        <Row label="Servicio Principal" value={selectedPkg} />
        <Row label="Mimos Extra" value={data.addons.length > 0 ? data.addons.join(", ") : "Ninguno"} />
        <Row
          label="Condición del Manto"
          value={
            data.coatCondition === "smooth"
              ? "Suave / Regular"
              : data.coatCondition === "tangles"
              ? "Enredos moderados"
              : "Anudado / Piel sensible"
          }
        />
        <Row label="Contacto" value={`${data.ownerName} · ${data.phone}`} />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-xs text-[#A4AA93] hover:text-[#AA8B63] transition-colors underline underline-offset-4 font-semibold cursor-pointer"
      >
        Programar otra cita o modificar reserva
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-[#FAF0E2]/5 last:border-b-0">
      <span className="text-[#A4AA93]">{label}</span>
      <span className="font-semibold text-right text-[#FAF0E2]">{value}</span>
    </div>
  );
}
