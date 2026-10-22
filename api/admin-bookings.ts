const AIRTABLE_KEY = (
  process.env.AIRTABLE_API_KEY ||
  process.env.VITE_AIRTABLE_API_KEY ||
  process.env.AIRTABLE_TOKEN ||
  ""
).trim();

const AIRTABLE_BASE_ID = (process.env.AIRTABLE_BASE_ID || "apptb52dkVCyq2rPA").trim();
const AIRTABLE_TABLE = (process.env.AIRTABLE_TABLE_NAME || "Bookings").trim();

const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  "94116": { lat: 37.7442, lng: -122.4851 }, // Sunset / Parkside
  "94122": { lat: 37.7599, lng: -122.4842 }, // Sunset
  "94127": { lat: 37.7348, lng: -122.4571 }, // West Portal
  "94132": { lat: 37.7212, lng: -122.4866 }, // Lake Merced
  "94112": { lat: 37.7214, lng: -122.4431 }, // Ingleside
  "94131": { lat: 37.7431, lng: -122.4398 }, // Glen Park
  "94014": { lat: 37.6879, lng: -122.4416 }, // Daly City
  "94015": { lat: 37.6695, lng: -122.4716 }, // Daly City
  "94080": { lat: 37.6547, lng: -122.4077 }, // South San Francisco
  "94066": { lat: 37.6305, lng: -122.4111 }, // San Bruno
  "94044": { lat: 37.5969, lng: -122.4868 }, // Pacifica
  "94010": { lat: 37.5779, lng: -122.3647 }, // Burlingame
  "94401": { lat: 37.5630, lng: -122.3255 }, // San Mateo
  "94402": { lat: 37.5412, lng: -122.3312 }, // San Mateo
  "94403": { lat: 37.5348, lng: -122.3021 }, // San Mateo
  "94404": { lat: 37.5562, lng: -122.2681 }, // Foster City
  "94002": { lat: 37.5188, lng: -122.2766 }, // Belmont
  "94070": { lat: 37.5072, lng: -122.2605 }, // San Carlos
  "94061": { lat: 37.4728, lng: -122.2356 }, // Redwood City
  "94062": { lat: 37.4578, lng: -122.2655 }, // Redwood City / Woodside
  "94025": { lat: 37.4538, lng: -122.1822 }, // Menlo Park
  "94027": { lat: 37.4613, lng: -122.1977 }, // Atherton
  "94301": { lat: 37.4419, lng: -122.1430 }, // Palo Alto
  "94303": { lat: 37.4452, lng: -122.1189 }, // Palo Alto
  "94040": { lat: 37.3861, lng: -122.0839 }, // Mountain View
  "94019": { lat: 37.4636, lng: -122.4286 }, // Half Moon Bay
};

function getCoordsForAddress(address = "", zip = ""): { lat: number; lng: number } {
  const cleanZip = (zip || "").trim().slice(0, 5);
  if (cleanZip && ZIP_COORDS[cleanZip]) {
    return ZIP_COORDS[cleanZip];
  }
  for (const [z, coords] of Object.entries(ZIP_COORDS)) {
    if (address.includes(z)) return coords;
  }
  const lower = address.toLowerCase();
  if (lower.includes("palo alto")) return { lat: 37.4419, lng: -122.1430 };
  if (lower.includes("burlingame")) return { lat: 37.5779, lng: -122.3647 };
  if (lower.includes("san mateo")) return { lat: 37.5630, lng: -122.3255 };
  if (lower.includes("redwood city")) return { lat: 37.4728, lng: -122.2356 };
  if (lower.includes("daly city")) return { lat: 37.6879, lng: -122.4416 };
  if (lower.includes("sunset")) return { lat: 37.7599, lng: -122.4842 };
  if (lower.includes("half moon")) return { lat: 37.4636, lng: -122.4286 };
  return { lat: 37.7749, lng: -122.4194 };
}

function normalizeStatus(airtableStatus: string): string {
  const s = (airtableStatus || "").toLowerCase();
  if (s.includes("complet") || s.includes("finaliz")) return "completed";
  if (s.includes("cancel") || s.includes("rechaz")) return "cancelled";
  if (s.includes("ruta") || s.includes("camino") || s.includes("en_route") || s.includes("route")) return "en_route";
  if (s.includes("lleg") || s.includes("arrived")) return "arrived";
  if (s.includes("servic") || s.includes("progress")) return "in_service";
  if (s.includes("confirm") || s.includes("assign") || s.includes("agend")) return "assigned";
  return "pending";
}

