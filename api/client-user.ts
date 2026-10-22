const AIRTABLE_KEY = (
  process.env.AIRTABLE_API_KEY ||
  process.env.VITE_AIRTABLE_API_KEY ||
  process.env.AIRTABLE_TOKEN ||
  ""
).trim();

const AIRTABLE_BASE_ID = (process.env.AIRTABLE_BASE_ID || "apptb52dkVCyq2rPA").trim();
const USERS_TABLE = "Users";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET: Find user by email or phone ──────────────────────────────
  if (req.method === "GET") {
    const email = (req.query?.email || "").trim().toLowerCase();
    const phone = (req.query?.phone || "").trim().replace(/[^0-9]/g, "");

    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    try {
      const conds: string[] = [];
      if (email) conds.push(`LOWER({Email}) = '${email.replace(/'/g, "\\'")}'`);
      if (phone && phone.length >= 7) conds.push(`FIND('${phone.slice(-7)}', {Phone}) > 0`);
      const formula = conds.length > 1 ? `OR(${conds.join(",")})` : conds[0];

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
      const atRes = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      });

      if (!atRes.ok) {
        return res.status(atRes.status).json({ success: false, error: await atRes.text() });
      }

      const data = await atRes.json();
      const record = data.records?.[0];
      if (!record) {
        return res.status(200).json({ success: true, user: null });
      }

      const f = record.fields || {};
      return res.status(200).json({
        success: true,
        user: {
          id: record.id,
          name: f["Full Name"] || "",
          email: f["Email"] || "",
          phone: f["Phone"] || "",
          address: f["Doorstep Address"] || "",
          zipCode: f["ZIP Code"] || "",
          registeredPets: f["Registered Pets"] || "",
          authProvider: f["Auth Provider"] || "Email / Phone",
          picture: f["Avatar URL"] || "",
          lastLogin: f["Last Login"] || "",
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: Create or Update User (Upsert) ───────────────────────────
  if (req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);

      const {
        name = "Valued Pet Parent",
        email = "",
        phone = "",
        address = "",
        zipCode = "",
        registeredPets = "",
        authProvider = "Email / Phone",
        picture = "",
      } = body || {};

      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim().replace(/[^0-9]/g, "");

      if (!cleanEmail && !cleanPhone) {
        return res.status(400).json({ error: "Email or phone is required" });
      }

      // Check if user already exists
      const conds: string[] = [];
      if (cleanEmail) conds.push(`LOWER({Email}) = '${cleanEmail.replace(/'/g, "\\'")}'`);
      if (cleanPhone && cleanPhone.length >= 7) conds.push(`FIND('${cleanPhone.slice(-7)}', {Phone}) > 0`);
      const formula = conds.length > 1 ? `OR(${conds.join(",")})` : conds[0];

      const lookupUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
      const lookupRes = await fetch(lookupUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      });

      const todayStr = new Date().toISOString().split("T")[0];
      const fields: Record<string, any> = {
        "Full Name": name,
        "Last Login": todayStr,
      };

      if (cleanEmail) fields["Email"] = cleanEmail;
      if (cleanPhone) fields["Phone"] = cleanPhone;
      if (address) fields["Doorstep Address"] = address;
      if (zipCode) fields["ZIP Code"] = zipCode;
      if (registeredPets) fields["Registered Pets"] = registeredPets;
      if (picture) fields["Avatar URL"] = picture;
      if (authProvider) fields["Auth Provider"] = authProvider === "google" ? "Google" : "Email / Phone";

      let existingRecordId = null;
      if (lookupRes.ok) {
        const lookupData = await lookupRes.json();
        if (lookupData.records && lookupData.records.length > 0) {
          existingRecordId = lookupData.records[0].id;
        }
      }

      if (existingRecordId) {
        // Update existing record
        const patchRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}/${existingRecordId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        });
        const patchData = await patchRes.json();
        return res.status(200).json({ success: true, action: "updated", user: patchData });
      } else {
        // Create new record
        const createRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [{ fields }],
          }),
        });
        const createData = await createRes.json();
        return res.status(200).json({ success: true, action: "created", user: createData.records?.[0] });
      }
    } catch (err: any) {
      console.error("POST /api/client-user error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
