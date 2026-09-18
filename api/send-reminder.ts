export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
  }

  try {
    const {
      ownerName = "Valued Pet Parent",
      email,
      phone = "",
      address = "Your doorstep",
      parkingNotes = "",
      petName = "your dog",
      estimatedTotal = 125,
      scheduledTime = "soon",
    } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Email is required to send reminder" });
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #14160E; color: #FAF0E2; padding: 32px 24px; border-radius: 18px; border: 1px solid rgba(250, 240, 226, 0.15);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #AA8B63; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">SOUVA</h1>
          <p style="color: #A4AA93; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Elevated Mobile Pet Grooming · Bay Area Fleet</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid #AA8B63; border-radius: 14px; padding: 22px; margin-bottom: 22px; text-align: center;">
          <div style="display: inline-block; padding: 4px 14px; background: rgba(170, 139, 99, 0.2); border: 1px solid #AA8B63; border-radius: 9999px; margin-bottom: 10px;">
            <span style="color: #AA8B63; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🚐 Van En Route · 30-Minute Arrival Notice</span>
          </div>
          <h2 style="color: #FAF0E2; font-size: 21px; margin: 4px 0 8px 0;">We're Arriving Soon for ${petName}!</h2>
          <p style="color: #A4AA93; font-size: 13px; margin: 0; line-height: 1.5;">
            Our mobile grooming spa van is heading your way and will arrive at your doorstep in approximately <strong>30 minutes</strong> for your scheduled window (<strong>${scheduledTime}</strong>).
          </p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 22px;">
          <h3 style="color: #AA8B63; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">
            📋 Quick Arrival Checklist
          </h3>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.8; color: #FAF0E2;">
            <li><strong>Potty Break:</strong> Please take ${petName} on a quick bathroom break before our stylist arrives.</li>
            <li><strong>Parking Space:</strong> Please ensure our van has approximately 2 car lengths available (${parkingNotes || "Driveway or curbside"}).</li>
            <li><strong>Keep Your Phone Nearby:</strong> Our stylist may text or call you at <strong>${phone}</strong> upon arrival at ${address}.</li>
            <li><strong>Doorstep Payment:</strong> Payment of <strong>$${estimatedTotal}.00 USD</strong> is collected at your doorstep (Cash, Check, Credit Card, or Zelle).</li>
          </ul>
        </div>

        <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 18px; line-height: 1.6;">
          <p style="margin: 0;">Need immediate assistance or gate access instructions? Text or call our Concierge at <strong style="color: #FAF0E2;">+1 (850) 960-0034</strong></p>
          <p style="margin: 4px 0 0 0;">SOUVA Mobile Pet Grooming LLC · San Francisco Bay Area & Select East Bay CA</p>
        </div>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Souva Mobile Grooming <onboarding@resend.dev>",
        to: [email],
        subject: `🚐 SOUVA Alert: We're Arriving in 30 Minutes for ${petName}!`,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to send arrival reminder" });
  }
}