function mapAirtableRecordToRequest(r: any): any {
  const f = r.fields || {};
  const zip = f["ZIP Code"] || "";
  const address = f["Doorstep Address"] || "Client Doorstep";
  const coords = getCoordsForAddress(address, zip);

  const rawSizes = Array.isArray(f["Dog Sizes"]) ? f["Dog Sizes"] : [f["Dog Sizes"]].filter(Boolean);
  let petSize = "medium";
  if (rawSizes.some((s: string) => String(s).toLowerCase().includes("small") || String(s).toLowerCase().includes("toy"))) {
    petSize = "small";
  } else if (rawSizes.some((s: string) => String(s).toLowerCase().includes("xl") || String(s).toLowerCase().includes("giant"))) {
    petSize = "xlarge";
  } else if (rawSizes.some((s: string) => String(s).toLowerCase().includes("large"))) {
    petSize = "large";
  }

  const rawStatus = f["Status"] || "Pendiente";
  const mappedStatus = normalizeStatus(rawStatus);
  const isArchived = mappedStatus === "completed" || mappedStatus === "cancelled";

  const scheduledDate = f["Scheduled Date"] || "";
  const scheduledTime = f["Scheduled Time Window"] || "9:30 AM";
  const bookingId = f["Booking ID"] || `SOU-${r.id.slice(-4)}`;

  return {
    id: bookingId,
    airtableRecordId: r.id,
    customerName: f["Customer Name"] || "Valued Pet Parent",
    email: f["Email"] || "",
    phone: f["Phone"] || "",
    address: address,
    zipCode: zip,
    serviceZone: f["Service Zone"] || "San Francisco & Peninsula",
    parkingNotes: f["Parking Notes"] || "Driveway available",
    lat: coords.lat,
    lng: coords.lng,
    dogCount: Number(f["Number of Dogs"]) || 1,
    petName: f["Dog Names"] || "Pup",
    breed: f["Breeds"] || "Mix",
    size: petSize,
    gender: f["Genders"] || "Male",
    petAge: f["Dog Ages"] || "Adult",
    vaccinated: f["Rabies Vaccine"] || "Up to Date (Compliant)",
    medicalConditions: f["Medical Conditions"] || "None / Healthy",
    temperament: Array.isArray(f["Temperament"]) ? f["Temperament"].join(", ") : f["Temperament"] || "Friendly & Calm",
    petPhoto: null,
    packageId: (f["Service Package"] || "essential-full-groom").toLowerCase().replace(/[^a-z0-9]/g, "-"),
    packageName: f["Service Package"] || "Essential Full Groom",
    addons: Array.isArray(f["Spa Upgrades"]) ? f["Spa Upgrades"] : [],
    coatCondition: f["Coat Condition"] || "Regular Grooming",
    groomerNotes: f["Groomer Notes"] || "",
    basePrice: Number(f["Base Price"]) || 0,
    addonsTotal: Number(f["Addons Total"]) || 0,
    multiDogDiscount: Number(f["Discount 20% 2nd Dog"]) || 0,
    estimatedTotal: Number(f["Estimated Total"]) || 0,
    paymentStatus: f["Payment Status"] || "Pending Doorstep Payment",
    preferredTime: `${scheduledDate} · ${scheduledTime}`,
    scheduledDate: scheduledDate,
    scheduledTime: scheduledTime,
    etaMinutes: mappedStatus === "en_route" ? 15 : mappedStatus === "arrived" ? 0 : 30,
    vanId: "VAN-01",
    vanName: "Van 01 (SF Peninsula Solar Fleet)",
    status: mappedStatus,
    createdAt: f["Created At"] || r.createdTime || new Date().toISOString(),
    notes: f["Groomer Notes"] || "",
    archived: isArchived,
  };
}

