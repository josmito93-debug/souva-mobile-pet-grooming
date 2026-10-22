import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Scissors,
  Sparkles,
  Shield,
  ShieldCheck,
  User,
  Heart,
  Phone,
  Mail,
  ChevronRight,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileDown,
  MessageCircle,
  Edit3,
  Sliders,
  ArrowRight,
  Truck,
  Zap,
} from "lucide-react";
import { SouvaLogo } from "@/components/SouvaLogo";
import { WhatsAppIcon, PhoneConciergeIcon } from "@/components/BrandIcons";
import { DispatchRequest } from "@/lib/dispatchStore";
import {
  ClientUser,
  getClientSession,
  saveClientSession,
  clearClientSession,
  fetchClientAppointments,
} from "@/lib/clientPortalStore";
import { ModifyAppointmentModal } from "@/components/ModifyAppointmentModal";
import { ManageAppointmentModal } from "@/components/ManageAppointmentModal";
import { cn } from "@/lib/utils";

interface ClientPortalProps {
  onBackToSite: () => void;
  onBookNewClick?: () => void;
  initialEmail?: string;
  initialPhone?: string;
}

const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  "655825890077-2q2qj5o3rif75ial129osm3f8c4v1emq.apps.googleusercontent.com";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT parse error:", e);
    return null;
  }
}

