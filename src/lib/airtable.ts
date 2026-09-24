export interface AirtableBookingPayload {
  bookingId?: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  serviceZone?: string;
  parkingNotes?: string;
  scheduledDate: string;
  scheduledDateIso?: string;
  scheduledTime: string;
  dogCount: number;
  dogNames: string;
  breeds: string;
  dogSizes: string[];
  dogAges: string;
  genders: string;
  vaccinated: "yes" | "no";
  temperament: string[];
  medicalConditions?: string;
  groomerNotes?: string;
  servicePackage: string;
  spaUpgrades: string[];
  basePrice: number;
  addonsTotal: number;
  multiDogDiscount: number;
  estimatedTotal: number;
  paymentStatus?: string;
  agreementAccepted: boolean;
  signatureUrl?: string | null;
}

export interface BookedSlot {
  id?: string;
  date: string; // ISO format "YYYY-MM-DD"
  time: string; // "9:30 AM", "8:30 AM", etc.
  status: string;
}

export function formatToIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const now = new Date();
  const lower = trimmed.toLowerCase();

  let target = new Date(now);
  if (lower.includes("today") || lower.includes("hoy")) {
    target = new Date(now);
  } else if (lower.includes("tomorrow") || lower.includes("mañana")) {
    target = new Date(now);
    target.setDate(now.getDate() + 1);
  } else {
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      ene: 0, abr: 3, ago: 7, dic: 11,
    };
    const parts = trimmed.replace(/,/g, " ").split(/\s+/).filter(Boolean);
    let monthIdx = -1;
    let dayNum = -1;
    let year = now.getFullYear();

    for (const p of parts) {
      const pLower = p.toLowerCase().slice(0, 3);
      if (monthNames[pLower] !== undefined && monthIdx === -1) {
        monthIdx = monthNames[pLower];
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num)) {
          if (num > 2020) {
            year = num;
          } else if (dayNum === -1) {
            dayNum = num;
          }
        }
      }
    }

    if (monthIdx !== -1 && dayNum !== -1) {
      target = new Date(year, monthIdx, dayNum);
    }
  }

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isTimeMatching(slotTime: string, bookedTime: string): boolean {
  if (!slotTime || !bookedTime) return false;
  const cleanSlot = slotTime.trim().toLowerCase().replace(/\s+/g, "");
  const cleanBooked = bookedTime.trim().toLowerCase().replace(/\s+/g, "");

  if (cleanSlot === cleanBooked) return true;
  if (cleanBooked.includes(cleanSlot)) return true;

  const parseHourMin = (str: string) => {
    const match = str.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const p = match[3] ? match[3].toLowerCase() : "";
    return { h, m, p };
  };

  const pSlot = parseHourMin(slotTime);
  const pBooked = parseHourMin(bookedTime);
  if (pSlot && pBooked) {
    const periodMatch = !pSlot.p || !pBooked.p || pSlot.p === pBooked.p;
    return pSlot.h === pBooked.h && pSlot.m === pBooked.m && periodMatch;
  }
  return false;
}

const AIRTABLE_PAT = (
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_AIRTABLE_API_KEY) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_AIRTABLE_TOKEN) ||
  ""
);
const AIRTABLE_BASE_ID = (
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_AIRTABLE_BASE_ID) ||
  "apptb52dkVCyq2rPA"
);
const AIRTABLE_TABLE = "Bookings";

export async function fetchBookedSlots(): Promise<BookedSlot[]> {
  try {
    // 1. Try serverless API first
    try {
      const apiRes = await fetch("/api/booked-slots");
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json && Array.isArray(json.slots)) {
          return json.slots;
        }
      }
    } catch {
      // fallback to direct fetch below
    }

    // 2. Direct Airtable query fallback
    const filterFormula = "AND({Scheduled Date} != '', IS_AFTER({Scheduled Date}, DATEADD(TODAY(), -1, 'days')), {Status} != 'Cancelled', {Status} != 'Cancelada', {Status} != 'Refunded')";
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?fields%5B%5D=Scheduled+Date&fields%5B%5D=Scheduled+Time+Window&fields%5B%5D=Status&filterByFormula=${encodeURIComponent(filterFormula)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    });

    if (!response.ok) {
      console.warn("Airtable fetchBookedSlots failed:", await response.text());
      return [];
    }

    const data = await response.json();
    const records: any[] = data.records || [];
    return records
      .map((r) => {
        const d = r.fields?.["Scheduled Date"];
        const t = r.fields?.["Scheduled Time Window"];
        const s = r.fields?.["Status"] || "Confirmed";
        if (!d) return null;
        return {
          id: r.id,
          date: formatToIsoDate(d),
          time: t || "",
          status: s,
        };
      })
      .filter(Boolean) as BookedSlot[];
  } catch (err) {
    console.warn("Failed to fetch booked slots from Airtable:", err);
    return [];
  }
}

