import { DispatchRequest, getStoredRequests, updateAppointmentDetails } from "@/lib/dispatchStore";

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  picture?: string;
  authProvider?: "google" | "email" | "phone";
  address?: string;
  zipCode?: string;
  createdAt: string;
  lastLoginAt: string;
}

const CLIENT_AUTH_KEY = "souva_client_user_session_v1";

export function getClientSession(): ClientUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLIENT_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading client session:", err);
    return null;
  }
}

export function saveClientSession(user: ClientUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIENT_AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("souva_client_session_changed", { detail: user }));
  } catch (err) {
    console.error("Error saving client session:", err);
  }
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLIENT_AUTH_KEY);
    window.dispatchEvent(new CustomEvent("souva_client_session_changed", { detail: null }));
  } catch (err) {
    console.error("Error clearing client session:", err);
  }
}

/**
 * Fetch appointments matching client email or phone from live Airtable backend and local store.
 */
export async function fetchClientAppointments(
  email?: string,
  phone?: string
): Promise<DispatchRequest[]> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").trim().replace(/[^0-9]/g, "");

  const localMatches: DispatchRequest[] = [];
  try {
    const stored = getStoredRequests();
    for (const req of stored) {
      const rEmail = (req.email || "").trim().toLowerCase();
      const rPhone = (req.phone || "").trim().replace(/[^0-9]/g, "");
      const emailMatch = cleanEmail && rEmail && rEmail === cleanEmail;
      const phoneMatch = cleanPhone && rPhone && (rPhone.includes(cleanPhone.slice(-7)) || cleanPhone.includes(rPhone.slice(-7)));
      if (emailMatch || phoneMatch) {
        localMatches.push(req);
      }
    }
  } catch (e) {
    console.warn("Local requests lookup error:", e);
  }

  // Fetch live from Airtable via serverless API
  try {
    const queryParams = new URLSearchParams();
    if (cleanEmail) queryParams.set("email", cleanEmail);
    if (cleanPhone) queryParams.set("phone", cleanPhone);

    const res = await fetch(`/api/admin-bookings?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const airtableRequests: DispatchRequest[] = Array.isArray(data.requests) ? data.requests : [];

      // Merge Airtable records with any pending local records
      const mergedMap = new Map<string, DispatchRequest>();

      // Put Airtable first as ground truth
      airtableRequests.forEach((req) => {
        mergedMap.set(req.id, req);
      });

      // Merge local records if not present in Airtable
      localMatches.forEach((req) => {
        if (!mergedMap.has(req.id)) {
          mergedMap.set(req.id, req);
        }
      });

      return Array.from(mergedMap.values()).sort((a, b) => {
        const dateA = a.scheduledDate || a.createdAt || "";
        const dateB = b.scheduledDate || b.createdAt || "";
        return dateB.localeCompare(dateA);
      });
    }
  } catch (err) {
    console.warn("Airtable client fetch fallback to local store:", err);
  }

  return localMatches.sort((a, b) => {
    const dateA = a.scheduledDate || a.createdAt || "";
    const dateB = b.scheduledDate || b.createdAt || "";
    return dateB.localeCompare(dateA);
  });
}

/**
 * Updates any aspect of an appointment both in Airtable and local store.
 */
export async function syncAppointmentUpdate(
  bookingId: string,
  airtableRecordId: string | undefined,
  updates: Record<string, any>
): Promise<{ success: boolean; updated?: any; error?: string }> {
  // 1. Immediately apply update locally so UI responds with zero latency
  updateAppointmentDetails(bookingId, updates);

  // 2. Synchronize with Airtable API
  try {
    const res = await fetch("/api/admin-bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        airtableRecordId,
        ...updates,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Re-trigger local dispatch update event so admin and other tabs refresh
      window.dispatchEvent(new CustomEvent("souva_dispatch_updated", { detail: updates }));
      return { success: true, updated: data.updated };
    } else {
      console.warn("Airtable sync responded with warning:", data);
      return { success: true, error: data.error };
    }
  } catch (err: any) {
    console.error("syncAppointmentUpdate network error:", err);
    // Return success: true because it was applied locally and queued
    return { success: true, error: err.message };
  }
}
