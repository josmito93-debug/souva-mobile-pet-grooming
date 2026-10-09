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
      if (monthIdx < now.getMonth() && year === now.getFullYear()) {
        year += 1;
      }
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

    // Normalize Service Zone to exact Airtable single-select choices
    let serviceZone = "San Francisco – Select";
    const rawZone = (payload.serviceZone || "").toLowerCase();
    const rawAddress = (payload.address || "").toLowerCase();
    const rawZip = (payload.zipCode || "");

    if (rawZone.includes("coastside") || rawAddress.includes("half moon") || rawZip === "94019") {
      serviceZone = "Coastside";
    } else if (rawZone.includes("north") || /94014|94015|94005|94080|94066|94044/.test(rawZip)) {
      serviceZone = "North Peninsula";
    } else if (rawZone.includes("central") || /94030|94010|94401|94402|94403|94404|94002|94070/.test(rawZip)) {
      serviceZone = "Central Peninsula";
    } else if (rawZone.includes("south") || /94061|94062|94063|94065|94027|94025|94301|94303|94304|94306|94040|94041|94043/.test(rawZip)) {
      serviceZone = "South Peninsula";
    }

    // Normalize Service Package to exact Airtable single-select choices
    const VALID_PACKAGES = [
      "Signature Grooming",
      "Essential Full Groom",
      "Bath & Tidy",
      "Bath & Refresh",
      "Premium Bath",
      "Standard Bath",
      "Deluxe Spa",
    ];
    let servicePackage = "Signature Grooming";
    const rawPkg = (payload.servicePackage || "").toLowerCase();
    for (const p of VALID_PACKAGES) {
      if (rawPkg.includes(p.toLowerCase())) {
        servicePackage = p;
        break;
      }
    }

    // Normalize sizes to match Airtable single/multi-select choices
    const rawSizes = Array.isArray(payload.dogSizes) ? payload.dogSizes : [payload.dogSizes].filter(Boolean);
    const normalizedSizes: string[] = [];
    for (const s of rawSizes) {
      const sl = String(s).toLowerCase();
      if (sl.includes("small") || sl.includes("toy") || sl.includes("15")) {
        normalizedSizes.push("Small (Up to 15 lb)");
      } else if (sl.includes("medium") || sl.includes("35")) {
        normalizedSizes.push("Medium (16–35 lb)");
      } else if (sl.includes("large") && !sl.includes("xl") && !sl.includes("x-large") && !sl.includes("50")) {
        normalizedSizes.push("Large (36–50 lb)");
      } else if (sl.includes("xl") || sl.includes("x-large") || sl.includes("giant") || sl.includes("50")) {
        normalizedSizes.push("X-Large (Over 50 lb)");
      }
    }
    const finalSizes = normalizedSizes.length > 0 ? Array.from(new Set(normalizedSizes)) : ["Small (Up to 15 lb)"];

    // Normalize temperament to match Airtable choices
    const rawTemp = Array.isArray(payload.temperament) ? payload.temperament : [payload.temperament].filter(Boolean);
    const normTemp: string[] = [];
    for (const t of rawTemp) {
      const tl = String(t).toLowerCase();
      if (tl.includes("ansioso") || tl.includes("anxious") || tl.includes("sensib")) normTemp.push("Ansioso / Sensible");
      else if (tl.includes("tranquilo") || tl.includes("calm")) normTemp.push("Tranquilo");
      else if (tl.includes("activo") || tl.includes("playful") || tl.includes("juguet")) normTemp.push("Activo / Juguetón");
      else if (tl.includes("tímido") || tl.includes("shy")) normTemp.push("Tímido");
      else normTemp.push("Amigable");
    }
    const finalTemp = normTemp.length > 0 ? Array.from(new Set(normTemp)) : ["Amigable"];

    // Normalize rabies vaccine status
    const isVaccinated = payload.vaccinated === "yes" || String(payload.vaccinated).includes("Al día") || String(payload.vaccinated) === "true";
    const vaccineChoice = isVaccinated ? "Al día (Up to Date)" : "En trámite (In Progress)";

    const fields: Record<string, any> = {
      "Booking ID": bookingId,
      "Status": "Pendiente",
      "Customer Name": payload.customerName || "Customer",
      "Phone": payload.phone || "",
      "Email": payload.email || "",
      "Doorstep Address": payload.address || "",
      "ZIP Code": payload.zipCode || "",
      "Service Zone": serviceZone,
      "Parking Notes": payload.parkingNotes || "Driveway available",
      "Scheduled Date": isoDate,
      "Scheduled Time Window": payload.scheduledTime || "9:30 AM",
      "Number of Dogs": Number(payload.dogCount) || 1,
      "Dog Names": payload.dogNames || "Pet",
      "Breeds": payload.breeds || "Canine",
      "Dog Sizes": finalSizes,
      "Dog Ages": payload.dogAges || "Adult (1–7 yrs)",
      "Genders": payload.genders || "Macho",
      "Rabies Vaccine": vaccineChoice,
      "Temperament": finalTemp,
      "Medical Conditions": payload.medicalConditions || "None / Healthy",
      "Groomer Notes": payload.groomerNotes || "Doorstep service",
      "Service Package": servicePackage,
      "Base Price": Number(payload.basePrice) || 0,
      "Addons Total": Number(payload.addonsTotal) || 0,
      "Discount 20% 2nd Dog": Number(payload.multiDogDiscount) || 0,
      "Estimated Total": Number(payload.estimatedTotal) || 0,
      "Payment Status": payload.paymentStatus || "Pendiente en Puerta",
      "Agreement Accepted": payload.agreementAccepted ?? true,
    };

    if (payload.spaUpgrades && payload.spaUpgrades.length > 0) {
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
        .filter(Boolean) as string[];
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