export default async function handler(req: any, res: any) {
  // CORS & Methods
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET: Fetch all bookings from Airtable (or filter by email/phone/bookingId) ──
  if (req.method === "GET") {
    try {
      const emailParam = (req.query?.email || "").trim().toLowerCase();
      const phoneParam = (req.query?.phone || "").trim().replace(/[^0-9]/g, "");
      const bookingIdParam = (req.query?.bookingId || "").trim();

      let recordsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?sort%5B0%5D%5Bfield%5D=Created+At&sort%5B0%5D%5Bdirection%5D=desc&maxRecords=100`;

      if (bookingIdParam) {
        recordsUrl += `&filterByFormula=${encodeURIComponent(`{Booking ID} = '${bookingIdParam.replace(/'/g, "\\'")}'`)}`;
      } else if (emailParam || phoneParam) {
        const conds: string[] = [];
        if (emailParam) conds.push(`LOWER({Email}) = '${emailParam.replace(/'/g, "\\'")}'`);
        if (phoneParam && phoneParam.length >= 7) conds.push(`FIND('${phoneParam.slice(-7)}', {Phone}) > 0`);
        const formula = conds.length > 1 ? `OR(${conds.join(",")})` : conds[0];
        recordsUrl += `&filterByFormula=${encodeURIComponent(formula)}`;
      }

      const atRes = await fetch(recordsUrl, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
        },
      });

      if (!atRes.ok) {
        const errText = await atRes.text();
        console.error("Airtable admin GET error:", atRes.status, errText);
        return res.status(500).json({
          error: "Failed to fetch from Airtable",
          details: errText,
        });
      }

      const data = await atRes.json();
      const records = data.records || [];
      const requests = records.map(mapAirtableRecordToRequest);

      return res.status(200).json({
        success: true,
        total: requests.length,
        source: "airtable",
        requests,
      });
    } catch (err: any) {
      console.error("GET /api/admin-bookings exception:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH: Update record status / any appointment aspect in Airtable ──────────
  if (req.method === "PATCH") {
    try {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);

      const { airtableRecordId, bookingId, status, scheduledDate, scheduledTime, notes } = body || {};

      let targetRecordId = airtableRecordId;

      // If recordId not passed directly, lookup by Booking ID in Airtable
      if (!targetRecordId && bookingId) {
        const lookupUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?filterByFormula=${encodeURIComponent(`{Booking ID} = '${bookingId}'`)}&maxRecords=1`;
        const lookupRes = await fetch(lookupUrl, {
          headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
        });
        if (lookupRes.ok) {
          const lookupData = await lookupRes.json();
          if (lookupData.records && lookupData.records.length > 0) {
            targetRecordId = lookupData.records[0].id;
          }
        }
      }

      if (!targetRecordId) {
        return res.status(400).json({ error: "Record ID or Booking ID is required to update." });
      }

      const fieldsToUpdate: Record<string, any> = {};

      if (status) {
        let atStatus = "Pendiente";
        if (status === "completed") atStatus = "Completada";
        else if (status === "cancelled") atStatus = "Cancelada";
        else if (status === "en_route") atStatus = "En Ruta";
        else if (status === "in_service") atStatus = "En Servicio";
        else if (status === "assigned") atStatus = "Confirmada";
        fieldsToUpdate["Status"] = atStatus;
      }

      if (scheduledDate) fieldsToUpdate["Scheduled Date"] = scheduledDate;
      if (scheduledTime) fieldsToUpdate["Scheduled Time Window"] = scheduledTime;
      if (notes) fieldsToUpdate["Groomer Notes"] = notes;
      if (body.groomerNotes !== undefined) fieldsToUpdate["Groomer Notes"] = body.groomerNotes;

      // Additional fields for complete appointment modification from Client Portal
      if (body.address) fieldsToUpdate["Doorstep Address"] = body.address;
      if (body.zipCode) fieldsToUpdate["ZIP Code"] = body.zipCode;
      if (body.parkingNotes !== undefined) fieldsToUpdate["Parking Notes"] = body.parkingNotes;
      if (body.servicePackage) fieldsToUpdate["Service Package"] = body.servicePackage;
      if (Array.isArray(body.spaUpgrades)) fieldsToUpdate["Spa Upgrades"] = body.spaUpgrades;
      if (body.basePrice !== undefined) fieldsToUpdate["Base Price"] = Number(body.basePrice);
      if (body.addonsTotal !== undefined) fieldsToUpdate["Addons Total"] = Number(body.addonsTotal);
      if (body.estimatedTotal !== undefined) fieldsToUpdate["Estimated Total"] = Number(body.estimatedTotal);
      if (body.medicalConditions !== undefined) fieldsToUpdate["Medical Conditions"] = body.medicalConditions;
      if (body.petName) fieldsToUpdate["Dog Names"] = body.petName;
      if (body.breed) fieldsToUpdate["Breeds"] = body.breed;
      if (body.petAge) fieldsToUpdate["Dog Ages"] = body.petAge;
      if (body.customerName) fieldsToUpdate["Customer Name"] = body.customerName;
      if (body.phone) fieldsToUpdate["Phone"] = body.phone;
      if (body.email) fieldsToUpdate["Email"] = body.email;

      const patchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}/${targetRecordId}`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: fieldsToUpdate }),
      });

      if (!patchRes.ok) {
        const patchErr = await patchRes.text();
        return res.status(500).json({ error: "Airtable update failed", details: patchErr });
      }

      const updatedRecord = await patchRes.json();
      return res.status(200).json({
        success: true,
        updated: mapAirtableRecordToRequest(updatedRecord),
      });
    } catch (err: any) {
      console.error("PATCH /api/admin-bookings error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
