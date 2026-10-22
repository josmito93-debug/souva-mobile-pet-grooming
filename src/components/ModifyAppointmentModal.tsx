import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Scissors,
  Sparkles,
  ShieldCheck,
  Heart,
  Check,
  AlertCircle,
  FileText,
  Save,
  Loader2,
  Trash2,
  Lock,
} from "lucide-react";
import { DispatchRequest, getStoredRequests } from "@/lib/dispatchStore";
import {
  fetchBookedSlots,
  isTimeMatching,
  formatToIsoDate,
  type BookedSlot,
} from "@/lib/airtable";
import {
  SOUVA_PACKAGES,
  SPA_UPGRADES,
  SIZE_GUIDE,
  type PetSize,
} from "@/data/services";
import {
  getAvailableDates,
  isDateBlocked,
  SCHEDULE_BY_DAY,
  type AvailableDate,
} from "@/components/GroomingFlow";
import { checkCoverage } from "@/data/coverage";
import { syncAppointmentUpdate } from "@/lib/clientPortalStore";
import { cn } from "@/lib/utils";

interface ModifyAppointmentModalProps {
  isOpen: boolean;
  appointment: DispatchRequest | null;
  onClose: () => void;
  onSaved: (updated: DispatchRequest) => void;
}

export function ModifyAppointmentModal(props: ModifyAppointmentModalProps) {
  if (!props.isOpen || !props.appointment) return null;
  return <ModifyAppointmentModalContent key={props.appointment.id} {...props} appointment={props.appointment} />;
}

