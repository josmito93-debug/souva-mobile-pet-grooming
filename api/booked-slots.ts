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
      return res.status(response.status).json({ success: false, error: errText, slots: [] });
    }

    const data = await response.json();
    const slots = (data.records || [])
      .map((r: any) => ({
        id: r.id,
        date: r.fields?.["Scheduled Date"] || "",
        time: r.fields?.["Scheduled Time Window"] || "",
        status: r.fields?.["Status"] || "Confirmed",
      }))
      .filter((s: any) => Boolean(s.date && s.time));

    return res.status(200).json({ success: true, slots });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, error: error.message || "Failed to fetch slots", slots: [] });
  }
}
