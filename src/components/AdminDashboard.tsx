import { useState, useEffect, useMemo } from "react";
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  Check,
  Search,
  MessageCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Plus,
  Minus,
  Lock,
  Mail,
  Calendar,
  CalendarDays,
  Folder,
  Archive,
  Ban,
  RotateCcw,
  Edit3,
  X,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
} from "lucide-react";
import {
  DispatchRequest,
  DispatchPet,
  RequestStatus,
  getStoredRequests,
  updateRequestETA,
  updateRequestStatus,
  rescheduleAppointment,
  cancelAppointment,
  restoreAppointment,
} from "@/lib/dispatchStore";
import { AdminMap } from "@/components/AdminMap";
import { SouvaLogo } from "@/components/SouvaLogo";
import { formatToIsoDate } from "@/lib/airtable";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "8:30 AM",
  "9:30 AM",
  "11:30 AM",
  "1:30 PM",
  "3:30 PM",
  "5:30 PM",
];

export function AdminDashboard({ onBackToSite }: { onBackToSite: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("souva_admin_auth") === "true";
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Active view: Operations HUD (List & Map) vs Calendar Schedule
  const [activeView, setActiveView] = useState<"operations" | "calendar">("operations");

  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);

  // Folder filter: "active" is the default main page. Completed and Cancelled are archived in their own folders.
  const [folderFilter, setFolderFilter] = useState<"active" | "completed" | "cancelled" | "all">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals for Rescheduling & Cancelling
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<DispatchRequest | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<DispatchRequest | null>(null);

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  const refreshData = () => {
    const data = getStoredRequests();
    setRequests(data);
    if (!selectedRequest && data.length > 0) {
      setSelectedRequest(data[0]);
    } else if (selectedRequest) {
      const found = data.find((r) => r.id === selectedRequest.id);
      if (found) setSelectedRequest(found);
    }
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener("souva_dispatch_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("souva_dispatch_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "8509" || pinInput === "1234") {
      sessionStorage.setItem("souva_admin_auth", "true");
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleEtaChange = (id: string, delta: number) => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;
    const newEta = Math.max(0, target.etaMinutes + delta);
    updateRequestETA(id, newEta);
    refreshData();
  };

  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    updateRequestStatus(id, newStatus);
    refreshData();

    if (newStatus === "completed") {
      showToast(`Appointment ${id} completed and archived to the Completed folder.`);
    } else if (newStatus === "cancelled") {
      showToast(`Appointment ${id} cancelled and archived.`);
    }

    if (newStatus === "en_route") {
      const targetReq = requests.find((r) => r.id === id);
      if (targetReq && targetReq.email) {
        handleSendArrivalEmail(targetReq, true);
      }
    }
  };

  const handleSendArrivalEmail = async (req: DispatchRequest, silent = false) => {
    if (!req.email) {
      if (!silent) alert("No email address registered for this customer.");
      return;
    }
    setSendingEmailId(req.id);
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: req.customerName,
          email: req.email,
          phone: req.phone,
          address: req.address,
          parkingNotes: req.parkingNotes || "",
          petName: req.petName,
          estimatedTotal: req.estimatedTotal || 125,
          scheduledTime: req.scheduledTime || req.preferredTime,
        }),
      });
      const data = await res.json();
      if (data.success && !silent) {
        showToast(`30-Minute Arrival Alert sent to ${req.email}!`);
      }
    } catch {
      if (!silent) alert("Error sending arrival reminder email.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleNotifyClientWhatsApp = (req: DispatchRequest) => {
    const cleanPhone = req.phone.replace(/[^0-9]/g, "");
    const message = `🚐 *ARRIVAL UPDATE - SOUVA MOBILE PET GROOMING* 🐾\n\nHello ${req.customerName}, here is an update regarding ${req.petName}'s appointment:\n\n⏱️ *Estimated Time of Arrival (ETA):* ${req.etaMinutes} minutes.\n🚐 *Assigned Unit:* ${req.vanName}\n📍 *Destination:* ${req.address}\n\nOur mobile stylist has prepared the warm ozonated water and organic botanical shampoo. See you shortly! ✨`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Open Reschedule Modal
  const openRescheduleModal = (req: DispatchRequest) => {
    setRescheduleTarget(req);
    setRescheduleModalOpen(true);
  };

  // Open Cancel Modal
  const openCancelModal = (req: DispatchRequest) => {
    setCancelTarget(req);
    setCancelModalOpen(true);
  };

  const activeCount = requests.filter(
    (r) =>
      ["pending", "assigned", "en_route", "arrived", "in_service"].includes(r.status) &&
      !r.archived &&
      r.status !== "completed" &&
      r.status !== "cancelled"
  ).length;

  const completedCount = requests.filter(
    (r) => r.status === "completed" || (r.archived && r.status !== "cancelled")
  ).length;

  const cancelledCount = requests.filter((r) => r.status === "cancelled").length;

  const filteredRequests = requests.filter((r) => {
    const isCompleted = r.status === "completed" || (r.archived && r.status !== "cancelled");
    const isCancelled = r.status === "cancelled";
    const isActive =
      ["pending", "assigned", "en_route", "arrived", "in_service"].includes(r.status) &&
      !r.archived &&
      !isCompleted &&
      !isCancelled;

    const matchesFolder =
      folderFilter === "active"
        ? isActive
        : folderFilter === "completed"
        ? isCompleted
        : folderFilter === "cancelled"
        ? isCancelled
        : true;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.customerName.toLowerCase().includes(q) ||
      r.petName.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.pets &&
        r.pets.some(
          (p) =>
            p.petName.toLowerCase().includes(q) ||
            p.breed.toLowerCase().includes(q) ||
            (p.packageName && p.packageName.toLowerCase().includes(q))
        ));

    return matchesFolder && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#14160F] text-[#FAF0E2] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#1C1F15] border border-[#FAF0E2]/15 shadow-2xl text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#AA8B63]/20 border border-[#AA8B63]/40 mx-auto flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[#AA8B63]" />
          </div>

          <h2 className="font-display text-2xl font-bold text-[#FAF0E2]">
            Owners & Dispatch Portal
          </h2>
          <p className="text-xs text-[#A4AA93] mt-1.5 mb-6">
            Administrative access to monitor active appointments, live fleet GPS radar, and manage customer schedules.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (8509)"
                className="w-full px-4 py-3.5 text-center font-mono text-lg tracking-[0.4em] bg-[#14160F] border border-[#FAF0E2]/20 rounded-2xl text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63]"
                autoFocus
              />
              {pinError && (
                <span className="text-[11px] text-red-400 font-mono block mt-2">
                  Incorrect PIN. Try 8509 or 1234.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#AA8B63] text-[#161811] font-bold text-xs font-mono tracking-wider uppercase cursor-pointer hover:bg-[#C4A67E] transition-colors shadow-lg"
            >
              Access Dashboard
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs text-[#A4AA93] hover:text-[#FAF0E2] transition-colors mt-4 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Website</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13150F] text-[#FAF0E2] flex flex-col relative">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#252C1D] border-2 border-[#AA8B63] text-[#FAF0E2] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Operations Header */}
      <header className="px-4 py-3 md:px-8 border-b border-[#FAF0E2]/10 bg-[#1A1D14] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <SouvaLogo showSubtitle={false} />
          <div className="hidden sm:flex flex-col border-l border-[#FAF0E2]/10 pl-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AA8B63]">
              BAY AREA FLEET DISPATCH HUD
            </span>
            <span className="text-xs font-bold text-[#FAF0E2]">
              SOUVA Operations & Schedule Management
            </span>
          </div>
        </div>

        {/* View Switcher: Operations HUD vs Calendar */}
        <div className="flex items-center p-1 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/15 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveView("operations")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeView === "operations"
                ? "bg-[#AA8B63] text-[#161811] shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>List & Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("calendar")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeView === "calendar"
                ? "bg-[#AA8B63] text-[#161811] shadow-md"
                : "text-[#A4AA93] hover:text-[#FAF0E2]"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Calendar Schedule</span>
          </button>
        </div>

        {/* Operations Badges & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
              <Truck className="h-4 w-4 text-[#AA8B63]" />
              <span>2 Solar Vans Active</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span>{activeCount} Active</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
              <Archive className="h-3.5 w-3.5 text-green-400" />
              <span>{completedCount} Archived</span>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshData}
            className="p-2 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10 hover:border-[#AA8B63] text-[#FAF0E2] cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onBackToSite}
            className="px-4 py-2 rounded-xl border border-[#FAF0E2]/15 bg-[#22261A] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Site</span>
          </button>
        </div>
      </header>

      {/* Main Content: Either Operations List + Map OR Full Calendar Schedule */}
      {activeView === "calendar" ? (
        <AdminCalendarScheduleView
          requests={requests}
          onSelectRequest={(r) => {
            setSelectedRequest(r);
            setActiveView("operations");
          }}
          onReschedule={openRescheduleModal}
          onCancel={openCancelModal}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
          {/* Left Side: Requests List & Live Controls */}
          <div className="lg:col-span-6 xl:col-span-5 border-r border-[#FAF0E2]/10 flex flex-col bg-[#161811] max-h-[calc(100vh-65px)] overflow-hidden">
            {/* Folder Organization Strip (Active vs Archived) */}
            <div className="p-3.5 border-b border-[#FAF0E2]/10 bg-[#1C1F15] space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A4AA93]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, dog name, address, or ID..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                />
              </div>

              {/* Folder Tabs: Completed appointments are archived in another folder! */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFolderFilter("active")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    folderFilter === "active"
                      ? "bg-[#AA8B63] text-[#161811] shadow-md font-black"
                      : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                  title="Main active appointments page (Queued, Assigned, En Route, In Service)"
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>Active Dispatches ({activeCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFolderFilter("completed")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    folderFilter === "completed"
                      ? "bg-green-700 text-white shadow-md font-black"
                      : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                  title="Archived completed appointments folder"
                >
                  <Archive className="h-3.5 w-3.5 text-green-400" />
                  <span>Archived: Completed ({completedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFolderFilter("cancelled")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    folderFilter === "cancelled"
                      ? "bg-red-800 text-white shadow-md font-black"
                      : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                  title="Archived cancelled appointments folder"
                >
                  <Ban className="h-3.5 w-3.5 text-red-400" />
                  <span>Cancelled ({cancelledCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFolderFilter("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    folderFilter === "all"
                      ? "bg-[#383C2C] text-[#FAF0E2] shadow-md"
                      : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  <span>All ({requests.length})</span>
                </button>
              </div>
            </div>

            {/* Request Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-[#A4AA93] space-y-2">
                  <Archive className="h-8 w-8 text-[#A4AA93]/40 mx-auto" />
                  <p className="text-sm font-bold font-display text-[#FAF0E2]">
                    No appointments in this folder
                  </p>
                  <span className="text-xs block max-w-xs mx-auto">
                    {folderFilter === "active"
                      ? "No currently active visits. New bookings from the public site will appear here."
                      : folderFilter === "completed"
                      ? "Completed appointments are archived here once marked finished."
                      : "No cancelled appointments recorded."}
                  </span>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  const isCompleted = req.status === "completed" || req.archived;
                  const isCancelled = req.status === "cancelled";
                  const hasMultiDogs = (req.pets && req.pets.length > 1) || (req.dogCount && req.dogCount > 1);

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none relative",
                        isSelected
                          ? "bg-[#22271A] border-[#AA8B63] shadow-lg ring-1 ring-[#AA8B63]/40"
                          : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                      )}
                    >
                      {/* Top status bar & ID */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#AA8B63]">
                            {req.id}
                          </span>
                          <span className="text-[10.5px] font-mono text-[#A4AA93] flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#AA8B63]" />
                            <span>{req.scheduledDate || req.preferredTime}</span>
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(req.id, e.target.value as RequestStatus)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "text-[10px] font-mono font-bold uppercase rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none",
                            req.status === "en_route"
                              ? "bg-[#AA8B63]/25 border-[#AA8B63] text-[#FAF0E2]"
                              : req.status === "completed"
                              ? "bg-green-950/60 border-green-500 text-green-300"
                              : req.status === "cancelled"
                              ? "bg-red-950/60 border-red-500 text-red-300"
                              : "bg-[#25281D] border-[#FAF0E2]/15 text-[#A4AA93]"
                          )}
                        >
                          <option value="pending">Queued</option>
                          <option value="assigned">Van Assigned</option>
                          <option value="en_route">En Route (Driving)</option>
                          <option value="arrived">At Doorstep</option>
                          <option value="in_service">In Spa Session</option>
                          <option value="completed">Completed (Archive)</option>
                          <option value="cancelled">Cancelled (Archive)</option>
                        </select>
                      </div>

                      {/* Pet & Client Overview */}
                      <div className="flex gap-3 items-start">
                        <div className="h-12 w-12 rounded-xl bg-[#14160F] border border-[#FAF0E2]/15 overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
                          {req.petPhoto ? (
                            <img
                              src={req.petPhoto}
                              alt={req.petName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🐾</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-sm text-[#FAF0E2] truncate">
                              {req.petName}
                            </h4>
                            {hasMultiDogs && (
                              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                                🐕🐕 2 Dogs
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#272B1E] text-[#AA8B63] uppercase">
                              {req.size}
                            </span>
                          </div>

                          <p className="text-xs text-[#A4AA93] truncate">
                            {req.breed} · Client: <strong className="text-[#FAF0E2]">{req.customerName}</strong>
                          </p>

                          <p className="text-[11px] text-[#A4AA93]/80 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[#AA8B63] shrink-0" />
                            <span>{req.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* ── MULTI-DOG BREAKDOWN (WHEN 2+ DOGS ARE BOOKED) ────── */}
                      {req.pets && req.pets.length > 1 && (
                        <div className="mt-3 pt-2.5 border-t border-[#FAF0E2]/10 space-y-1.5 bg-[#14160F]/60 p-2 rounded-xl">
                          <div className="text-[10px] font-mono text-[#AA8B63] font-bold uppercase tracking-wider flex items-center justify-between">
                            <span>🐕 Dog Breakdown ({req.pets.length} pups):</span>
                            <span className="text-emerald-400">20% Multi-Dog Applied</span>
                          </div>
                          {req.pets.map((p, pIdx) => (
                            <div
                              key={p.id || pIdx}
                              className="p-1.5 rounded-lg bg-[#1C1F15] border border-[#FAF0E2]/10 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs">🐾</span>
                                <div className="truncate">
                                  <strong className="text-[#FAF0E2]">{p.petName}</strong>
                                  <span className="text-[#A4AA93] text-[10px] ml-1.5">
                                    ({p.size} · {p.breed})
                                  </span>
                                  <span className="text-[#AA8B63] text-[10px] ml-1.5 font-mono">
                                    {p.packageName}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-xs font-bold text-[#FAF0E2] ml-2 shrink-0">
                                ${p.totalPrice || p.basePrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Archive Status Tags */}
                      {isCompleted && (
                        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-green-950/40 border border-green-500/30 text-green-300 text-[10.5px] font-mono flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-green-400" />
                            <span>Completed & Archived</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreAppointment(req.id, "pending");
                              showToast(`Appointment ${req.id} restored to Active.`);
                              refreshData();
                            }}
                            className="text-[#AA8B63] hover:underline font-bold cursor-pointer"
                          >
                            Unarchive / Restore
                          </button>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[10.5px] font-mono flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate">
                            <Ban className="h-3 w-3 text-red-400 shrink-0" />
                            <span className="truncate">Cancelled: {req.cancellationReason || "By client"}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreAppointment(req.id, "pending");
                              showToast(`Appointment ${req.id} restored to Active.`);
                              refreshData();
                            }}
                            className="text-[#AA8B63] hover:underline font-bold cursor-pointer shrink-0 ml-2"
                          >
                            Reopen
                          </button>
                        </div>
                      )}

                      {/* ACTION CONTROLS: RESCHEDULE, CANCEL, ETA & NOTIFICATIONS */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3.5 pt-3 border-t border-[#FAF0E2]/10 space-y-2.5"
                      >
                        {/* Live ETA adjustment */}
                        {!isCompleted && !isCancelled && (
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#A4AA93] uppercase font-bold">
                                Client ETA:
                              </span>
                              <span className="font-display font-bold text-base text-[#FAF0E2]">
                                {req.etaMinutes} min
                              </span>

                              <div className="flex items-center gap-1 border border-[#FAF0E2]/15 rounded-lg bg-[#14160F] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleEtaChange(req.id, -5)}
                                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#25281D] text-[#FAF0E2] cursor-pointer"
                                  title="-5 minutes"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEtaChange(req.id, 5)}
                                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#25281D] text-[#FAF0E2] cursor-pointer"
                                  title="+5 minutes"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleNotifyClientWhatsApp(req)}
                              className="px-2 py-1 rounded-lg bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] text-[10.5px] font-mono font-bold flex items-center gap-1 hover:bg-[#25D366] hover:text-[#071F10] transition-colors cursor-pointer"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        )}

                        {/* RESCHEDULE & CANCEL BUTTONS ROW */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#FAF0E2]/10">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(req)}
                              className="px-2.5 py-1 rounded-lg bg-[#252A1D] border border-[#AA8B63]/40 text-[#AA8B63] hover:bg-[#AA8B63] hover:text-[#161811] text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Reschedule appointment date & arrival window"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Cambiar Cita</span>
                            </button>

                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => openCancelModal(req)}
                                className="px-2.5 py-1 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 hover:bg-red-900/60 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Cancel and archive appointment"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Cancelar</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={sendingEmailId === req.id || !req.email}
                            onClick={() => handleSendArrivalEmail(req)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg border text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer",
                              req.email
                                ? "bg-[#AA8B63]/20 border-[#AA8B63]/50 text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811]"
                                : "bg-[#25281D] border-transparent text-[#A4AA93]/50 cursor-not-allowed"
                            )}
                            title={req.email ? `Send 30-min alert to ${req.email}` : "No email"}
                          >
                            <Mail className="h-3 w-3 text-[#AA8B63]" />
                            <span>{sendingEmailId === req.id ? "Sending..." : "Email Alert"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Map & Deep Request Inspector */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col p-4 md:p-6 bg-[#13150F] gap-4 max-h-[calc(100vh-65px)] overflow-y-auto">
            <div className="w-full h-[360px] lg:h-[400px] shrink-0">
              <AdminMap
                requests={requests}
                selectedRequest={selectedRequest}
                onSelectRequest={(r) => setSelectedRequest(r)}
              />
            </div>

            {selectedRequest && (
              <div className="p-5 rounded-3xl bg-[#1C1F15] border border-[#FAF0E2]/15 shadow-xl space-y-4">
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FAF0E2]/10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#14160F] border border-[#AA8B63]/40 overflow-hidden flex items-center justify-center">
                      {selectedRequest.petPhoto ? (
                        <img
                          src={selectedRequest.petPhoto}
                          alt={selectedRequest.petName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🐾</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-[#FAF0E2]">
                          {selectedRequest.petName}
                        </h3>
                        {selectedRequest.pets && selectedRequest.pets.length > 1 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                            🐕🐕 2 Dogs Scheduled
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#AA8B63] font-mono font-bold">
                        {selectedRequest.packageName}
                      </span>
                    </div>
                  </div>

                  {/* Top action shortcuts */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openRescheduleModal(selectedRequest)}
                      className="px-3 py-1.5 rounded-xl bg-[#252A1D] border border-[#AA8B63]/50 text-[#AA8B63] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Cambiar Cita</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCancelModal(selectedRequest)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/50 text-red-300 hover:bg-red-800 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Cancelar</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedRequest.address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#25281D] border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] hover:border-[#AA8B63] flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Maps</span>
                    </a>

                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold hover:bg-[#C4A67E] flex items-center gap-1.5"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Call Client</span>
                    </a>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                    <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                      Client & Phone
                    </span>
                    <strong className="text-[#FAF0E2] block">{selectedRequest.customerName}</strong>
                    <span className="text-[#AA8B63]">{selectedRequest.phone}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                    <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                      Scheduled Window
                    </span>
                    <strong className="text-[#FAF0E2] block">{selectedRequest.scheduledDate || selectedRequest.preferredTime}</strong>
                    <span className="text-[#AA8B63]">{selectedRequest.scheduledTime || selectedRequest.preferredTime}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                    <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                      Van & Estimate
                    </span>
                    <span className="text-[#FAF0E2] font-bold block">{selectedRequest.vanName}</span>
                    <span className="text-emerald-400 font-bold">
                      ${selectedRequest.estimatedTotal || 125} Total
                    </span>
                  </div>
                </div>

                {/* ── MULTI-DOG INDIVIDUAL BREAKDOWN CARDS IN INSPECTOR ────── */}
                {selectedRequest.pets && selectedRequest.pets.length > 1 ? (
                  <div className="p-4 rounded-2xl bg-[#14160F] border border-[#AA8B63]/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#FAF0E2]/10 pb-2">
                      <h4 className="font-display font-bold text-sm text-[#FAF0E2] flex items-center gap-2">
                        <span>🐕🐕</span>
                        <span>Individual Dogs Information ({selectedRequest.pets.length} Dogs)</span>
                      </h4>
                      <span className="text-[10.5px] font-mono text-emerald-400 font-bold">
                        Multi-Dog 20% Discount Applied
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedRequest.pets.map((pet, idx) => (
                        <div
                          key={pet.id || idx}
                          className="p-3.5 rounded-xl bg-[#1C2016] border border-[#FAF0E2]/15 space-y-2 text-xs font-mono shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#AA8B63] uppercase px-2 py-0.5 rounded bg-[#25281D] border border-[#AA8B63]/30">
                              Dog #{idx + 1}: {pet.petName} {idx === 1 ? "(20% OFF)" : ""}
                            </span>
                            <strong className="text-[#FAF0E2] text-sm">${pet.totalPrice}</strong>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-[#A4AA93]">Breed & Size:</span>
                              <span className="text-[#FAF0E2] font-semibold">{pet.breed} · {pet.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#A4AA93]">Age & Gender:</span>
                              <span className="text-[#FAF0E2]">{pet.petAge || "Adult"} · {pet.gender || "Unspecified"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#A4AA93]">Service:</span>
                              <span className="text-[#AA8B63] font-bold truncate max-w-[160px]">{pet.packageName}</span>
                            </div>
                            {pet.addons && pet.addons.length > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[#A4AA93]">Add-ons:</span>
                                <span className="text-[#FAF0E2] truncate max-w-[160px]">{pet.addons.join(", ")}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-[#A4AA93]">Vaccines:</span>
                              <span className={pet.vaccinated === "yes" ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                {pet.vaccinated === "yes" ? "✓ Up-to-date Rabies" : "Pending Verification"}
                              </span>
                            </div>
                            {pet.temperament && (
                              <div className="pt-1 border-t border-[#FAF0E2]/10 text-[10.5px] text-[#A4AA93]">
                                <strong className="text-[#FAF0E2]">Care:</strong> {pet.temperament}
                              </div>
                            )}
                            {pet.groomerNotes && (
                              <div className="text-[10.5px] text-[#A4AA93]">
                                <strong className="text-[#FAF0E2]">Notes:</strong> {pet.groomerNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Single Dog Details */
                  <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#A4AA93]">Breed & Size:</span>
                      <span className="text-[#FAF0E2] font-bold">
                        {selectedRequest.breed} · {selectedRequest.size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A4AA93]">Age & Vaccines:</span>
                      <span className="text-[#FAF0E2] font-bold">
                        {selectedRequest.petAge || "Adult"} · {selectedRequest.vaccinated === "yes" ? "Vaccinated" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A4AA93]">Care Condition:</span>
                      <span className="text-[#FAF0E2]">
                        {selectedRequest.medicalConditions || selectedRequest.temperament || "None / Healthy"}
                      </span>
                    </div>
                    {selectedRequest.addons.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#A4AA93]">Selected Add-ons:</span>
                        <span className="text-[#AA8B63]">{selectedRequest.addons.join(", ")}</span>
                      </div>
                    )}
                    {selectedRequest.notes && (
                      <div className="pt-2 border-t border-[#FAF0E2]/10 text-[11px] text-[#A4AA93]">
                        <strong className="text-[#FAF0E2]">Notes:</strong> {selectedRequest.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: RESCHEDULE APPOINTMENT (CAMBIAR CITA) ───────────── */}
      {rescheduleModalOpen && rescheduleTarget && (
        <RescheduleAppointmentModal
          request={rescheduleTarget}
          onClose={() => {
            setRescheduleModalOpen(false);
            setRescheduleTarget(null);
          }}
          onConfirm={(id, newDate, newTime, note) => {
            rescheduleAppointment(id, newDate, newTime, note);
            showToast(`Appointment ${id} successfully rescheduled to ${newDate} @ ${newTime}`);
            refreshData();
            setRescheduleModalOpen(false);
            setRescheduleTarget(null);
          }}
        />
      )}

      {/* ── MODAL: CANCEL APPOINTMENT (CANCELAR CITA) ────────────────── */}
      {cancelModalOpen && cancelTarget && (
        <CancelAppointmentModal
          request={cancelTarget}
          onClose={() => {
            setCancelModalOpen(false);
            setCancelTarget(null);
          }}
          onConfirm={(id, reason) => {
            cancelAppointment(id, reason);
            showToast(`Appointment ${id} has been cancelled and archived.`);
            refreshData();
            setCancelModalOpen(false);
            setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENT: FULL CALENDAR SCHEDULE VIEW                                  */
/* -------------------------------------------------------------------------- */
function AdminCalendarScheduleView({
  requests,
  onSelectRequest,
  onReschedule,
  onCancel,
  onStatusChange,
}: {
  requests: DispatchRequest[];
  onSelectRequest: (r: DispatchRequest) => void;
  onReschedule: (r: DispatchRequest) => void;
  onCancel: (r: DispatchRequest) => void;
  onStatusChange: (id: string, s: RequestStatus) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayIso, setSelectedDayIso] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayIso(today.toISOString().split("T")[0]);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prepend days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const iso = prevDate.toISOString().split("T")[0];
      days.push({ dayNum: d, iso, currentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const thisDate = new Date(year, month, d);
      const iso = thisDate.toISOString().split("T")[0];
      days.push({ dayNum: d, iso, currentMonth: true });
    }

    // Append days to complete 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const iso = nextDate.toISOString().split("T")[0];
      days.push({ dayNum: d, iso, currentMonth: false });
    }

    return days;
  }, [year, month]);

  // Appointments for selected day
  const dayAppointments = useMemo(() => {
    return requests.filter((r) => {
      const reqIso = r.scheduledDate ? formatToIsoDate(r.scheduledDate) : formatToIsoDate(r.preferredTime || "");
      return reqIso === selectedDayIso;
    });
  }, [requests, selectedDayIso]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-5 bg-[#13150F] overflow-y-auto">
      {/* Calendar Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#1C1F15] border border-[#FAF0E2]/15 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#22271A] border border-[#AA8B63]/40 flex items-center justify-center text-[#AA8B63]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-[#FAF0E2]">
              {monthNames[month]} {year}
            </h3>
            <span className="text-xs font-mono text-[#A4AA93]">
              Fleet Schedule & Mobile Dispatch Calendar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#14160F] border border-[#FAF0E2]/15 hover:border-[#AA8B63] text-[#FAF0E2] cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-2 rounded-xl bg-[#25281D] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer"
          >
            Today
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#14160F] border border-[#FAF0E2]/15 hover:border-[#AA8B63] text-[#FAF0E2] cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid & Day Inspector Split */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Month Calendar Grid (7 columns) */}
        <div className="lg:col-span-8 p-4 rounded-3xl bg-[#161811] border border-[#FAF0E2]/15 shadow-xl">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-[#AA8B63] uppercase pb-2 border-b border-[#FAF0E2]/10 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((d, i) => {
              const dayReqs = requests.filter((r) => {
                const rIso = r.scheduledDate ? formatToIsoDate(r.scheduledDate) : formatToIsoDate(r.preferredTime || "");
                return rIso === d.iso;
              });

              const isSelected = selectedDayIso === d.iso;
              const hasMultiDogDay = dayReqs.some(
                (r) => (r.pets && r.pets.length > 1) || (r.dogCount && r.dogCount > 1)
              );

              return (
                <div
                  key={d.iso + i}
                  onClick={() => setSelectedDayIso(d.iso)}
                  className={cn(
                    "min-h-[82px] sm:min-h-[96px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative",
                    !d.currentMonth
                      ? "opacity-35 bg-[#14160F]/40 border-stone-800"
                      : isSelected
                      ? "bg-[#242A1D] border-[#AA8B63] shadow-lg ring-1 ring-[#AA8B63]"
                      : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-mono font-bold",
                        isSelected ? "text-[#AA8B63] scale-110" : "text-[#FAF0E2]"
                      )}
                    >
                      {d.dayNum}
                    </span>

                    {dayReqs.length > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#AA8B63] text-[#161811] font-black">
                        {dayReqs.length}
                      </span>
                    )}
                  </div>

                  {/* Day Appointment Chips */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayReqs.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold truncate flex items-center gap-1",
                          r.status === "completed"
                            ? "bg-green-950/60 text-green-300 border border-green-500/30"
                            : r.status === "cancelled"
                            ? "bg-red-950/60 text-red-300 border border-red-500/30 line-through"
                            : "bg-[#25281D] text-[#FAF0E2] border border-[#FAF0E2]/10"
                        )}
                      >
                        <span className="truncate">{r.scheduledTime || r.preferredTime?.split(" ")[1] || "Visit"}: {r.petName}</span>
                      </div>
                    ))}
                    {dayReqs.length > 2 && (
                      <span className="text-[8px] font-mono text-[#AA8B63] block text-right font-bold">
                        +{dayReqs.length - 2} more
                      </span>
                    )}
                  </div>

                  {hasMultiDogDay && (
                    <div className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <span>🐕🐕 Multi-Dog</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Detail Inspector */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-[#161811] border border-[#FAF0E2]/15 shadow-xl flex flex-col max-h-[680px]">
          <div className="pb-3 border-b border-[#FAF0E2]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#AA8B63] block">
                Selected Day Schedule
              </span>
              <h4 className="font-display font-bold text-base text-[#FAF0E2]">
                {selectedDayIso}
              </h4>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#25281D] border border-[#FAF0E2]/10 text-[#FAF0E2]">
              {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
            {dayAppointments.length === 0 ? (
              <div className="text-center py-16 text-[#A4AA93] space-y-1">
                <Calendar className="h-8 w-8 text-[#A4AA93]/40 mx-auto" />
                <p className="text-xs font-bold text-[#FAF0E2]">No appointments scheduled for this date</p>
                <span className="text-[11px]">Select another day on the calendar grid to inspect appointments.</span>
              </div>
            ) : (
              dayAppointments.map((req) => {
                const hasMultiDogs = (req.pets && req.pets.length > 1) || (req.dogCount && req.dogCount > 1);

                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-[#1B1E15] border border-[#FAF0E2]/15 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#AA8B63]">
                        {req.id} · {req.scheduledTime || req.preferredTime}
                      </span>

                      <select
                        value={req.status}
                        onChange={(e) => onStatusChange(req.id, e.target.value as RequestStatus)}
                        className="text-[10px] font-mono font-bold uppercase rounded-lg px-2 py-0.5 bg-[#25281D] border border-[#FAF0E2]/15 text-[#FAF0E2]"
                      >
                        <option value="pending">Queued</option>
                        <option value="assigned">Assigned</option>
                        <option value="en_route">En Route</option>
                        <option value="arrived">Arrived</option>
                        <option value="in_service">In Service</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-display text-[#FAF0E2]">
                          {req.petName}
                        </strong>
                        {hasMultiDogs && (
                          <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                            🐕🐕 2 Dogs
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A4AA93]">
                        Client: <strong className="text-[#FAF0E2]">{req.customerName}</strong> ({req.phone})
                      </p>
                      <p className="text-[11px] text-[#A4AA93] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-[#AA8B63] shrink-0" />
                        <span>{req.address}</span>
                      </p>
                    </div>

                    {/* ── MULTI-DOG BREAKDOWN IN CALENDAR APPOINTMENT CARD ────── */}
                    {req.pets && req.pets.length > 1 && (
                      <div className="p-2.5 rounded-xl bg-[#14160F] border border-[#AA8B63]/40 space-y-1.5">
                        <span className="text-[9.5px] font-mono text-[#AA8B63] font-bold uppercase block">
                          Dogs in this Session:
                        </span>
                        {req.pets.map((p, pIdx) => (
                          <div
                            key={p.id || pIdx}
                            className="p-1.5 rounded-lg bg-[#1D2116] border border-[#FAF0E2]/10 flex items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="text-[#FAF0E2]">{p.petName}</strong>
                              <span className="text-[10px] text-[#A4AA93] ml-1">
                                ({p.size} · {p.breed})
                              </span>
                              <div className="text-[9.5px] text-[#AA8B63]">{p.packageName}</div>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#FAF0E2]">
                              ${p.totalPrice || p.basePrice}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons: Reschedule (Cambiar Cita) & Cancel (Cancelar) */}
                    <div className="pt-2 border-t border-[#FAF0E2]/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onReschedule(req)}
                          className="px-2.5 py-1 rounded-lg bg-[#252A1D] border border-[#AA8B63]/50 text-[#AA8B63] hover:bg-[#AA8B63] hover:text-[#161811] text-[10.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Cambiar Cita</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onCancel(req)}
                          className="px-2 py-1 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 hover:text-white text-[10.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Cancelar</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectRequest(req)}
                        className="text-[10.5px] font-mono text-[#FAF0E2]/80 hover:text-[#AA8B63] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Radar View</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MODAL: RESCHEDULE APPOINTMENT (CAMBIAR CITA)                               */
/* -------------------------------------------------------------------------- */
function RescheduleAppointmentModal({
  request,
  onClose,
  onConfirm,
}: {
  request: DispatchRequest;
  onClose: () => void;
  onConfirm: (id: string, newDate: string, newTime: string, notes?: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    return request.scheduledDate ? formatToIsoDate(request.scheduledDate) : new Date().toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    return request.scheduledTime || "9:30 AM";
  });
  const [rescheduleNotes, setRescheduleNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    onConfirm(request.id, selectedDate, selectedTime, rescheduleNotes.trim() || undefined);
  };

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#161811] border-2 border-[#AA8B63] rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF0E2]/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#AA8B63]/20 border border-[#AA8B63]/50 flex items-center justify-center text-[#AA8B63]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AA8B63] block">
                Appointment Modification
              </span>
              <h3 className="font-display font-bold text-lg text-[#FAF0E2]">
                Cambiar Cita · Reschedule Appointment
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#25281D] border border-[#FAF0E2]/15 flex items-center justify-center text-[#FAF0E2] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current appointment details card */}
        <div className="p-3.5 rounded-2xl bg-[#1C2016] border border-[#FAF0E2]/10 text-xs font-mono space-y-1">
          <div className="flex justify-between">
            <span className="text-[#A4AA93]">Client:</span>
            <strong className="text-[#FAF0E2]">{request.customerName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A4AA93]">Pet(s):</span>
            <strong className="text-[#AA8B63]">{request.petName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A4AA93]">Current Schedule:</span>
            <span className="text-red-300 font-bold">{request.scheduledDate || request.preferredTime} ({request.scheduledTime || request.preferredTime})</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Date Picker */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Select New Date
            </label>
            <input
              type="date"
              min={todayIso}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-xs font-mono font-bold text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63] cursor-pointer"
            />
          </div>

          {/* New Arrival Window */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Select New Arrival Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63] shadow-md font-black"
                        : "bg-[#1C2016] text-[#A4AA93] border-[#FAF0E2]/10 hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1">
              Stylist Note / Reason for Change (Optional)
            </label>
            <input
              type="text"
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
              placeholder="e.g. Client requested afternoon window due to morning meeting"
              className="w-full px-3 py-2 bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#25281D] hover:bg-[#333827] text-xs font-mono text-[#FAF0E2] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#AA8B63] hover:bg-[#C4A67E] text-xs font-mono font-bold text-[#161811] uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MODAL: CANCEL APPOINTMENT (CANCELAR CITA)                                   */
/* -------------------------------------------------------------------------- */
function CancelAppointmentModal({
  request,
  onClose,
  onConfirm,
}: {
  request: DispatchRequest;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [selectedReason, setSelectedReason] = useState("Client requested cancellation");
  const [customReason, setCustomReason] = useState("");

  const presetReasons = [
    "Client requested cancellation",
    "Pet illness or surgery",
    "Customer out of town",
    "Severe weather / Access limitation",
    "Other operational reason",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    onConfirm(request.id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#161811] border-2 border-red-500 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF0E2]/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 block">
                Appointment Cancellation
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Cancelar Cita
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#25281D] border border-[#FAF0E2]/15 flex items-center justify-center text-[#FAF0E2] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#FAF0E2]/90 leading-relaxed">
          Are you sure you want to cancel appointment <strong className="text-[#AA8B63]">{request.id}</strong> for{" "}
          <strong className="text-white">{request.petName}</strong> (Client: {request.customerName})?
        </p>

        <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 text-[11px] font-mono text-red-200 leading-snug">
          ⚠️ This will archive the appointment in the Cancelled folder and free up the arrival window slot on the public schedule.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-[#A4AA93] font-semibold uppercase tracking-wider block mb-1.5">
              Cancellation Reason
            </label>
            <div className="space-y-1.5">
              {presetReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={cn(
                    "w-full text-left p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer",
                    selectedReason === r
                      ? "bg-red-950/50 border-red-500 text-white font-bold"
                      : "bg-[#14160F] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Or type custom reason..."
              className="w-full px-3 py-2 bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#25281D] hover:bg-[#333827] text-xs font-mono text-[#FAF0E2] transition-colors cursor-pointer"
            >
              Keep Appointment
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