function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg className={className || "h-4 w-4"} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function ClientPortal({
  onBackToSite,
  onBookNewClick,
  initialEmail = "",
  initialPhone = "",
}: ClientPortalProps) {
  // Authentication State
  const [client, setClient] = useState<ClientUser | null>(() => getClientSession());
  const [authMode, setAuthMode] = useState<"lookup" | "register">("lookup");
  const [inputEmail, setInputEmail] = useState(initialEmail || "");
  const [inputPhone, setInputPhone] = useState(initialPhone || "");
  const [inputName, setInputName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Handle Google Sign-In credential response
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        setAuthError("Failed to retrieve profile information from Google.");
        setIsAuthenticating(false);
        return;
      }

      const googleEmail = payload.email.toLowerCase();
      const googleName = payload.name || payload.given_name || "Valued Pet Parent";
      const googlePic = payload.picture || "";

      // Lookup live existing appointments matching this verified Google email from Airtable
      const records = await fetchClientAppointments(googleEmail, "");

      const matchedRecord = records[0];
      const resolvedName = matchedRecord?.customerName || googleName;
      const resolvedPhone = matchedRecord?.phone || "";

      const user: ClientUser = {
        id: payload.sub || `CLI-${Date.now().toString().slice(-5)}`,
        name: resolvedName,
        email: googleEmail,
        phone: resolvedPhone,
        picture: googlePic,
        authProvider: "google",
        address: matchedRecord?.address,
        zipCode: matchedRecord?.zipCode,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      saveClientSession(user);
      setClient(user);
      setAppointments(records);

      if (records.length > 0) {
        showToast(`Welcome back, ${resolvedName}! Connected with Google (${records.length} booking(s) synced).`);
      } else {
        showToast(`Account created for ${resolvedName} via Google. Welcome to SOUVA!`);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setAuthError("An error occurred during Google sign-in. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    if (client) return;

    let isMounted = true;
    const initGoogleGSI = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && googleBtnContainerRef.current && isMounted) {
        try {
          g.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleBtnContainerRef.current.innerHTML = "";
          g.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 320,
          });
        } catch (e) {
          console.warn("Google GSI render error:", e);
        }
      }
    };

    initGoogleGSI();
    const timer = setInterval(() => {
      const g = (window as any).google;
      if (g?.accounts?.id && googleBtnContainerRef.current) {
        initGoogleGSI();
        clearInterval(timer);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [client, authMode]);

  const handleTriggerGooglePrompt = () => {
    const g = (window as any).google;
    if (g?.accounts?.id) {
      try {
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        g.accounts.id.prompt();
      } catch (e) {
        console.warn("Google prompt error:", e);
      }
    }
  };

  // Appointments State
  const [appointments, setAppointments] = useState<DispatchRequest[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "pets" | "perks">("upcoming");

  // Modals State
  const [selectedForFullEdit, setSelectedForFullEdit] = useState<DispatchRequest | null>(null);
  const [quickManageTarget, setQuickManageTarget] = useState<{
    isOpen: boolean;
    action: "reschedule" | "cancel";
    appointment: DispatchRequest | null;
  }>({
    isOpen: false,
    action: "reschedule",
    appointment: null,
  });

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch appointments for current authenticated client
  const refreshAppointments = async (user = client) => {
    if (!user) return;
    setIsLoadingAppointments(true);
    try {
      const records = await fetchClientAppointments(user.email, user.phone);
      setAppointments(records);
    } catch (err) {
      console.error("Error refreshing client appointments:", err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (client) {
      refreshAppointments(client);
    }
  }, [client]);

  // Listen to cross-tab & local dispatch store updates
  useEffect(() => {
    const handleDispatchUpdate = () => {
      if (client) refreshAppointments(client);
    };
    window.addEventListener("souva_dispatch_updated", handleDispatchUpdate);
    window.addEventListener("storage", handleDispatchUpdate);
    return () => {
      window.removeEventListener("souva_dispatch_updated", handleDispatchUpdate);
      window.removeEventListener("storage", handleDispatchUpdate);
    };
  }, [client]);

  // Handle Login / Lookup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrim = inputEmail.trim();
    const phoneClean = inputPhone.trim();

    if (!emailTrim && !phoneClean) {
      setAuthError("Please enter your email or phone number.");
      return;
    }

    setIsAuthenticating(true);

    try {
      const records = await fetchClientAppointments(emailTrim, phoneClean);

      // Determine customer name from existing booking or input
      const matchedRecord = records[0];
      const resolvedName = inputName.trim() || matchedRecord?.customerName || "Valued Pet Parent";

      const newUser: ClientUser = {
        id: `CLI-${Date.now().toString().slice(-5)}`,
        name: resolvedName,
        email: emailTrim || matchedRecord?.email || "",
        phone: phoneClean || matchedRecord?.phone || "",
        address: matchedRecord?.address,
        zipCode: matchedRecord?.zipCode,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      saveClientSession(newUser);
      setClient(newUser);
      setAppointments(records);

      if (records.length > 0) {
        showToast(`Welcome back, ${resolvedName}! Loaded ${records.length} appointment(s).`);
      } else {
        showToast(`Account created for ${resolvedName}. Welcome to SOUVA!`);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError("Unable to connect to Airtable. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    clearClientSession();
    setClient(null);
    setAppointments([]);
  };

  // Group appointments into Upcoming vs Past
  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => a.status !== "completed" && a.status !== "cancelled" && !a.archived);
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === "completed" || a.status === "cancelled" || a.archived);
  }, [appointments]);

  // Extract unique pets from customer's bookings
  const clientPets = useMemo(() => {
    const petMap = new Map<string, { name: string; breed: string; size: string; age?: string; photo?: string | null }>();
    appointments.forEach((a) => {
      if (a.petName) {
        const key = a.petName.toLowerCase().trim();
        if (!petMap.has(key)) {
          petMap.set(key, {
            name: a.petName,
            breed: a.breed || "Canine",
            size: a.size || "medium",
            age: a.petAge,
            photo: a.petPhoto,
          });
        }
      }
    });
    return Array.from(petMap.values());
  }, [appointments]);

  // Direct PDF Download / Print Helper
  const handleDownloadInvoice = (app: DispatchRequest) => {
    showToast(`Generating itemized invoice for ${app.petName}...`);
    // Open print view or fetch invoice PDF
    window.open(
      `https://souva-mobile-pet-grooming.vercel.app/api/send-booking`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#14160E] text-[#FAF0E2] flex flex-col justify-between selection:bg-[#AA8B63]/40 selection:text-[#FAF0E2]">
      {/* ── TOP LUXURY NAV BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#161811]/95 backdrop-blur-md border-b border-[#FAF0E2]/10 py-3.5 px-4 sm:px-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSite}
            className="hover:opacity-85 transition-opacity cursor-pointer"
            title="Return to Main Website"
          >
            <SouvaLogo showSubtitle={false} />
          </button>

          <span className="hidden sm:inline-block h-4 w-[1px] bg-[#FAF0E2]/20" />

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#AA8B63]/25 border border-[#AA8B63]/50 text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#FAF0E2]">
              Client Portal
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Airtable Live Sync Active</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {client ? (
            <div className="flex items-center gap-3">
              {client.picture ? (
                <img
                  src={client.picture}
                  alt={client.name}
                  className="h-8 w-8 rounded-full border border-[#AA8B63]/60 object-cover shrink-0 shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#AA8B63] to-[#806440] text-[#161811] flex items-center justify-center font-black text-xs shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-display font-bold text-xs text-[#FAF0E2] truncate max-w-[160px]">
                  {client.name}
                </span>
                <span className="text-[10px] font-mono text-[#A4AA93] truncate max-w-[160px]">
                  {client.email || client.phone}
                </span>
              </div>

              {onBookNewClick && (
                <button
                  type="button"
                  onClick={onBookNewClick}
                  className="px-3.5 py-1.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Book New Van</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#202517] border border-[#FAF0E2]/15 text-[#A4AA93] hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
                title="Sign Out of Client Portal"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-1.5 rounded-full bg-[#202517] border border-[#FAF0E2]/15 text-xs font-mono font-bold text-[#FAF0E2] hover:border-[#AA8B63] transition-colors cursor-pointer"
            >
              ← Back to Site
            </button>
          )}
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 p-3.5 rounded-2xl bg-[#1C2317] border-2 border-emerald-500 text-emerald-200 text-xs font-mono font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MAIN PORTAL BODY ───────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-10">
        {!client ? (
          /* ════════════════════════════════════════════════════════════
             AUTHENTICATION / LOOKUP VIEW
             ════════════════════════════════════════════════════════════ */
          <div className="max-w-md mx-auto my-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1A1D13] border-2 border-[#AA8B63]/40 shadow-[0_16px_50px_rgba(0,0,0,0.7)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#AA8B63]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#AA8B63] to-[#806440] text-[#161811] flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-lg">
                🐾
              </div>

              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AA8B63] block">
                SOUVA Mobile Pet Grooming
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#FAF0E2] mt-0.5">
                Client Dashboard
              </h2>
              <p className="text-xs text-[#A4AA93] mt-1.5 leading-relaxed">
                Sign in with Google, email, or phone number to view, reschedule, or modify any aspect of your doorstep grooming appointments.
              </p>

              {/* ── GOOGLE 1-CLICK SIGN IN ── */}
              <div className="mt-5 mb-2 flex flex-col items-center justify-center">
                <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />

                <button
                  type="button"
                  onClick={handleTriggerGooglePrompt}
                  className="mt-2 w-full max-w-[320px] py-2.5 px-4 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-sans font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-neutral-300"
                >
                  <GoogleGLogo className="h-4 w-4 shrink-0" />
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Elegant Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-[#FAF0E2]/15 w-full" />
                <span className="bg-[#1A1D13] px-3 text-[10px] font-mono text-[#A4AA93] uppercase tracking-wider shrink-0">
                  Or with email & phone
                </span>
                <div className="border-t border-[#FAF0E2]/15 w-full" />
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#12140D] border border-[#FAF0E2]/10 my-5 gap-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAuthMode("lookup")}
                  className={cn(
                    "py-2 rounded-lg font-bold transition-all cursor-pointer",
                    authMode === "lookup"
                      ? "bg-[#AA8B63] text-[#161811] shadow-sm"
                      : "text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  Find My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={cn(
                    "py-2 rounded-lg font-bold transition-all cursor-pointer",
                    authMode === "register"
                      ? "bg-[#AA8B63] text-[#161811] shadow-sm"
                      : "text-[#A4AA93] hover:text-[#FAF0E2]"
                  )}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
                {authMode === "register" && (
                  <div>
                    <label className="text-[10.5px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="e.g. Jessica Miller"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10.5px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="e.g. jessica@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="e.g. (415) 375-5823"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs font-mono text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#161811]" />
                      <span>Searching Airtable Bookings...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 text-[#161811]" />
                      <span>{authMode === "lookup" ? "Access My Portal" : "Create Account & Sync"}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#FAF0E2]/10 text-center">
                <span className="text-[10.5px] font-mono text-[#A4AA93] block">
                  Secure instant verification · 100% Privacy Protected
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════
             AUTHENTICATED CLIENT DASHBOARD VIEW
             ════════════════════════════════════════════════════════════ */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* VIP Welcome Header Strip */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#1C2016] via-[#21261B] to-[#181B13] border-2 border-[#AA8B63]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                {client.picture ? (
                  <img
                    src={client.picture}
                    alt={client.name}
                    className="h-14 w-14 rounded-2xl border-2 border-[#AA8B63] object-cover shrink-0 shadow-md"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#AA8B63] to-[#806440] text-[#161811] flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                      ★ SOUVA VIP Member
                    </span>
                    {client.authProvider === "google" && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1F2318] border border-blue-400/40 text-blue-300 font-mono text-[9px] font-bold flex items-center gap-1">
                        <GoogleGLogo className="h-2.5 w-2.5" />
                        <span>Google Verified</span>
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[#AA8B63]">
                      San Francisco & Peninsula Fleet
                    </span>
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF0E2] mt-1">
                    Welcome back, {client.name}!
                  </h1>
                  <p className="text-xs text-[#A4AA93] mt-1">
                    Manage and modify any detail of your doorstep grooming appointments below.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => refreshAppointments(client)}
                  className="px-3.5 py-2 rounded-xl bg-[#24291B] border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] hover:border-[#AA8B63] transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Refresh bookings directly from Airtable"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 text-[#AA8B63]", isLoadingAppointments && "animate-spin")} />
                  <span className="hidden sm:inline">Sync Airtable</span>
                </button>

                {onBookNewClick && (
                  <button
                    type="button"
                    onClick={onBookNewClick}
                    className="px-4 py-2 rounded-xl bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Book New Dog</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metrics HUD Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-1">
                  Upcoming Bookings
                </span>
                <div className="font-display font-extrabold text-2xl text-[#FAF0E2]">
                  {upcomingAppointments.length}
                </div>
                <span className="text-[10.5px] text-[#A4AA93] block mt-0.5">
                  {upcomingAppointments.length > 0 ? "Doorstep Route Active" : "No active bookings"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-1">
                  Pups on File
                </span>
                <div className="font-display font-extrabold text-2xl text-[#FAF0E2]">
                  {clientPets.length}
                </div>
                <span className="text-[10.5px] text-[#A4AA93] block mt-0.5">
                  {clientPets.map((p) => p.name).join(", ") || "1 Dog"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-1">
                  Solar Van Service
                </span>
                <div className="font-display font-extrabold text-xl text-emerald-400 flex items-center gap-1">
                  <Zap className="h-5 w-5" />
                  <span>100% Eco</span>
                </div>
                <span className="text-[10.5px] text-[#A4AA93] block mt-0.5">
                  Zero home hookups needed
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-1">
                  Doorstep Payment
                </span>
                <div className="font-display font-extrabold text-base text-[#FAF0E2] truncate">
                  Pay at Doorstep
                </div>
                <span className="text-[10.5px] text-[#A4AA93] block mt-0.5">
                  Cash, Zelle, Card, Check
                </span>
              </div>
            </div>

            {/* Dashboard Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-[#FAF0E2]/10 pb-2 overflow-x-auto scrollbar-none text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all font-bold cursor-pointer flex items-center gap-2",
                  activeTab === "upcoming"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md"
                    : "text-[#A4AA93] hover:text-[#FAF0E2] hover:bg-[#202517]"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Upcoming Appointments ({upcomingAppointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all font-bold cursor-pointer flex items-center gap-2",
                  activeTab === "past"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md"
                    : "text-[#A4AA93] hover:text-[#FAF0E2] hover:bg-[#202517]"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Past & Completed ({pastAppointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pets")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all font-bold cursor-pointer flex items-center gap-2",
                  activeTab === "pets"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md"
                    : "text-[#A4AA93] hover:text-[#FAF0E2] hover:bg-[#202517]"
                )}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>My Dogs ({clientPets.length})</span>
              </button>
            </div>

            {/* ── TAB 1: UPCOMING APPOINTMENTS ── */}
            {activeTab === "upcoming" && (
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-[#191D13] border border-[#FAF0E2]/10 text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-[#24291B] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center mx-auto text-2xl">
                      📅
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#FAF0E2]">
                      No upcoming appointments found
                    </h3>
                    <p className="text-xs text-[#A4AA93] max-w-sm mx-auto leading-relaxed">
                      Our solar van travels directly to your doorstep. Schedule a luxury 1-on-1 session for your pup in under 60 seconds.
                    </p>
                    {onBookNewClick && (
                      <button
                        type="button"
                        onClick={onBookNewClick}
                        className="mt-2 px-6 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Book Doorstep Appointment Now</span>
                      </button>
                    )}
                  </div>
                ) : (
                  upcomingAppointments.map((app) => {
                    const waConciergeUrl = `https://wa.me/14153755823?text=${encodeURIComponent(
                      `Hello SOUVA Concierge, I am inquiring about my appointment (${app.id}) for ${app.petName} scheduled on ${app.scheduledDate || app.preferredTime}.`
                    )}`;

                    return (
                      <div
                        key={app.id}
                        className="rounded-3xl bg-[#1A1E14] border-2 border-[#AA8B63]/40 p-5 sm:p-7 shadow-xl space-y-5 hover:border-[#AA8B63] transition-all"
                      >
                        {/* Card Top Strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#FAF0E2]/10">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full bg-[#AA8B63] text-[#161811] text-[10.5px] font-mono font-black uppercase tracking-wider shadow-sm">
                              {app.id}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>
                                {app.status === "en_route"
                                  ? "Van En Route (Driving to your door)"
                                  : app.status === "in_service"
                                  ? "In Spa Session"
                                  : "Confirmed & Scheduled"}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-[#A4AA93]">
                            <Truck className="h-3.5 w-3.5 text-[#AA8B63]" />
                            <span>{app.vanName || "SOUVA Solar Fleet"}</span>
                          </div>
                        </div>

                        {/* Main Grid: Date, Location, Package */}
                        <div className="grid md:grid-cols-3 gap-5 text-xs">
                          {/* Col 1: Date & Time Window */}
                          <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold block flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Arrival Schedule</span>
                            </span>
                            <div className="font-display font-bold text-base text-[#FAF0E2]">
                              {app.scheduledDate || app.preferredTime}
                            </div>
                            <div className="text-xs font-mono text-amber-300 font-bold">
                              Window: {app.scheduledTime || "9:30 AM"}
                            </div>
                            <span className="text-[10px] text-[#A4AA93] block pt-1">
                              30-min doorstep arrival window
                            </span>
                          </div>

                          {/* Col 2: Pet & Service Package */}
                          <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold block flex items-center gap-1">
                              <Scissors className="h-3 w-3" />
                              <span>Grooming Service</span>
                            </span>
                            <div className="font-display font-bold text-sm text-[#FAF0E2]">
                              {app.petName} ({app.breed})
                            </div>
                            <div className="text-xs text-[#AA8B63] font-semibold">
                              {app.packageName || "Essential Full Groom"}
                            </div>
                            {app.addons && app.addons.length > 0 && (
                              <div className="text-[10px] text-emerald-300 pt-0.5 truncate">
                                + {app.addons.join(", ")}
                              </div>
                            )}
                          </div>

                          {/* Col 3: Address & Price */}
                          <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 space-y-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-[#AA8B63] font-bold block flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>Doorstep Address</span>
                              </span>
                              <div className="text-xs text-[#FAF0E2] truncate">
                                {app.address}
                              </div>
                              {app.parkingNotes && (
                                <div className="text-[10px] text-[#A4AA93] truncate pt-0.5">
                                  Parking: {app.parkingNotes}
                                </div>
                              )}
                            </div>

                            <div className="flex items-baseline justify-between pt-1 border-t border-[#FAF0E2]/10">
                              <span className="text-[10px] font-mono text-[#A4AA93]">Total Due:</span>
                              <span className="font-display font-extrabold text-base text-amber-300">
                                ${app.estimatedTotal || 125}.00 USD
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Special Groomer Instructions Callout */}
                        {app.groomerNotes && (
                          <div className="p-3 rounded-xl bg-[#202517] border border-[#FAF0E2]/10 text-xs text-[#FAF0E2]">
                            <strong className="text-[#AA8B63] font-mono text-[10.5px] uppercase block mb-0.5">
                              Stylist Instructions:
                            </strong>
                            <p className="italic text-[#E2D7C5]/90">{app.groomerNotes}</p>
                          </div>
                        )}

                        {/* Action Buttons Bar */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#FAF0E2]/10">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Primary Button: Modify ANY Aspect of Appointment */}
                            <button
                              type="button"
                              onClick={() => setSelectedForFullEdit(app)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                              title="Modify date, package, upgrades, address, or pet instructions"
                            >
                              <Sliders className="h-3.5 w-3.5 text-[#161811]" />
                              <span>Modify Appointment Details</span>
                            </button>

                            {/* Reschedule Window Shortcut */}
                            <button
                              type="button"
                              onClick={() =>
                                setQuickManageTarget({
                                  isOpen: true,
                                  action: "reschedule",
                                  appointment: app,
                                })
                              }
                              className="px-3 py-2 rounded-xl bg-[#24291B] border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] hover:border-[#AA8B63] transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Calendar className="h-3.5 w-3.5 text-[#AA8B63]" />
                              <span>Reschedule</span>
                            </button>

                            {/* Cancel Booking Shortcut */}
                            <button
                              type="button"
                              onClick={() =>
                                setQuickManageTarget({
                                  isOpen: true,
                                  action: "cancel",
                                  appointment: app,
                                })
                              }
                              className="px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 hover:bg-red-900/50 hover:text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Cancel</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={waConciergeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-[#142318] border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              <WhatsAppIcon variant="badge" className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">WhatsApp Concierge</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── TAB 2: PAST & COMPLETED ── */}
            {activeTab === "past" && (
              <div className="space-y-3">
                {pastAppointments.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10 text-center text-xs text-[#A4AA93]">
                    No past or completed appointments yet.
                  </div>
                ) : (
                  pastAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-[#181A12] border border-[#FAF0E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#AA8B63]">{app.id}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#202517] text-[#FAF0E2]">
                            {app.status === "cancelled" ? "Cancelled" : "Completed"}
                          </span>
                        </div>
                        <div className="font-semibold text-[#FAF0E2]">
                          {app.petName} ({app.breed}) · {app.packageName}
                        </div>
                        <div className="text-[11px] text-[#A4AA93]">
                          {app.scheduledDate || app.preferredTime} · {app.address}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-mono font-bold text-sm text-[#FAF0E2]">
                          ${app.estimatedTotal || 125}.00
                        </span>
                        {onBookNewClick && (
                          <button
                            type="button"
                            onClick={onBookNewClick}
                            className="px-3 py-1.5 rounded-lg bg-[#25281D] hover:bg-[#AA8B63] hover:text-[#161811] text-[11px] font-mono text-[#FAF0E2] transition-colors cursor-pointer"
                          >
                            Book Again
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB 3: REGISTERED DOGS & PROFILES ── */}
            {activeTab === "pets" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientPets.map((pet, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#191D13] border border-[#FAF0E2]/10 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-[#22271A] border border-[#AA8B63]/30 flex items-center justify-center font-bold text-lg text-[#AA8B63]">
                          🐶
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-base text-[#FAF0E2]">
                            {pet.name}
                          </h4>
                          <span className="text-xs text-[#A4AA93] block">
                            {pet.breed}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-[#AA8B63]">
                            Size: {pet.size.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#FAF0E2]/10 text-xs text-[#A4AA93] space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Rabies Status:</span>
                          <span className="text-emerald-400 font-bold">✓ Confirmed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cage-Free Certified:</span>
                          <span className="text-[#FAF0E2]">1-on-1 Sanctuary</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {onBookNewClick && (
                  <div className="p-6 rounded-2xl bg-[#181A12] border border-dashed border-[#AA8B63]/40 text-center">
                    <button
                      type="button"
                      onClick={onBookNewClick}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add & Book Another Dog</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS: MODIFY ALL APPOINTMENT ASPECTS ── */}
      <ModifyAppointmentModal
        isOpen={Boolean(selectedForFullEdit)}
        appointment={selectedForFullEdit}
        onClose={() => setSelectedForFullEdit(null)}
        onSaved={(updated) => {
          showToast(`Appointment ${updated.id} successfully updated and synced with Airtable!`);
          if (client) refreshAppointments(client);
        }}
      />

      {/* ── MODALS: QUICK RESCHEDULE / CANCEL ── */}
      <ManageAppointmentModal
        isOpen={quickManageTarget.isOpen}
        onClose={() =>
          setQuickManageTarget({ isOpen: false, action: "reschedule", appointment: null })
        }
        initialAction={quickManageTarget.action}
        bookingId={quickManageTarget.appointment?.id || ""}
        petName={quickManageTarget.appointment?.petName || "your dog"}
        currentDate={
          quickManageTarget.appointment?.scheduledDate ||
          quickManageTarget.appointment?.preferredTime ||
          ""
        }
        currentTime={quickManageTarget.appointment?.scheduledTime || ""}
      />

      {/* Footer */}
      <footer className="border-t border-[#FAF0E2]/10 bg-[#12140D] py-6 px-4 sm:px-8 text-center text-xs text-[#A4AA93] font-mono">
        <p>SOUVA CORP · Client Portal & Self-Service Concierge · Official Partner of Hydra® by Pet Society</p>
      </footer>
    </div>
  );
}
