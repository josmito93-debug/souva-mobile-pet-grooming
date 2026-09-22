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

export async function createAirtableBooking(payload: AirtableBookingPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const bookingId = payload.bookingId || `SOU-${Math.floor(1000 + Math.random() * 9000)}`;

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