export async function createAirtableBooking(payload: AirtableBookingPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const bookingId = payload.bookingId || `SOU-${Math.floor(1000 + Math.random() * 9000)}`;
    const isoDate = payload.scheduledDateIso || formatToIsoDate(payload.scheduledDate);

    // Normalize sizes to match Airtable single/multi-select choices
    const normalizedSizes = payload.dogSizes.map((s) => {
      const lower = s.toLowerCase();
      if (lower.includes("small")) return "Small (Up to 15 lb)";
      if (lower.includes("medium")) return "Medium (16–35 lb)";
      if (lower.includes("large") && !lower.includes("x-large")) return "Large (36–50 lb)";
      if (lower.includes("x-large") || lower.includes("xlarge")) return "X-Large (Over 50 lb)";
      return "Small (Up to 15 lb)";
    });

    // Normalize temperament to match Airtable choices
    const normalizedTemperament = payload.temperament.map((t) => {
      const lower = t.toLowerCase();
      if (lower.includes("ansioso") || lower.includes("anxious")) return "Ansioso / Sensible";
      if (lower.includes("tranquilo") || lower.includes("calm")) return "Tranquilo";
      if (lower.includes("activo") || lower.includes("playful") || lower.includes("energetic")) return "Activo / Juguetón";
      if (lower.includes("tímido") || lower.includes("shy")) return "Tímido";
      return "Amigable";
    });

    // Normalize rabies vaccine status
    const vaccineChoice = payload.vaccinated === "yes" ? "Al día (Up to Date)" : "En trámite (In Progress)";

    const fields: Record<string, any> = {
      "Booking ID": bookingId,
      "Status": "Pendiente",
      "Customer Name": payload.customerName || "Customer",
      "Phone": payload.phone || "",
      "Email": payload.email || "",
      "Doorstep Address": payload.address || "",
      "ZIP Code": payload.zipCode || "",
      "Parking Notes": payload.parkingNotes || "Driveway available",
      "Scheduled Date": isoDate,
      "Scheduled Time Window": payload.scheduledTime || "9:30 AM",
      "Number of Dogs": payload.dogCount || 1,
      "Dog Names": payload.dogNames || "Pet",
      "Breeds": payload.breeds || "Canine",
      "Dog Sizes": normalizedSizes.length > 0 ? normalizedSizes : ["Small (Up to 15 lb)"],
      "Dog Ages": payload.dogAges || "Adult (1–7 yrs)",
      "Genders": payload.genders || "Macho",
      "Rabies Vaccine": vaccineChoice,
      "Temperament": normalizedTemperament.length > 0 ? normalizedTemperament : ["Amigable"],
      "Medical Conditions": payload.medicalConditions || "None / Healthy",
      "Groomer Notes": payload.groomerNotes || "Doorstep service",
      "Service Package": payload.servicePackage || "Signature Grooming",
      "Base Price": payload.basePrice || 0,
      "Addons Total": payload.addonsTotal || 0,
      "Discount 20% 2nd Dog": payload.multiDogDiscount || 0,
      "Estimated Total": payload.estimatedTotal || 0,
      "Payment Status": payload.paymentStatus || "Pendiente en Puerta",
      "Agreement Accepted": payload.agreementAccepted ?? true,
    };

    if (payload.serviceZone) {
      fields["Service Zone"] = payload.serviceZone;
    }

    if (payload.spaUpgrades && payload.spaUpgrades.length > 0) {
      // Filter only matching allowed options
      const validUpgrades = [
        "Nail Grinding",
        "Teeth Brushing",
        "Paw & Nose Balm",
        "Deep Conditioning",
        "Sensitive Skin",
        "De-Shedding",
      ];
      const matched = payload.spaUpgrades
        .map((u) => validUpgrades.find((v) => v.toLowerCase().includes(u.toLowerCase()) || u.toLowerCase().includes(v.toLowerCase())))
        .filter(Boolean);
      if (matched.length > 0) {
        fields["Spa Upgrades"] = Array.from(new Set(matched));
      }
    }

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Airtable API error:", errText);
      return { success: false, error: errText };
    }

    const data = await response.json();
    const createdId = data.records?.[0]?.id;
    return { success: true, id: createdId };
  } catch (error: any) {
    console.error("Airtable request failed:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}
