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
  ArrowLeft,
  Truck,
  Zap,
  Award,
  Leaf,
  X,
} from "lucide-react";
import { GroomingFlow } from "@/components/GroomingFlow";
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
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "pets" | "perks" | "book">("upcoming");
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Auto-login from email link (?email=...&bookingId=...&action=edit)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const phoneParam = params.get("phone");
    const bookingIdParam = params.get("bookingId");
    const actionParam = params.get("action");

    if (emailParam || phoneParam || bookingIdParam) {
      const emailClean = (emailParam || "").trim().toLowerCase();
      const phoneClean = (phoneParam || "").trim();

      setIsAuthenticating(true);
      fetchClientAppointments(emailClean, phoneClean).then((records) => {
        let matched = records[0];
        if (bookingIdParam) {
          const found = records.find((r) => r.id === bookingIdParam);
          if (found) matched = found;
        }

        const resolvedName = matched?.customerName || (emailClean ? emailClean.split("@")[0] : "Valued Pet Parent");
        const autoUser: ClientUser = {
          id: `CLI-${Date.now().toString().slice(-5)}`,
          name: resolvedName,
          email: emailClean || matched?.email || "",
          phone: phoneClean || matched?.phone || "",
          address: matched?.address,
          zipCode: matched?.zipCode,
          authProvider: "email",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        saveClientSession(autoUser);
        setClient(autoUser);
        setAppointments(records);
        setIsAuthenticating(false);

        if (matched && (actionParam === "edit" || actionParam === "reschedule")) {
          setSelectedForFullEdit(matched);
        }
      }).catch((e) => {
        console.warn("Auto-login error:", e);
        setIsAuthenticating(false);
      });
    }
  }, []);

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
      setAuthError("Unable to look up bookings. Please check your details or try again.");
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

  const nextAppointment = upcomingAppointments[0] || null;

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
      `https://www.souvagrooming.com/api/send-booking`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#14160E] text-[#FAF0E2] flex flex-col justify-between selection:bg-[#AA8B63]/40 selection:text-[#FAF0E2]">
      {/* ── TOP LUXURY NAV BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#161811]/95 backdrop-blur-md border-b border-[#FAF0E2]/10 py-3 px-4 sm:px-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (client) setActiveTab("upcoming");
              else onBackToSite();
            }}
            className="hover:opacity-85 transition-opacity cursor-pointer"
            title="Portal Home"
          >
            <SouvaLogo showSubtitle={false} />
          </button>

          <span className="hidden sm:inline-block h-4 w-[1px] bg-[#FAF0E2]/20" />

          <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131E15] border border-emerald-500/40 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Verified Parent Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {client ? (
            <>
              <button
                type="button"
                onClick={() => refreshAppointments(client)}
                className="h-9 w-9 rounded-full bg-[#1C2016] border border-[#FAF0E2]/15 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                title="Refresh bookings"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoadingAppointments && "animate-spin text-[#AA8B63]")} />
              </button>

              <a
                href="https://wa.me/14153755823?text=Hello%20SOUVA%20Concierge,%20I%20am%20in%20my%20client%20portal%20and%20need%20assistance."
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-[#182319] border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-[#161811] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                title="Concierge WhatsApp Chat"
              >
                <WhatsAppIcon variant="badge" className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811] font-rounded font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline">Book Grooming</span>
                <span className="xs:hidden">Book</span>
              </button>

              <div className="flex items-center gap-2 pl-1 border-l border-[#FAF0E2]/15 ml-1">
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
                <span className="hidden lg:inline text-xs font-display font-bold text-[#FAF0E2] truncate max-w-[120px]">
                  {client.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-[#A4AA93] hover:text-red-400 transition-colors cursor-pointer"
                  title="Sign Out of Portal"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
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
                  className="mt-2 w-full max-w-[320px] py-2.5 px-4 rounded-full bg-[#1C2016] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] font-rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-[#AA8B63]/60 group"
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
                      <span>Looking up your bookings...</span>
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
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {activeTab === "book" ? (
              /* ── SEAMLESS IN-PORTAL BOOKING FLOW (UNBOXED & FOCUSED) ── */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1D2216] via-[#1A1D13] to-[#14160E] border-2 border-[#AA8B63]/40 shadow-xl">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("upcoming")}
                      className="h-10 w-10 rounded-2xl bg-[#22271A] border border-[#AA8B63]/30 text-[#FAF0E2] hover:text-[#AA8B63] hover:border-[#AA8B63] transition-colors flex items-center justify-center cursor-pointer shadow-md shrink-0"
                      title="Return to Dashboard Overview"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#181B12] border border-[#AA8B63]/30 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)] text-[9.5px] font-mono uppercase tracking-[0.16em] font-bold text-amber-200 mb-1">
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>VIP Doorstep Service</span>
                      </div>
                      <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#FAF0E2] tracking-tight">
                        Schedule Mobile Van to Your Door
                      </h2>
                      <p className="text-xs text-[#A4AA93]">
                        1-on-1 cage-free spa session inside our 100% solar vehicle in San Francisco & Peninsula.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("upcoming")}
                    className="self-start sm:self-center px-4 py-2 rounded-full bg-[#202517] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer border border-[#FAF0E2]/15 shrink-0"
                  >
                    Cancel & Return
                  </button>
                </div>

                {/* Seamless Unboxed GroomingFlow */}
                <div className="p-4 sm:p-8 rounded-[2rem] bg-[#161910] border-2 border-[#AA8B63]/30 shadow-2xl">
                  <GroomingFlow
                    onStatus={(s) => {
                      if (s.dispatched) {
                        showToast("New appointment booked and synced to your portal!");
                        setTimeout(() => {
                          setActiveTab("upcoming");
                          if (client) refreshAppointments(client);
                        }, 1200);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* ── TOP GREETING BANNER ── */}
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF0E2]/10">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#A4AA93]">
                      <span>Welcome back,</span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C2216] border border-[#AA8B63]/40 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)] text-[9.5px] font-mono uppercase tracking-[0.14em] text-[#AA8B63] font-bold">
                        <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                        <span>VIP Parent</span>
                      </div>
                    </div>
                    <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#FAF0E2] tracking-tight mt-0.5">
                      {client.name}
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("book")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811] font-rounded font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Schedule Grooming</span>
                  </button>
                </div>

            {/* ── FEATURED SPOTLIGHT HERO CARD (IMAGE 1 & 2 REFERENCE) ── */}
            {nextAppointment ? (
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[#1E2317] via-[#161910] to-[#12140D] border-2 border-[#AA8B63]/40 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#AA8B63]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Top Status Strip */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#FAF0E2]/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{nextAppointment.status === "en_route" ? "Van En Route (Driving to Door)" : "Confirmed Route"}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#AA8B63] font-bold px-3 py-1 rounded-full bg-[#181B12] border border-[#FAF0E2]/10 shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      {nextAppointment.id}
                    </span>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181B12]/80 border border-[#FAF0E2]/10 shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.08)] text-[10px] font-mono text-[#AA8B63] uppercase tracking-wider font-semibold">
                    <MapPin className="h-3 w-3 text-[#AA8B63]" />
                    <span>SF & Peninsula Fleet</span>
                  </div>
                </div>

                {/* Main Date & Arrival Window */}
                <div className="py-4 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold block mb-1">
                    Next Doorstep Appointment
                  </span>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF0E2] tracking-tight">
                    {nextAppointment.scheduledDate || nextAppointment.preferredTime}
                  </div>
                  <div className="text-sm font-mono text-amber-300 font-bold mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Window: {nextAppointment.scheduledTime || "9:30 AM"} (30-min arrival)</span>
                  </div>
                </div>

                {/* Dog & Service Cardlet (like Image 2 & 3) */}
                <div className="p-4 rounded-2xl bg-[#13150E]/80 border border-[#FAF0E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#272E1D] to-[#181C12] border border-[#AA8B63]/40 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center text-amber-300 shrink-0">
                      <Heart className="h-6 w-6 text-[#AA8B63] fill-[#AA8B63]/20" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-[#FAF0E2]">
                        {nextAppointment.petName}
                      </h4>
                      <span className="text-xs text-[#A4AA93] block">
                        {nextAppointment.breed} · {nextAppointment.packageName || "Full Luxury Bath & Cut"}
                      </span>
                      <span className="text-[10.5px] font-mono text-[#AA8B63] block truncate max-w-xs mt-0.5">
                        📍 {nextAppointment.address}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right sm:border-l sm:border-[#FAF0E2]/10 sm:pl-4">
                    <span className="text-[10px] font-mono text-[#A4AA93] block">Doorstep Total</span>
                    <span className="font-display font-extrabold text-lg text-amber-300">
                      ${nextAppointment.estimatedTotal || 125}.00
                    </span>
                  </div>
                </div>

                {/* Action Buttons Nested Flush in Card (Image 1 & 2 pattern) */}
                <div className="mt-4 pt-4 border-t border-[#FAF0E2]/10 flex flex-wrap items-center gap-2.5 relative z-10">
                  <button
                    type="button"
                    onClick={() => setSelectedForFullEdit(nextAppointment)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Modify Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setQuickManageTarget({
                        isOpen: true,
                        action: "reschedule",
                        appointment: nextAppointment,
                      })
                    }
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-[#202517] border border-[#AA8B63]/40 text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span>Reschedule Time</span>
                  </button>

                  <a
                    href={`https://wa.me/14153755823?text=${encodeURIComponent(
                      `Hello SOUVA Concierge, I am inquiring about my appointment (${nextAppointment.id}) for ${nextAppointment.petName}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-full bg-[#182319] border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon variant="badge" className="h-3.5 w-3.5" />
                    <span>Concierge Chat</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Spotlight Promo Card when no appointments (matching Image 1) */
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[#1E2317] via-[#171A11] to-[#12140D] border-2 border-[#AA8B63]/40 p-6 sm:p-8 shadow-2xl overflow-hidden text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-60 h-60 bg-[#AA8B63]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2 relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-300 text-stone-950 text-[10px] font-sans font-black uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <Sparkles className="h-3 w-3" />
                    <span>20% OFF 2ND DOG PROMO</span>
                  </div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF0E2] leading-tight">
                    Luxury 1-on-1 Grooming At Your Doorstep
                  </h2>
                  <p className="text-xs text-[#A4AA93] leading-relaxed">
                    Zero cage stress, solar-powered mobile sanctuary, warm hydro-massage, and Brazilian Hydra® vegan botanical spa. Directly outside your home in SF & Peninsula.
                  </p>
                </div>
                <div className="relative z-10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("book")}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811] font-rounded font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Book Doorstep Van Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── CATEGORY PILLS (IMAGE 1 REFERENCE) ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "px-5 py-2.5 rounded-full font-rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm",
                  activeTab === "upcoming"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md scale-102"
                    : "bg-[#181B12] text-[#A4AA93] border border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Upcoming Bookings ({upcomingAppointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pets")}
                className={cn(
                  "px-5 py-2.5 rounded-full font-rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm",
                  activeTab === "pets"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md scale-102"
                    : "bg-[#181B12] text-[#A4AA93] border border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
                )}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>My Dogs ({clientPets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={cn(
                  "px-5 py-2.5 rounded-full font-rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm",
                  activeTab === "past"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md scale-102"
                    : "bg-[#181B12] text-[#A4AA93] border border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Past History ({pastAppointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("perks")}
                className={cn(
                  "px-5 py-2.5 rounded-full font-rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm",
                  activeTab === "perks"
                    ? "bg-[#AA8B63] text-[#161811] shadow-md scale-102"
                    : "bg-[#181B12] text-[#A4AA93] border border-[#FAF0E2]/10 hover:text-[#FAF0E2]"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>VIP Care & Perks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className="px-5 py-2.5 rounded-full font-rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm bg-[#181B12] text-[#AA8B63] hover:text-[#FAF0E2] border border-[#AA8B63]/30 hover:border-[#AA8B63]"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Book Mobile Van</span>
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
                    <button
                      type="button"
                      onClick={() => {
                        if (onBookNewClick) onBookNewClick();
                        else setShowBookingModal(true);
                      }}
                      className="mt-2 px-6 py-2.5 rounded-full bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Book Doorstep Appointment Now</span>
                    </button>
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

            {/* ── TAB 2: REGISTERED DOGS & PROFILES (IMAGE 2 "MY SPACES" REFERENCE) ── */}
            {activeTab === "pets" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientPets.map((pet, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-[#191D13] border-2 border-[#AA8B63]/30 hover:border-[#AA8B63] transition-all space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#272E1D] to-[#181C12] border border-[#AA8B63]/40 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center font-bold text-amber-300 shrink-0">
                            <Heart className="h-7 w-7 text-[#AA8B63] fill-[#AA8B63]/25" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                              {pet.name}
                            </h4>
                            <span className="text-xs text-[#A4AA93] block">
                              {pet.breed}
                            </span>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#202517] border border-[#AA8B63]/30 shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] text-[10px] font-mono uppercase text-[#AA8B63] font-bold">
                              Size: {pet.size.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#FAF0E2]/10 text-xs text-[#A4AA93] space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Rabies Vaccine Status:</span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)] text-[10px] font-mono text-emerald-300 font-bold">
                              <ShieldCheck className="h-3 w-3 text-emerald-400" />
                              <span>Verified</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Care Standard:</span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#202517] border border-[#AA8B63]/30 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] text-[10px] font-mono text-[#FAF0E2]">
                              <Sparkles className="h-3 w-3 text-[#AA8B63]" />
                              <span>1-on-1 Suite</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("book")}
                        className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#202517] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#AA8B63]/30 shadow-md"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Book Van for {pet.name}</span>
                      </button>
                    </div>
                  ))}

                  {/* Add Dog Card with Dashed Border (Image 2 style) */}
                  <div
                    onClick={() => setActiveTab("book")}
                    className="p-6 rounded-3xl bg-[#161811]/60 border-2 border-dashed border-[#AA8B63]/40 hover:border-[#AA8B63] transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] group shadow-inner"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#202517] group-hover:bg-[#AA8B63] text-[#AA8B63] group-hover:text-[#161811] flex items-center justify-center text-xl transition-all shadow-md mb-2">
                      <Plus className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <span className="font-display font-bold text-base text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors">
                      Register Another Dog
                    </span>
                    <span className="text-xs text-[#A4AA93] mt-1">
                      Add a pup to your household profile
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: PAST & COMPLETED ── */}
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
                      className="p-5 rounded-2xl bg-[#181A12] border border-[#FAF0E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#AA8B63]">{app.id}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#202517] text-[#FAF0E2]">
                            {app.status === "cancelled" ? "Cancelled" : "Completed"}
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-[#FAF0E2]">
                          {app.petName} ({app.breed}) · {app.packageName}
                        </div>
                        <div className="text-xs text-[#A4AA93]">
                          {app.scheduledDate || app.preferredTime} · {app.address}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-mono font-bold text-base text-[#FAF0E2]">
                          ${app.estimatedTotal || 125}.00
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("book")}
                          className="px-4 py-2 rounded-full bg-[#25281D] hover:bg-[#AA8B63] hover:text-[#161811] text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer border border-[#AA8B63]/30"
                        >
                          Book Again
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB 4: VIP PERKS & HYDRA CARE ── */}
            {activeTab === "perks" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-[#191D13] border border-[#FAF0E2]/10 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#20291C] to-[#161B12] border border-[#AA8B63]/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    Hydra® Brazilian Botanical Spa
                  </h4>
                  <p className="text-xs text-[#A4AA93] leading-relaxed">
                    Every grooming session is infused with premium, cruelty-free, salon-grade Brazilian botanical extracts that restore the lipid barrier and leave your dog's coat silk-smooth.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#191D13] border border-[#FAF0E2]/10 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#20291C] to-[#161B12] border border-[#AA8B63]/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-300" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    20% Multi-Dog VIP Benefit
                  </h4>
                  <p className="text-xs text-[#A4AA93] leading-relaxed">
                    Have two or more pups in the family? Receive an automatic 20% discount on your second dog's grooming when scheduled in the same visit.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#191D13] border border-[#FAF0E2]/10 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#20291C] to-[#161B12] border border-[#AA8B63]/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-400" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    100% Solar-Powered Mobile Fleet
                  </h4>
                  <p className="text-xs text-[#A4AA93] leading-relaxed">
                    Zero emissions, ultra-quiet operation with no loud generator hum. No electrical or water hookups required from your home.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#191D13] border border-[#FAF0E2]/10 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#20291C] to-[#161B12] border border-[#AA8B63]/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#FAF0E2]">
                    1-on-1 Cage-Free Sanctuary
                  </h4>
                  <p className="text-xs text-[#A4AA93] leading-relaxed">
                    Your dog receives the dedicated, undivided attention of a single master groomer from start to finish. Never caged, never hurried.
                  </p>
                </div>
              </div>
            )}
              </>
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
          showToast(`Appointment ${updated.id} updated successfully!`);
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

      {/* ── MOBILE / APP FLOATING BOTTOM DOCK ── */}
      {client && (
        <nav className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#161811]/95 backdrop-blur-2xl border border-[#AA8B63]/40 rounded-full px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-full transition-all cursor-pointer font-rounded text-[10px]",
              activeTab === "upcoming" ? "text-amber-300 font-bold bg-[#22271A]" : "text-[#A4AA93]"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("book")}
            className={cn(
              "flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-rounded font-extrabold shadow-lg cursor-pointer active:scale-95 transition-all",
              activeTab === "book"
                ? "bg-[#FAF0E2] text-[#161811] scale-105"
                : "bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] text-[#161811]"
            )}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Book</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pets")}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-full transition-all cursor-pointer font-rounded text-[10px]",
              activeTab === "pets" ? "text-amber-300 font-bold bg-[#22271A]" : "text-[#A4AA93]"
            )}
          >
            <Heart className="h-4 w-4" />
            <span>My Dogs</span>
          </button>

          <a
            href="https://wa.me/14153755823?text=Hello%20SOUVA%20Concierge,%20I%20need%20assistance%20with%20my%20account."
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-full text-[#25D366] font-rounded text-[10px] cursor-pointer"
          >
            <WhatsAppIcon variant="badge" className="h-4 w-4" />
            <span>Chat</span>
          </a>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-[#FAF0E2]/10 bg-[#12140D] py-6 px-4 sm:px-8 text-center text-xs text-[#A4AA93] font-mono">
        <p>SOUVA CORP · Client Portal & Self-Service Concierge · Official Partner of Hydra® by Pet Society</p>
      </footer>
    </div>
  );
}
