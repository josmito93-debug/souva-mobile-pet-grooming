import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAvailableDates,
  isDateBlocked,
  SCHEDULE_BY_DAY,
  type AvailableDate,
  type TimeSlot,
} from "@/components/GroomingFlow";
import {
  fetchBookedSlots,
  isTimeMatching,
  formatToIsoDate,
  type BookedSlot,
} from "@/lib/airtable";
import { rescheduleAppointment, cancelAppointment, getStoredRequests } from "@/lib/dispatchStore";

interface ManageAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: "reschedule" | "cancel";
  bookingId?: string;
  petName?: string;
  currentDate?: string;
  currentTime?: string;
}

export function ManageAppointmentModal(props: ManageAppointmentModalProps) {
  if (!props.isOpen) return null;
  return <ManageAppointmentModalContent {...props} />;
}

function ManageAppointmentModalContent({
  isOpen,
  onClose,
  initialAction = "reschedule",
  bookingId = "",
  petName = "your dog",
  currentDate = "Upcoming Date",
  currentTime = "Arrival Window",
}: ManageAppointmentModalProps) {
  const [activeTab, setActiveTab] = useState<"reschedule" | "cancel">(initialAction);

  useEffect(() => {
    setActiveTab(initialAction);
  }, [initialAction, isOpen]);

  const availableDates = useMemo(() => getAvailableDates(), []);
  const initialAvailableDate = useMemo(
    () => availableDates.find((d) => !isDateBlocked(d.isoDate)) || availableDates[0],
    [availableDates]
  );

  const [selectedDate, setSelectedDate] = useState<AvailableDate>(initialAvailableDate);
  const slotsForSelectedDay = useMemo(() => {
    return SCHEDULE_BY_DAY[selectedDate?.dayOfWeek ?? 1] || [];
  }, [selectedDate]);

  const [selectedTime, setSelectedTime] = useState<string>(() => slotsForSelectedDay[0]?.time || "9:30 AM");
  const [notes, setNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("Schedule conflict / Need to postpone");

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  useEffect(() => {
    let active = true;
    fetchBookedSlots().then((slots) => {
      if (active) setBookedSlots(slots);
    });
    return () => {
      active = false;
    };
  }, []);

  const isSlotOccupied = (isoDate: string, time: string) => {
    if (isDateBlocked(isoDate)) return true;
    const normIso = formatToIsoDate(isoDate);
    const ownIso = formatToIsoDate(currentDate || "");
    if (ownIso === normIso && isTimeMatching(time, currentTime || "")) return false;

    return bookedSlots.some(
      (b) => formatToIsoDate(b.date) === normIso && isTimeMatching(time, b.time)
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [completedAction, setCompletedAction] = useState<"rescheduled" | "cancelled" | null>(null);

  // Update selected time when day changes
  useEffect(() => {
    if (slotsForSelectedDay.length > 0) {
      const match = slotsForSelectedDay.find((s) => s.time === selectedTime);
      if (!match) {
        setSelectedTime(slotsForSelectedDay[0].time);
      }
    }
  }, [slotsForSelectedDay]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;
    if (isDateBlocked(selectedDate.isoDate)) {
      setStatusMessage({
        type: "error",
        text: "The week of October 19–25 is blocked. Please select another date.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const fullNewDate = selectedDate.fullDate;
    const rescheduleNote = notes.trim()
      ? `Client rescheduled online to ${fullNewDate} @ ${selectedTime}. Note: ${notes.trim()}`
      : `Client rescheduled online to ${fullNewDate} @ ${selectedTime}`;

    try {
      // 1. Sync to backend Airtable
      const res = await fetch("/api/admin-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId || undefined,
          scheduledDate: selectedDate.isoDate,
          scheduledTime: selectedTime,
          notes: rescheduleNote,
        }),
      });

      // 2. Update local dispatch store if bookingId exists in local records
      if (bookingId) {
        try {
          rescheduleAppointment(bookingId, fullNewDate, selectedTime, rescheduleNote);
        } catch (e) {
          console.warn("Local reschedule store update:", e);
        }
      }

      // Re-fetch booked slots so the modal and background immediately know the old slot is freed!
      fetchBookedSlots().then((s) => setBookedSlots(s));
      window.dispatchEvent(new CustomEvent("souva_dispatch_updated"));

      setCompletedAction("rescheduled");
      setStatusMessage({
        type: "success",
        text: `Your appointment for ${petName} was successfully rescheduled to ${fullNewDate} (${selectedTime}).`,
      });
    } catch (err: any) {
      console.error("Reschedule error:", err);
      // Even if network fails, apply locally
      if (bookingId) {
        rescheduleAppointment(bookingId, fullNewDate, selectedTime, rescheduleNote);
      }
      fetchBookedSlots().then((s) => setBookedSlots(s));
      window.dispatchEvent(new CustomEvent("souva_dispatch_updated"));
      setCompletedAction("rescheduled");
      setStatusMessage({
        type: "success",
        text: `Your appointment was rescheduled to ${fullNewDate} at ${selectedTime}. Our concierge will verify arrival.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const cancelNote = `Client cancelled online. Reason: ${cancelReason}`;

    try {
      // 1. Sync status to backend Airtable
      await fetch("/api/admin-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId || undefined,
          status: "cancelled",
          notes: cancelNote,
        }),
      });

      // 2. Update local dispatch store
      if (bookingId) {
        try {
          cancelAppointment(bookingId, cancelReason);
        } catch (e) {
          console.warn("Local cancel store update:", e);
        }
      }

      fetchBookedSlots().then((s) => setBookedSlots(s));
      window.dispatchEvent(new CustomEvent("souva_dispatch_updated"));

      setCompletedAction("cancelled");
      setStatusMessage({
        type: "success",
        text: `Your appointment for ${petName} on ${currentDate} has been cancelled.`,
      });
    } catch (err: any) {
      console.error("Cancellation error:", err);
      if (bookingId) {
        cancelAppointment(bookingId, cancelReason);
      }
      setCompletedAction("cancelled");
      setStatusMessage({
        type: "success",
        text: `Your appointment has been cancelled. If you need anything, please contact our concierge.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const waRescheduleUrl = `https://wa.me/14153755823?text=${encodeURIComponent(
    `Hello SOUVA Concierge, I need assistance regarding my booking (${bookingId || "SOUVA"}) for ${petName} scheduled on ${currentDate}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#14160E] border-2 border-[#AA8B63]/60 shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto text-[#FAF0E2]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E2317] via-[#1B1E14] to-[#14160E] border-b border-[#FAF0E2]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#AA8B63] to-[#806440] text-[#161811] flex items-center justify-center font-bold text-base shadow-sm">
              🐾
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-[#FAF0E2] leading-tight">
                Manage Doorstep Appointment
              </h3>
              <p className="text-[11px] font-mono text-[#AA8B63]">
                {bookingId ? `Booking ID: ${bookingId}` : "SOUVA Mobile Pet Grooming"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#202517] hover:bg-[#AA8B63] text-[#FAF0E2] hover:text-[#161811] flex items-center justify-center transition-colors cursor-pointer border border-[#FAF0E2]/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Existing Appointment Reference Card */}
        <div className="p-4 bg-[#1B1E15] border-b border-[#FAF0E2]/10 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#A4AA93] block">
              Currently Scheduled:
            </span>
            <span className="font-bold text-[#FAF0E2]">
              {petName} · {currentDate}
            </span>
            <span className="text-[#AA8B63] block text-[11px] font-mono">
              Window: {currentTime}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-[#AA8B63]/20 border border-[#AA8B63]/40 text-[#AA8B63] font-mono text-[10px] font-bold uppercase shrink-0">
            Confirmed
          </span>
        </div>

        {/* Tabs: Reschedule vs Cancel */}
        {!completedAction && (
          <div className="grid grid-cols-2 p-2 bg-[#12140D] border-b border-[#FAF0E2]/10 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("reschedule")}
              className={cn(
                "py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "reschedule"
                  ? "bg-[#AA8B63] text-[#161811] shadow-md"
                  : "bg-transparent text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reschedule</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cancel")}
              className={cn(
                "py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "cancel"
                  ? "bg-red-500/25 border border-red-500/50 text-red-300 shadow-md"
                  : "bg-transparent text-[#A4AA93] hover:text-red-300"
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {completedAction ? (
            <div className="py-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                ✓
              </div>
              <h4 className="font-display font-extrabold text-xl text-[#FAF0E2]">
                {completedAction === "rescheduled"
                  ? "Appointment Rescheduled!"
                  : "Appointment Cancelled"}
              </h4>
              <p className="text-xs sm:text-sm text-[#A4AA93] max-w-sm mx-auto leading-relaxed">
                {statusMessage?.text}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waRescheduleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Concierge</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#202517] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] font-mono font-bold text-xs uppercase transition-all cursor-pointer border border-[#FAF0E2]/10"
                >
                  Done / Close
                </button>
              </div>
            </div>
          ) : activeTab === "reschedule" ? (
            /* RESCHEDULE TAB */
            <div className="space-y-4">
              {/* Blocked Week Fleet Alert */}
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center gap-2 text-xs text-amber-200">
                <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">
                  Week of <strong>Oct 19–25</strong> is blocked. Available dates start <strong>Monday, Oct 26</strong>.
                </span>
              </div>

              {/* Select New Date */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63] block mb-2">
                  1. Pick New Date:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
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
                          "min-w-[58px] p-2 rounded-2xl border text-center transition-all shrink-0 flex flex-col items-center justify-center",
                          isBlocked
                            ? "opacity-35 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] font-bold shadow-md scale-102"
                            : "bg-[#1B1E15] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] cursor-pointer"
                        )}
                      >
                        <span className="text-[8.5px] font-mono uppercase">{d.dayLabel}</span>
                        <span className="font-extrabold text-sm my-0.5">{d.dayNum}</span>
                        <span className="text-[8.5px] font-mono opacity-80">{d.month}</span>
                        {isBlocked && (
                          <span className="text-[7px] font-mono font-bold text-amber-400 uppercase mt-0.5">
                            Blocked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Arrival Window */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63] block mb-2">
                  2. Pick 30-Minute Arrival Window:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {slotsForSelectedDay.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    const isOccupied = isSlotOccupied(selectedDate.isoDate, slot.time);

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
                        <span className={cn("text-[9px] font-mono mt-0.5", isOccupied ? "text-red-400 font-bold" : "text-[#AA8B63] opacity-80")}>
                          {isOccupied ? "Reserved" : slot.period}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-[11px] font-mono text-[#A4AA93] block mb-1">
                  Reason or special instructions (Optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Working from home, gate code update..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                />
              </div>

              {/* Submit Reschedule */}
              <button
                type="button"
                disabled={isSubmitting || isDateBlocked(selectedDate.isoDate)}
                onClick={handleReschedule}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Rescheduling Appointment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirm Reschedule to {selectedDate.dayLabel}, {selectedDate.month} {selectedDate.dayNum} ({selectedTime})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* CANCEL TAB */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/40 text-xs text-red-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Cancellation Policy Notice</span>
                </div>
                <p className="leading-relaxed">
                  Cancellations requested with at least 24 hours courtesy notice are processed at no charge. We appreciate your advance notice so our mobile grooming units can be rerouted.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63] block mb-2">
                  Please let us know the reason for cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/15 text-xs text-[#FAF0E2] focus:border-[#AA8B63] outline-none"
                >
                  <option value="Schedule conflict / Need to postpone">Schedule conflict / Need to postpone</option>
                  <option value="Pet is sick / Vet visit required">Pet is sick / Vet visit required</option>
                  <option value="Traveling / Away from home">Traveling / Away from home</option>
                  <option value="Personal / Family emergency">Personal / Family emergency</option>
                  <option value="Found alternative grooming service">Found alternative grooming service</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              {/* Offer Reschedule Alternative */}
              <div className="p-3 rounded-xl bg-[#1B1E15] border border-[#FAF0E2]/10 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#FAF0E2] block">Prefer to pick a new date?</span>
                  <span className="text-[#A4AA93] text-[11px]">Rescheduling is completely free anytime.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("reschedule")}
                  className="px-3 py-1.5 rounded-lg bg-[#AA8B63]/20 border border-[#AA8B63]/50 text-[#AA8B63] font-mono text-[10.5px] font-bold hover:bg-[#AA8B63] hover:text-[#161811] transition-all cursor-pointer shrink-0"
                >
                  Reschedule Instead →
                </button>
              </div>

              {/* Submit Cancel */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>Confirm Cancellation for {petName}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick Concierge Support Footer */}
          <div className="pt-2 border-t border-[#FAF0E2]/10 text-center space-y-1 text-[11px] text-[#A4AA93]">
            <p>
              Need immediate help? Call Concierge:{" "}
              <a href="tel:+14153755823" className="text-[#FAF0E2] font-bold underline">
                +1 (415) 375-5823
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
