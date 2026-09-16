import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  Check,
  AlertCircle,
  Shield,
  Search,
  MessageCircle,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  Lock,
  User,
  Heart,
} from "lucide-react";
import {
  DispatchRequest,
  RequestStatus,
  getStoredRequests,
  updateRequestETA,
  updateRequestStatus,
  deleteDispatchRequest,
} from "@/lib/dispatchStore";
import { AdminMap } from "@/components/AdminMap";
import { SouvaLogo } from "@/components/SouvaLogo";
import { cn } from "@/lib/utils";

export function AdminDashboard({ onBackToSite }: { onBackToSite: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("souva_admin_auth") === "true";
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    // Default owner PIN 8509 (from phone 850) or 1234
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

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    updateRequestStatus(id, newStatus);
    refreshData();
  };

  const handleNotifyClientWhatsApp = (req: DispatchRequest) => {
    const cleanPhone = req.phone.replace(/[^0-9]/g, "");
    const message = `🚐 *ACTUALIZACIÓN DE LLEGADA - SOUVA MOBILE PET GROOMING* 🐾

Hola ${req.customerName}, te informamos sobre el servicio para *${req.petName}*:

⏱️ *Tiempo estimado de llegada (ETA):* ${req.etaMinutes} minutos.
🚐 *Unidad asignada:* ${req.vanName}
📍 *Destino:* ${req.address}

Nuestro estilista canino está preparando el agua tibia ozonizada y los champús botánicos para consentir a ${req.petName}. ¡Nos vemos en breve! ✨`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesFilter =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? ["pending", "assigned", "en_route", "in_service"].includes(r.status)
        : r.status === "completed";

    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Calculate Metrics
  const activeCount = requests.filter((r) =>
    ["pending", "assigned", "en_route", "in_service"].includes(r.status)
  ).length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  // PIN Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#14160F] text-[#FAF0E2] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#1C1F15] border border-[#FAF0E2]/15 shadow-2xl text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#AA8B63]/20 border border-[#AA8B63]/40 mx-auto flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[#AA8B63]" />
          </div>

          <h2 className="font-display text-2xl font-bold text-[#FAF0E2]">
            Portal de Dueños & Despacho
          </h2>
          <p className="text-xs text-[#A4AA93] mt-1.5 mb-6">
            Acceso administrativo para monitorear citas, ver ubicación en mapa y actualizar el ETA de los clientes.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa tu PIN (8509)"
                className="w-full px-4 py-3.5 text-center font-mono text-lg tracking-[0.4em] bg-[#14160F] border border-[#FAF0E2]/20 rounded-2xl text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63]"
                autoFocus
              />
              {pinError && (
                <span className="text-[11px] text-red-400 font-mono block mt-2">
                  PIN incorrecto. Prueba con 8509 o 1234.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#AA8B63] text-[#161811] font-bold text-xs font-mono tracking-wider uppercase cursor-pointer hover:bg-[#C4A67E] transition-colors shadow-lg"
            >
              Ingresar al Panel
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs text-[#A4AA93] hover:text-[#FAF0E2] transition-colors mt-4 flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la Web Principal</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13150F] text-[#FAF0E2] flex flex-col">
      {/* Top Operations Header */}
      <header className="px-4 py-3.5 md:px-8 border-b border-[#FAF0E2]/10 bg-[#1A1D14] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <SouvaLogo showSubtitle={false} />
          <div className="hidden sm:flex flex-col border-l border-[#FAF0E2]/10 pl-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AA8B63]">
              DISPATCH & OPERATIONS HUD
            </span>
            <span className="text-xs font-bold text-[#FAF0E2]">
              Centro de Control de Flota SOUVA
            </span>
          </div>
        </div>

        {/* Quick HUD Metrics */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
            <Truck className="h-4 w-4 text-[#AA8B63]" />
            <span>2 Vans en Servicio</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>{activeCount} Activas</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10">
            <Check className="h-4 w-4 text-green-400" />
            <span>{completedCount} Completadas</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshData}
            className="p-2 rounded-xl bg-[#22261A] border border-[#FAF0E2]/10 hover:border-[#AA8B63] text-[#FAF0E2] cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onBackToSite}
            className="px-4 py-2 rounded-xl border border-[#FAF0E2]/15 bg-[#22261A] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Web</span>
          </button>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Requests List & Live Controls */}
        <div className="lg:col-span-6 xl:col-span-5 border-r border-[#FAF0E2]/10 flex flex-col bg-[#161811] max-h-[calc(100vh-65px)] overflow-hidden">
          {/* Filters & Search Bar */}
          <div className="p-4 border-b border-[#FAF0E2]/10 space-y-3 bg-[#1C1F15]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A4AA93]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, perro, ID o dirección..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer",
                  statusFilter === "all"
                    ? "bg-[#AA8B63] text-[#161811]"
                    : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                Todas ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer",
                  statusFilter === "active"
                    ? "bg-[#AA8B63] text-[#161811]"
                    : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                En Ruta / Activas ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer",
                  statusFilter === "completed"
                    ? "bg-[#AA8B63] text-[#161811]"
                    : "bg-[#25281D] text-[#A4AA93] hover:text-[#FAF0E2]"
                )}
              >
                Completadas ({completedCount})
              </button>
            </div>
          </div>

          {/* Request Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-[#A4AA93]">
                <p className="text-sm font-bold font-display text-[#FAF0E2]">
                  No hay solicitudes en este filtro
                </p>
                <span className="text-xs">
                  Cualquier reserva hecha en la web aparecerá aquí automáticamente.
                </span>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none relative",
                      isSelected
                        ? "bg-[#22271A] border-[#AA8B63] shadow-lg"
                        : "bg-[#1B1E15] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40"
                    )}
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#AA8B63]">
                          {req.id}
                        </span>
                        <span className="text-[10.5px] font-mono text-[#A4AA93]">
                          {req.preferredTime}
                        </span>
                      </div>

                      {/* Status Selector */}
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
                            ? "bg-green-950/40 border-green-500 text-green-300"
                            : "bg-[#25281D] border-[#FAF0E2]/15 text-[#A4AA93]"
                        )}
                      >
                        <option value="pending">En Espera</option>
                        <option value="assigned">Van Asignada</option>
                        <option value="en_route">En Tránsito (En Camino)</option>
                        <option value="arrived">En la Puerta</option>
                        <option value="in_service">En Spa</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    {/* Pet & Owner Info */}
                    <div className="flex gap-3 items-center">
                      <div className="h-12 w-12 rounded-xl bg-[#14160F] border border-[#FAF0E2]/15 overflow-hidden flex items-center justify-center shrink-0">
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
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#272B1E] text-[#AA8B63] uppercase">
                            {req.size}
                          </span>
                        </div>
                        <p className="text-xs text-[#A4AA93] truncate">
                          {req.breed} · Tutor: {req.customerName}
                        </p>
                        <p className="text-[11px] text-[#A4AA93]/80 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#AA8B63] shrink-0" />
                          <span>{req.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* LIVE ETA CONTROL ROW */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3.5 pt-3 border-t border-[#FAF0E2]/10 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#A4AA93] uppercase font-bold">
                          ETA Cliente:
                        </span>
                        <span className="font-display font-bold text-base text-[#FAF0E2]">
                          {req.etaMinutes} min
                        </span>

                        {/* Increment / Decrement Buttons */}
                        <div className="flex items-center gap-1 border border-[#FAF0E2]/15 rounded-lg bg-[#14160F] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleEtaChange(req.id, -5)}
                            className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#25281D] text-[#FAF0E2] cursor-pointer"
                            title="-5 minutos"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEtaChange(req.id, 5)}
                            className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#25281D] text-[#FAF0E2] cursor-pointer"
                            title="+5 minutos"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp Notify Button */}
                      <button
                        type="button"
                        onClick={() => handleNotifyClientWhatsApp(req)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] text-[11px] font-mono font-bold flex items-center gap-1.5 hover:bg-[#25D366] hover:text-[#071F10] transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Avisar ETA por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Map & Deep Request Inspector */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col p-4 md:p-6 bg-[#13150F] gap-4 max-h-[calc(100vh-65px)] overflow-y-auto">
          {/* The Leaflet OpenStreetMap */}
          <div className="w-full h-[400px] lg:h-[460px] shrink-0">
            <AdminMap
              requests={requests}
              selectedRequest={selectedRequest}
              onSelectRequest={(r) => setSelectedRequest(r)}
            />
          </div>

          {/* Selected Request Deep Inspector Card */}
          {selectedRequest && (
            <div className="p-5 rounded-3xl bg-[#1C1F15] border border-[#FAF0E2]/15 shadow-xl">
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
                    <h3 className="font-display font-bold text-lg text-[#FAF0E2]">
                      {selectedRequest.petName} · {selectedRequest.breed}
                    </h3>
                    <span className="text-xs text-[#AA8B63] font-mono font-bold">
                      {selectedRequest.packageName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      selectedRequest.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#25281D] border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] hover:border-[#AA8B63] flex items-center gap-1.5"
                  >
                    <span>Abrir GPS / Waze</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <a
                    href={`tel:${selectedRequest.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold hover:bg-[#C4A67E] flex items-center gap-1.5"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Llamar</span>
                  </a>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid sm:grid-cols-3 gap-3.5 my-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                  <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                    Cliente & Teléfono
                  </span>
                  <strong className="text-[#FAF0E2] block">{selectedRequest.customerName}</strong>
                  <span className="text-[#AA8B63]">{selectedRequest.phone}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                  <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                    Dirección de Entrega
                  </span>
                  <span className="text-[#FAF0E2] line-clamp-2">{selectedRequest.address}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10">
                  <span className="text-[10px] text-[#A4AA93] uppercase block mb-1">
                    Van Asignada
                  </span>
                  <span className="text-[#FAF0E2] font-bold block">{selectedRequest.vanName}</span>
                  <span className="text-[#AA8B63]">ETA: {selectedRequest.etaMinutes} min</span>
                </div>
              </div>

              {/* Service details and notes */}
              <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#A4AA93]">Condición del Manto:</span>
                  <span className="text-[#FAF0E2] font-bold">{selectedRequest.coatCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A4AA93]">Temperamento:</span>
                  <span className="text-[#FAF0E2]">{selectedRequest.temperament}</span>
                </div>
                {selectedRequest.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#A4AA93]">Mimos Extra (Add-ons):</span>
                    <span className="text-[#AA8B63]">{selectedRequest.addons.join(", ")}</span>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div className="pt-2 border-t border-[#FAF0E2]/10 text-[11px] text-[#A4AA93]">
                    <strong className="text-[#FAF0E2]">Nota:</strong> {selectedRequest.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