function ModifyAppointmentModalContent({
  isOpen,
  appointment,
  onClose,
  onSaved,
}: ModifyAppointmentModalProps & { appointment: DispatchRequest }) {
  // Active section tab in editor
  const [activeSection, setActiveSection] = useState<"datetime" | "service" | "address" | "pet">("datetime");

  // 1. Date & Time State
  const availableDates = useMemo(() => getAvailableDates(), []);
  const initialDateObj = useMemo(() => {
    return availableDates.find((d) => d.isoDate === appointment.scheduledDate) ||
      availableDates.find((d) => !isDateBlocked(d.isoDate)) ||
      availableDates[0];
  }, [availableDates, appointment.scheduledDate]);

  const [selectedDate, setSelectedDate] = useState<AvailableDate>(initialDateObj);
  const slotsForDay = useMemo(() => {
    return SCHEDULE_BY_DAY[selectedDate?.dayOfWeek ?? 1] || [];
  }, [selectedDate]);

  const [selectedTime, setSelectedTime] = useState<string>(
    appointment.scheduledTime || appointment.preferredTime || "9:30 AM"
  );

  // Live Airtable Booked Slots
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoadingSlots(true);
    fetchBookedSlots().then((slots) => {
      if (active) {
        setBookedSlots(slots);
        setIsLoadingSlots(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isSlotBookedByOther = (isoDate: string, time: string) => {
    if (isDateBlocked(isoDate)) return true;

    // Allow keeping own current slot
    const ownIso = appointment.scheduledDate ? formatToIsoDate(appointment.scheduledDate) : "";
    const ownTime = appointment.scheduledTime || "";
    if (ownIso === isoDate && isTimeMatching(time, ownTime)) {
      return false;
    }

    // Check Airtable live booked slots
    const inAirtable = bookedSlots.some(
      (b) => formatToIsoDate(b.date) === formatToIsoDate(isoDate) && isTimeMatching(time, b.time)
    );
    if (inAirtable) return true;

    // Check local store
    try {
      const local = getStoredRequests();
      const inLocal = local.some((r) => {
        if (r.id === appointment.id || r.status === "cancelled") return false;
        const rIso = formatToIsoDate(r.scheduledDate || r.preferredTime || "");
        const rTime = r.scheduledTime || r.preferredTime || "";
        return rIso === isoDate && isTimeMatching(time, rTime);
      });
      if (inLocal) return true;
    } catch {}

    return false;
  };

  // 2. Package & Addons State
  const petSize: PetSize = (appointment.size as PetSize) || "medium";
  const [packageId, setPackageId] = useState<string>(
    appointment.packageId || "essential-full-groom"
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    Array.isArray(appointment.addons) ? appointment.addons : []
  );

  // 3. Location & Parking State
  const [address, setAddress] = useState<string>(appointment.address || "");
  const [zipCode, setZipCode] = useState<string>(appointment.zipCode || "");
  const [parkingNotes, setParkingNotes] = useState<string>(appointment.parkingNotes || "");
  const modalAddressInputRef = useRef<HTMLInputElement>(null);

  // Google Places Autocomplete integration
  useEffect(() => {
    let autocomplete: any = null;
    const initPlaces = () => {
      const g = (window as any).google;
      if (g?.maps?.places?.Autocomplete && modalAddressInputRef.current && !autocomplete) {
        try {
          autocomplete = new g.maps.places.Autocomplete(modalAddressInputRef.current, {
            componentRestrictions: { country: "us" },
            fields: ["address_components", "formatted_address", "geometry"],
            types: ["address"],
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place) return;

            const formattedAddress = place.formatted_address || "";
            let extractedZip = "";
            if (Array.isArray(place.address_components)) {
              for (const comp of place.address_components) {
                if (comp.types.includes("postal_code")) {
                  extractedZip = comp.short_name || comp.long_name || "";
                  break;
                }
              }
            }

            if (formattedAddress) setAddress(formattedAddress);
            if (extractedZip) setZipCode(extractedZip);
          });
        } catch (e) {
          console.warn("Google Places Autocomplete init modal error:", e);
        }
      }
    };

    initPlaces();
    const timer = setInterval(() => {
      const g = (window as any).google;
      if (g?.maps?.places?.Autocomplete && modalAddressInputRef.current && !autocomplete) {
        initPlaces();
        clearInterval(timer);
      }
    }, 350);

    return () => clearInterval(timer);
  }, [activeSection]);

  // 4. Pet Care & Notes State
  const [petName, setPetName] = useState<string>(appointment.petName || "");
  const [breed, setBreed] = useState<string>(appointment.breed || "");
  const [petAge, setPetAge] = useState<string>(appointment.petAge || "Adult");
  const [temperament, setTemperament] = useState<string>(appointment.temperament || "Friendly & Calm");
  const [medicalConditions, setMedicalConditions] = useState<string>(appointment.medicalConditions || "None / Healthy");
  const [groomerNotes, setGroomerNotes] = useState<string>(appointment.groomerNotes || appointment.notes || "");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Price Calculations
  const selectedPkg = SOUVA_PACKAGES.find((p) => p.id === packageId) || SOUVA_PACKAGES[0];
  const newBasePrice = selectedPkg.prices[petSize] || 110;

  const newAddonsCost = selectedAddons.reduce((sum, addTitle) => {
    const item = SPA_UPGRADES.find((u) => u.name === addTitle || u.id === addTitle);
    if (!item) return sum + 15;
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 15;
    return sum + priceNum;
  }, 0);

  const newEstimatedTotal = newBasePrice + newAddonsCost;
  const originalTotal = appointment.estimatedTotal || 125;

  // Toggle Spa Upgrade
  const handleToggleAddon = (upgradeName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(upgradeName) ? prev.filter((a) => a !== upgradeName) : [...prev, upgradeName]
    );
  };

  // Save all modifications
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isDateBlocked(selectedDate.isoDate)) {
      setErrorMessage("The week of October 19–25 is blocked for fleet operations. Please choose another date.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please provide a valid doorstep street address.");
      return;
    }

    setIsSaving(true);

    const fullFormattedDate = selectedDate.fullDate;
    const resolvedIso = selectedDate.isoDate;

    const updates: Partial<DispatchRequest> = {
      scheduledDate: resolvedIso,
      scheduledTime: selectedTime,
      preferredTime: `${fullFormattedDate} at ${selectedTime}`,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      basePrice: newBasePrice,
      addons: selectedAddons,
      addonsTotal: newAddonsCost,
      estimatedTotal: newEstimatedTotal,
      address: address.trim(),
      zipCode: zipCode.trim(),
      parkingNotes: parkingNotes.trim(),
      petName: petName.trim() || appointment.petName,
      breed: breed.trim() || appointment.breed,
      petAge,
      temperament,
      medicalConditions: medicalConditions.trim(),
      groomerNotes: groomerNotes.trim(),
      notes: groomerNotes.trim(),
      rescheduledAt: new Date().toISOString(),
    };

    try {
      const res = await syncAppointmentUpdate(
        appointment.id,
        (appointment as any).airtableRecordId,
        {
          ...updates,
          scheduledDate: resolvedIso,
          scheduledTime: selectedTime,
          servicePackage: selectedPkg.name,
          spaUpgrades: selectedAddons,
        }
      );

      const mergedAppointment: DispatchRequest = {
        ...appointment,
        ...updates,
      };

      setSaveSuccess(true);
      onSaved(mergedAppointment);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Modify appointment error:", err);
      setErrorMessage("Unable to sync changes to Airtable. Your changes were applied locally.");
      setIsSaving(false);
    }
  };

  const coverageCheck = zipCode.length >= 5 ? checkCoverage(zipCode) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#14160F] border-2 border-[#AA8B63]/60 rounded-3xl shadow-2xl overflow-hidden my-auto text-[#FAF0E2] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E2317] via-[#1B1E14] to-[#14160F] border-b border-[#FAF0E2]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#AA8B63] to-[#806440] text-[#161811] flex items-center justify-center font-bold text-base shadow-sm">
              ✨
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AA8B63] block">
                Full Appointment Customization
              </span>
              <h3 className="font-display font-extrabold text-base sm:text-xl text-[#FAF0E2] leading-tight">
                Modify Booking · {appointment.id}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#202517] hover:bg-[#AA8B63] text-[#FAF0E2] hover:text-[#161811] flex items-center justify-center transition-colors cursor-pointer border border-[#FAF0E2]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="grid grid-cols-4 p-2 bg-[#10120B] border-b border-[#FAF0E2]/10 gap-1 text-[11px] font-mono shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection("datetime")}
            className={cn(
              "py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer truncate",
              activeSection === "datetime"
                ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">Date & Time</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("service")}
            className={cn(
              "py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer truncate",
              activeSection === "service"
                ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <Scissors className="h-3 w-3 shrink-0" />
            <span className="truncate">Service & Spa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("address")}
            className={cn(
              "py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer truncate",
              activeSection === "address"
                ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">Doorstep & Van</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("pet")}
            className={cn(
              "py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer truncate",
              activeSection === "pet"
                ? "bg-[#AA8B63] text-[#161811] font-bold shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <Heart className="h-3 w-3 shrink-0" />
            <span className="truncate">Pet & Notes</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* ─── SECTION 1: DATE & ARRIVAL WINDOW ─── */}
          {activeSection === "datetime" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
                <span className="text-[11px] font-mono text-[#AA8B63] uppercase font-bold">
                  1. Pick Arrival Date & Window
                </span>
                <span className="text-[10.5px] font-mono text-[#A4AA93]">
                  Currently: {appointment.scheduledDate || "Scheduled Date"} ({appointment.scheduledTime || "Window"})
                </span>
              </div>

              {/* Blocked Week Warning */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-amber-200">
                <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">
                  Oct 19–25 is blocked for fleet maintenance. Available slots begin Oct 26.
                </span>
              </div>

              {/* Day Selector */}
              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-2 font-mono">
                  Available Dates (Next 30 Days):
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.slice(0, 30).map((d) => {
                    const isSelected = selectedDate.isoDate === d.isoDate;
                    const isBlocked = isDateBlocked(d.isoDate);

                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        disabled={isBlocked}
                        onClick={() => setSelectedDate(d)}
                        className={cn(
                          "min-w-[62px] p-2.5 rounded-2xl border text-center transition-all shrink-0 flex flex-col items-center justify-center cursor-pointer",
                          isBlocked
                            ? "opacity-35 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-md scale-102"
                            : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                        )}
                      >
                        <span className="text-[9px] font-mono uppercase">{d.dayLabel}</span>
                        <span className="font-extrabold text-base my-0.5">{d.dayNum}</span>
                        <span className="text-[9px] font-mono opacity-80">{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 30-Minute Arrival Window */}
              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-2 font-mono">
                  30-Minute Doorstep Arrival Window:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slotsForDay.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    const isOccupied = isSlotBookedByOther(selectedDate.isoDate, slot.time);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center",
                          isOccupied
                            ? "opacity-35 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2] font-bold shadow-sm cursor-pointer"
                            : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] cursor-pointer"
                        )}
                      >
                        <span className="font-mono text-xs font-bold">{slot.time}</span>
                        <span className={cn("text-[9px] font-mono mt-0.5", isOccupied ? "text-red-400 font-bold" : "text-[#AA8B63]")}>
                          {isOccupied ? "Reserved" : slot.period}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── SECTION 2: SERVICE PACKAGE & SPA UPGRADES ─── */}
          {activeSection === "service" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
                <span className="text-[11px] font-mono text-[#AA8B63] uppercase font-bold">
                  2. Select Grooming Package & Upgrades
                </span>
                <span className="text-[10.5px] font-mono text-amber-300 font-bold">
                  Size: {petSize.toUpperCase()} ({SIZE_GUIDE.find((s) => s.id === petSize)?.weight})
                </span>
              </div>

              {/* Packages Grid */}
              <div className="grid sm:grid-cols-2 gap-2.5">
                {SOUVA_PACKAGES.map((pkg) => {
                  const isSelected = packageId === pkg.id;
                  const price = pkg.prices[petSize] || 110;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setPackageId(pkg.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none",
                        isSelected
                          ? "bg-[#25281C] border-[#AA8B63] shadow-lg shadow-[#AA8B63]/15"
                          : "bg-[#181A12] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <h4 className={cn("font-display font-bold text-sm", isSelected ? "text-[#AA8B63]" : "text-[#FAF0E2]")}>
                            {pkg.name}
                          </h4>
                          <span className="font-mono font-bold text-xs text-[#FAF0E2]">${price}</span>
                        </div>
                        <p className="text-[10.5px] text-[#A4AA93] line-clamp-2 leading-relaxed">
                          {pkg.tagline}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#FAF0E2]/10 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#A4AA93]">Est. {pkg.duration}</span>
                        {isSelected && <span className="text-emerald-400 font-bold">✓ Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spa Upgrades Checkboxes */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-[#AA8B63] uppercase font-bold block mb-2">
                  Botanical Spa Upgrades & Add-ons:
                </span>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SPA_UPGRADES.map((upgrade) => {
                    const isChecked = selectedAddons.includes(upgrade.name);
                    return (
                      <div
                        key={upgrade.id}
                        onClick={() => handleToggleAddon(upgrade.name)}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all select-none",
                          isChecked
                            ? "bg-[#22271A] border-[#AA8B63] text-[#FAF0E2]"
                            : "bg-[#181A12] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                        )}
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-xs block truncate">{upgrade.name}</span>
                          <span className="text-[10px] text-[#A4AA93] block truncate">{upgrade.desc}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#AA8B63] shrink-0">
                          {upgrade.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── SECTION 3: DOORSTEP DESTINATION & PARKING ─── */}
          {activeSection === "address" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
                <span className="text-[11px] font-mono text-[#AA8B63] uppercase font-bold">
                  3. Doorstep Address & Van Access
                </span>
                <span className="text-[10.5px] font-mono text-[#A4AA93]">
                  100% Autonomous Solar Van
                </span>
              </div>

              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                  Street Address & Unit / Apt:
                </label>
                <input
                  ref={modalAddressInputRef}
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 2450 Pacific Ave, Apt 3B"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                />
                <span className="text-[10px] font-mono text-[#A4AA93] block mt-1">
                  Google Maps Places Autocomplete active
                </span>
              </div>

              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                  ZIP Code (5 Digits):
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                  placeholder="e.g. 94116"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                />
                {coverageCheck && (
                  <div className="mt-1 text-[11px] font-mono">
                    {coverageCheck.covered ? (
                      <span className="text-emerald-400">✓ Covered service zone: {coverageCheck.cityArea}</span>
                    ) : (
                      <span className="text-amber-400">⚠️ ZIP {zipCode} outside primary routes (inquiry required)</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                  Van Parking Instructions / Gate Code:
                </label>
                <textarea
                  rows={2}
                  value={parkingNotes}
                  onChange={(e) => setParkingNotes(e.target.value)}
                  placeholder="e.g. Driveway space available, gate code #1234, call upon arrival"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ─── SECTION 4: PET CARE & INSTRUCTIONS ─── */}
          {activeSection === "pet" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-[#FAF0E2]/10">
                <span className="text-[11px] font-mono text-[#AA8B63] uppercase font-bold">
                  4. Pet Care & Handling Instructions
                </span>
                <span className="text-[10.5px] font-mono text-[#A4AA93]">
                  1-on-1 Gentle Care
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                    Dog's Name:
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                    Breed / Mix:
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                    Temperament / Handling:
                  </label>
                  <select
                    value={temperament}
                    onChange={(e) => setTemperament(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none cursor-pointer"
                  >
                    <option value="Friendly & Calm">Friendly & Calm</option>
                    <option value="Anxious / Sensitive">Anxious / Sensitive</option>
                    <option value="Active & Playful">Active & Playful</option>
                    <option value="Shy / Extra Patience Needed">Shy / Extra Patience Needed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                    Medical Notes / Allergies:
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Sensitive skin, arthritis, none"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A4AA93] uppercase font-semibold block mb-1">
                  Stylist Notes & Styling Instructions:
                </label>
                <textarea
                  rows={2}
                  value={groomerNotes}
                  onChange={(e) => setGroomerNotes(e.target.value)}
                  placeholder="e.g. Shorter puppy cut, round teddy bear face, gentle with front paws..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Pricing Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#1C2016] border border-[#AA8B63]/30 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-[#A4AA93] uppercase block">Updated Estimated Total:</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-amber-300">
                  ${newEstimatedTotal}.00 USD
                </span>
                {newEstimatedTotal !== originalTotal && (
                  <span className="text-[11px] text-[#A4AA93] line-through">
                    ${originalTotal}.00
                  </span>
                )}
              </div>
            </div>

            <div className="text-right text-[10px] text-[#A4AA93]">
              <span>Base Package: ${newBasePrice}</span>
              <span className="block">+ Upgrades ({selectedAddons.length}): ${newAddonsCost}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#25281D] hover:bg-[#333827] text-xs font-mono text-[#FAF0E2] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#161811]" />
                  <span>Syncing to Airtable...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 text-[#161811]" />
                  <span>Saved & Synchronized!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#161811]" />
                  <span>Save All Changes & Sync</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
