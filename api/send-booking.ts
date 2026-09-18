export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY environment variable not configured" });
  }

  try {
    const {
      ownerName,
      email,
      phone,
      address,
      parkingNotes,
      petName,
      breed,
      size,
      gender,
      petAge,
      petCondition,
      vaccinated,
      medicalConditions,
      groomerNotes,
      packageName,
      addons,
      estimatedTotal,
      scheduledDate,
      scheduledTime,
    } = req.body || {};

    const toRecipients = [email].filter(Boolean);
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      toRecipients.push(process.env.ADMIN_NOTIFICATION_EMAIL);
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #14160E; color: #FAF0E2; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #AA8B63; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">SOUVA</h1>
          <p style="color: #A4AA93; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Elevated Mobile Pet Grooming</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.15); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #FAF0E2; font-size: 18px; margin: 0 0 8px 0;">Doorstep Appointment Confirmed!</h2>
          <p style="color: #AA8B63; font-size: 16px; font-weight: bold; margin: 0;">📅 ${scheduledDate} · ${scheduledTime}</p>
          <p style="color: #A4AA93; font-size: 12px; margin: 4px 0 0 0;">30-Minute Arrival Window at Your Doorstep</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <h3 style="color: #AA8B63; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">🐾 Pet Companion</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${petName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Breed:</strong> ${breed}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Size:</strong> ${size} · <strong>Gender:</strong> ${gender || "N/A"} · <strong>Age:</strong> ${petAge}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Condition:</strong> ${petCondition || "Good / Healthy"}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Rabies Vaccine:</strong> ${vaccinated === "yes" ? "Up to Date" : "In Progress"}</p>
          ${medicalConditions ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Medical:</strong> ${medicalConditions}</p>` : ""}
          ${groomerNotes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Groomer Notes:</strong> ${groomerNotes}</p>` : ""}
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <h3 style="color: #AA8B63; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">✂️ Service & Pricing</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Selected Package:</strong> ${packageName}</p>
          ${addons && addons.length > 0 ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Spa Upgrades:</strong> ${addons.join(", ")}</p>` : ""}
          <p style="margin: 8px 0 0 0; font-size: 16px; color: #AA8B63;"><strong>Estimated Total:</strong> $${estimatedTotal}</p>
          <p style="color: #A4AA93; font-size: 11px; margin: 4px 0 0 0;">Payment due at time of service (Cash, Check, Credit Card or Zelle).</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h3 style="color: #AA8B63; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">📍 Doorstep Location</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Client:</strong> ${ownerName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${address}</p>
          ${parkingNotes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Parking:</strong> ${parkingNotes}</p>` : ""}
        </div>

        <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 16px;">
          <p style="margin: 0;">SOUVA Mobile Pet Grooming · San Francisco Bay Area & select East Bay Area CA</p>
          <p style="margin: 4px 0 0 0;">Concierge / WhatsApp: +1 (850) 960-0034</p>
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
        to: toRecipients.length > 0 ? toRecipients : ["souvamobilepetgrooming@gmail.com"],
        subject: `✨ SOUVA Booking Confirmed: ${petName} on ${scheduledDate} (${scheduledTime})`,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to send email" });
  }
}
