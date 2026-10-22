export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const airtableKey = (
    process.env.AIRTABLE_API_KEY ||
    process.env.VITE_AIRTABLE_API_KEY ||
    process.env.AIRTABLE_TOKEN ||
    ""
  ).trim();
  const airtableBaseId = (process.env.AIRTABLE_BASE_ID || "apptb52dkVCyq2rPA").trim();
  const airtableTable = (process.env.AIRTABLE_TABLE_NAME || "Bookings").trim();

  // Blocked week: October 19 to 25, 2026 (Fleet Operations / Maintenance)
  const BLOCKED_DATES = [
    "2026-10-19",
    "2026-10-20",
    "2026-10-21",
    "2026-10-22",
    "2026-10-23",
    "2026-10-24",
    "2026-10-25",
  ];
  const STANDARD_TIMES = [
    "8:30 AM",
    "9:30 AM",
    "11:30 AM",
    "12:30 PM",
    "2:30 PM",
    "3:30 PM",
    "5:30 PM",
    "6:30 PM",
  ];

  const blockedSlots = BLOCKED_DATES.flatMap((date) =>
    STANDARD_TIMES.map((time) => ({
      id: `blocked-${date}-${time.replace(/\s+/g, "")}`,
      date,
      time,
      status: "Blocked",
    }))
  );

  try {
    const filterFormula =
      "AND({Scheduled Date} != '', IS_AFTER({Scheduled Date}, DATEADD(TODAY(), -1, 'days')), {Status} != 'Cancelled', {Status} != 'Cancelada', {Status} != 'Refunded')";
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTable}?fields%5B%5D=Scheduled+Date&fields%5B%5D=Scheduled+Time+Window&fields%5B%5D=Status&filterByFormula=${encodeURIComponent(
      filterFormula
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${airtableKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, error: errText, slots: blockedSlots, blockedDates: BLOCKED_DATES });
    }

    const data = await response.json();
    const airtableSlots = (data.records || [])
      .map((r: any) => ({
        id: r.id,
        date: r.fields?.["Scheduled Date"] || "",
        time: r.fields?.["Scheduled Time Window"] || "",
        status: r.fields?.["Status"] || "Confirmed",
      }))
      .filter((s: any) => Boolean(s.date && s.time));

    const allSlots = [...airtableSlots, ...blockedSlots];

    return res.status(200).json({ success: true, slots: allSlots, blockedDates: BLOCKED_DATES });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, error: error.message || "Failed to fetch slots", slots: blockedSlots, blockedDates: BLOCKED_DATES });
  }
}
