import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    ""
  ).trim();

  try {
    let booking = req.body;
    if (typeof booking === "string") {
      try {
        booking = JSON.parse(booking);
      } catch (e) {
        console.error("Failed to parse body string:", e);
      }
    }
    if (Buffer.isBuffer(booking)) {
      try {
        booking = JSON.parse(booking.toString("utf-8"));
      } catch (e) {
        console.error("Failed to parse buffer body:", e);
      }
    }
    if (!booking || typeof booking !== "object") {
      booking = {};
    }

    const {
      ownerName = "Valued Pet Parent",
      email,
      phone = "",
      address = "Client Doorstep",
      parkingNotes = "",
      petName = "Pet",
      breed = "Canine",
      size = "medium",
      gender = "N/A",
      petAge = "Adult",
      petCondition = "Healthy",
      vaccinated = "yes",
      medicalConditions = "None / Healthy",
      groomerNotes = "",
      packageName = "Signature Grooming",
      addons = [],
      estimatedTotal = 125,
      scheduledDate = "Upcoming Date",
      scheduledTime = "Arrival Window",
      signature = null,
    } = booking;

    // 1. Generate the luxury branded PDF invoice with SOUVA brand colors
    const pdfBase64 = await generateBrandInvoicePdf({
      ...booking,
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
      signature,
    });

    const cleanPetName = petName.replace(/[^a-zA-Z0-9]/g, "-");
    const pdfFileName = `SOUVA-Invoice-${cleanPetName}-${Date.now().toString().slice(-4)}.pdf`;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured in Vercel environment variables.");
      return res.status(200).json({
        success: false,
        emailSent: false,
        message: "RESEND_API_KEY environment variable is not configured in Vercel. Please check Project Settings -> Environment Variables.",
        fileName: pdfFileName,
        pdfBase64,
      });
    }

    // 2. Send confirmation email with attached branded PDF invoice
    const toRecipients = [email].filter(Boolean);
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      toRecipients.push(process.env.ADMIN_NOTIFICATION_EMAIL);
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Souva Mobile Grooming <onboarding@resend.dev>";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #14160E; color: #FAF0E2; padding: 36px 28px; border-radius: 20px; border: 1px solid rgba(250, 240, 226, 0.12);">
        
        <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid rgba(250, 240, 226, 0.1); padding-bottom: 20px;">
          <div style="display: inline-block; padding: 6px 14px; background: rgba(170, 139, 99, 0.15); border: 1px solid #AA8B63; border-radius: 9999px; margin-bottom: 12px;">
            <span style="color: #AA8B63; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Official Service Invoice & Agreement</span>
          </div>
          <h1 style="color: #AA8B63; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">SOUVA</h1>
          <p style="color: #A4AA93; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">The Bay Area's Elevated Mobile Pet Grooming Experience</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid #AA8B63; border-radius: 14px; padding: 22px; margin-bottom: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <span style="color: #AA8B63; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">CONFIRMED DOORSTEP APPOINTMENT</span>
          <h2 style="color: #FAF0E2; font-size: 20px; margin: 0 0 6px 0;">📅 ${scheduledDate} · ${scheduledTime}</h2>
          <p style="color: #A4AA93; font-size: 12px; margin: 0;">30-Minute Doorstep Arrival Window · Luxury Solar Van Dispatched</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 18px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">🐾 Pet Companion Profile</h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr><td style="color: #A4AA93; width: 35%;">Name:</td><td style="color: #FAF0E2; font-weight: 700;">${petName}</td></tr>
            <tr><td style="color: #A4AA93;">Breed:</td><td style="color: #FAF0E2;">${breed}</td></tr>
            <tr><td style="color: #A4AA93;">Size & Gender:</td><td style="color: #FAF0E2;">${size.toUpperCase()} · ${gender.toUpperCase()} · ${petAge}</td></tr>
            <tr><td style="color: #A4AA93;">Condition:</td><td style="color: #FAF0E2;">${petCondition}</td></tr>
            <tr><td style="color: #A4AA93;">Rabies Vaccine:</td><td style="color: #FAF0E2;">${vaccinated === "yes" ? "Up to Date (Compliant)" : "In Progress"}</td></tr>
            ${medicalConditions ? `<tr><td style="color: #A4AA93;">Medical Notes:</td><td style="color: #FAF0E2;">${medicalConditions}</td></tr>` : ""}
            ${groomerNotes ? `<tr><td style="color: #A4AA93;">Groomer Notes:</td><td style="color: #FAF0E2; font-style: italic;">${groomerNotes}</td></tr>` : ""}
          </table>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 18px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">✂️ Itemized Service & Pricing</h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr><td style="color: #FAF0E2; font-weight: 600;">${packageName}</td><td style="color: #FAF0E2; text-align: right; font-weight: 700;">Base Service</td></tr>
            ${addons && addons.length > 0 ? addons.map((add: string) => `<tr><td style="color: #A4AA93; padding-left: 12px;">+ ${add}</td><td style="color: #AA8B63; text-align: right;">Upgrade</td></tr>`).join("") : ""}
            <tr style="border-top: 1px solid rgba(250, 240, 226, 0.1);"><td style="color: #AA8B63; font-weight: 700; font-size: 15px; padding-top: 10px;">Estimated Total Due:</td><td style="color: #AA8B63; text-align: right; font-weight: 800; font-size: 18px; padding-top: 10px;">$${estimatedTotal}.00 USD</td></tr>
          </table>
          <p style="color: #A4AA93; font-size: 11px; margin: 10px 0 0 0; font-style: italic;">Payment collected at doorstep upon service completion via Cash, Check, Credit Card or Zelle.</p>
        </div>

        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 22px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">📍 Doorstep Destination</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Parent:</strong> ${ownerName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> ${phone} · <strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Address:</strong> ${address}</p>
          ${parkingNotes ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Parking:</strong> ${parkingNotes}</p>` : ""}
        </div>

        <div style="background-color: rgba(170, 139, 99, 0.08); border: 1px dashed rgba(170, 139, 99, 0.4); border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 24px;">
          <span style="color: #AA8B63; font-size: 11px; font-weight: 700; text-transform: uppercase;">📎 Official PDF Invoice Attached</span>
          <p style="color: #A4AA93; font-size: 11px; margin: 4px 0 0 0;">Your detailed invoice with signed service agreement is attached to this email.</p>
        </div>

        <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 18px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 600; color: #FAF0E2;">SOUVA Mobile Pet Grooming LLC</p>
          <p style="margin: 2px 0;">San Francisco Bay Area & Select East Bay Area CA</p>
          <p style="margin: 4px 0 0 0;">Concierge / WhatsApp: +1 (850) 960-0034</p>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toRecipients.length > 0 ? toRecipients : ["souvamobilepetgrooming@gmail.com"],
        subject: `✨ SOUVA Invoice & Booking Confirmed: ${petName} on ${scheduledDate}`,
        html: htmlContent,
        attachments: [
          {
            filename: pdfFileName,
            content: pdfBase64,
          },
        ],
      }),
    });

    const resendData = await resendResponse.json();
    console.log("Resend confirmation email response status:", resendResponse.status, resendData);

    const emailSent = resendResponse.ok;
    let hint = null;
    if (!resendResponse.ok && resendData?.message?.includes("testing emails")) {
      hint = "Notice: Resend test domain (onboarding@resend.dev) only allows sending to the email registered on your Resend account. To send to any client, verify your domain in Resend Dashboard (resend.com/domains) and set RESEND_FROM_EMAIL in Vercel.";
    }

    // 3. Schedule 30-minute reminder email with Resend
    if (email && scheduledDate && scheduledTime) {
      try {
        const appointmentDate = parseAppointmentTime(scheduledDate, scheduledTime);
        if (appointmentDate) {
          const reminderTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
          const now = new Date();
          const maxSchedule = new Date(now.getTime() + 71 * 60 * 60 * 1000);

          if (reminderTime > now && reminderTime <= maxSchedule) {
            const reminderHtml = `
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
                    <li><strong>Keep Phone Nearby:</strong> Our stylist may text or call you at <strong>${phone}</strong> upon arrival at ${address}.</li>
                    <li><strong>Doorstep Payment:</strong> Payment of <strong>$${estimatedTotal}.00 USD</strong> is collected at your doorstep (Cash, Check, Credit Card, or Zelle).</li>
                  </ul>
                </div>

                <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 18px; line-height: 1.6;">
                  <p style="margin: 0;">Need immediate assistance? Call or text our Concierge at <strong style="color: #FAF0E2;">+1 (850) 960-0034</strong></p>
                  <p style="margin: 4px 0 0 0;">SOUVA Mobile Pet Grooming LLC · San Francisco Bay Area & Select East Bay CA</p>
                </div>
              </div>
            `;

            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: `🚐 SOUVA Alert: We're Arriving in 30 Minutes for ${petName}!`,
                scheduled_at: reminderTime.toISOString(),
                html: reminderHtml,
              }),
            });
          }
        }
      } catch (schedErr) {
        console.warn("Could not auto-schedule 30-min reminder email via Resend:", schedErr);
      }
    }

    // Return the generated PDF base64 so client can download it directly as well
    return res.status(200).json({
      success: true,
      emailSent,
      resendStatus: resendResponse.status,
      resendError: resendResponse.ok ? null : resendData,
      hint,
      fileName: pdfFileName,
      pdfBase64,
    });
  } catch (error: any) {
    console.error("Invoice / Email generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to process booking invoice" });
  }
}

/* -------------------- HELPER: PARSE APPOINTMENT DATETIME -------------------- */
function parseAppointmentTime(scheduledDate: string, scheduledTime: string): Date | null {
  try {
    const now = new Date();
    let target = new Date(now);

    const lowerDate = (scheduledDate || "").toLowerCase();
    if (lowerDate.includes("today")) {
      target = new Date(now);
    } else if (lowerDate.includes("tomorrow")) {
      target = new Date(now);
      target.setDate(now.getDate() + 1);
    } else {
      const parts = scheduledDate.split(",");
      const monthDay = (parts[1] || parts[0]).trim();
      const tokens = monthDay.split(" ");
      if (tokens.length >= 2) {
        const month = tokens[0];
        const day = parseInt(tokens[1], 10);
        if (!isNaN(day)) {
          const year = now.getFullYear();
          const d = new Date(`${month} ${day}, ${year}`);
          if (!isNaN(d.getTime())) {
            target = d;
          }
        }
      }
    }

    const match = (scheduledTime || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    target.setHours(h, m, 0, 0);
    return target;
  } catch {
    return null;
  }
}

/* -------------------- BRANDED PDF INVOICE GENERATOR -------------------- */
async function generateBrandInvoicePdf(b: any): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (595.28 x 841.89 pt)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // SOUVA Brand Color Palette
  const cDarkBg = rgb(0.078, 0.086, 0.059);     // #14160E
  const cCardBg = rgb(0.106, 0.118, 0.082);     // #1B1E15
  const cCardDark = rgb(0.09, 0.10, 0.07);      // #171912
  const cGold = rgb(0.667, 0.545, 0.388);       // #AA8B63
  const cGoldLight = rgb(0.88, 0.78, 0.65);     // Light gold
  const cCream = rgb(0.980, 0.941, 0.886);      // #FAF0E2
  const cMuted = rgb(0.643, 0.667, 0.576);      // #A4AA93
  const cBorder = rgb(0.24, 0.26, 0.20);        // Subtle border

  // Background Fill
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: cDarkBg,
  });

  // Top Header Gold Accent Strip
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width,
    height: 6,
    color: cGold,
  });

  const margin = 40;
  const contentWidth = width - margin * 2;

  // Header Brand Info
  page.drawText("SOUVA", {
    x: margin,
    y: height - 44,
    size: 20,
    font: fontBold,
    color: cGold,
  });

  page.drawText("ELEVATED MOBILE PET GROOMING · SOLAR VAN FLEET", {
    x: margin,
    y: height - 58,
    size: 7.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText("San Francisco Bay Area & Select East Bay CA · +1 (850) 960-0034", {
    x: margin,
    y: height - 70,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  // Invoice Number & Meta on Right Header
  const invoiceNum = `INVOICE #SOU-${Date.now().toString().slice(-6)}`;
  page.drawText(invoiceNum, {
    x: width - margin - 150,
    y: height - 44,
    size: 11,
    font: fontBold,
    color: cCream,
  });

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  page.drawText(`Issue Date: ${todayStr}`, {
    x: width - margin - 150,
    y: height - 58,
    size: 8,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("STATUS: CONFIRMED · DUE AT SERVICE", {
    x: width - margin - 150,
    y: height - 70,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  // Top Divider
  page.drawLine({
    start: { x: margin, y: height - 82 },
    end: { x: width - margin, y: height - 82 },
    thickness: 1,
    color: cBorder,
  });

  let curY = height - 100;

  // ─── BANNER: SCHEDULED APPOINTMENT ───
  page.drawRectangle({
    x: margin,
    y: curY - 42,
    width: contentWidth,
    height: 48,
    color: cCardBg,
    borderColor: cGold,
    borderWidth: 1,
  });

  page.drawText("CONFIRMED DOORSTEP APPOINTMENT WINDOW", {
    x: margin + 14,
    y: curY - 10,
    size: 7.5,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`${b.scheduledDate || "Scheduled Date"}  ·  ${b.scheduledTime || "Arrival Window"}`, {
    x: margin + 14,
    y: curY - 26,
    size: 13,
    font: fontBold,
    color: cCream,
  });

  page.drawText("30-Minute Doorstep Arrival Window · Self-Sufficient Solar Power · Stress-Free One-on-One Care", {
    x: margin + 14,
    y: curY - 38,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  curY -= 60;

  // ─── TWO-COLUMN DOSSIER: CLIENT & PET ───
  const boxWidth = (contentWidth - 12) / 2;
  const boxHeight = 100;

  // Left Box: Client Location
  page.drawRectangle({
    x: margin,
    y: curY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("CLIENT & DOORSTEP DESTINATION", {
    x: margin + 12,
    y: curY - 14,
    size: 7.5,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Parent: ${b.ownerName}`, {
    x: margin + 12,
    y: curY - 30,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Phone: ${b.phone}`, {
    x: margin + 12,
    y: curY - 44,
    size: 8,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Email: ${b.email || "N/A"}`, {
    x: margin + 12,
    y: curY - 56,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText(`Address: ${b.address}`, {
    x: margin + 12,
    y: curY - 70,
    size: 7.5,
    font: fontRegular,
    color: cCream,
  });

  if (b.parkingNotes) {
    page.drawText(`Parking: ${b.parkingNotes}`, {
      x: margin + 12,
      y: curY - 84,
      size: 7,
      font: fontOblique,
      color: cGoldLight,
    });
  }

  // Right Box: Pet Profile
  const rightBoxX = margin + boxWidth + 12;
  page.drawRectangle({
    x: rightBoxX,
    y: curY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("PET COMPANION PROFILE", {
    x: rightBoxX + 12,
    y: curY - 14,
    size: 7.5,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Dog: ${b.petName}  (${b.breed})`, {
    x: rightBoxX + 12,
    y: curY - 30,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Size: ${(b.size || "N/A").toUpperCase()}  ·  Gender: ${(b.gender || "N/A").toUpperCase()}  ·  ${b.petAge}`, {
    x: rightBoxX + 12,
    y: curY - 44,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText(`Coat Condition: ${b.petCondition}`, {
    x: rightBoxX + 12,
    y: curY - 56,
    size: 7.5,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Rabies Vaccine: ${b.vaccinated === "yes" ? "Up to Date (Compliant)" : "In Progress"}`, {
    x: rightBoxX + 12,
    y: curY - 70,
    size: 7.5,
    font: fontRegular,
    color: cCream,
  });

  if (b.medicalConditions && b.medicalConditions !== "None / Healthy") {
    page.drawText(`Medical: ${b.medicalConditions}`, {
      x: rightBoxX + 12,
      y: curY - 84,
      size: 7,
      font: fontOblique,
      color: cCream,
    });
  }

  curY -= boxHeight + 18;

  // ─── ITEMIZED INVOICE TABLE ───
  page.drawText("SERVICE & TREATMENT BREAKDOWN", {
    x: margin,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: cGold,
  });
  curY -= 8;

  // Table Header Row
  page.drawRectangle({
    x: margin,
    y: curY - 18,
    width: contentWidth,
    height: 20,
    color: cCardDark,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("ITEM DESCRIPTION / SPECIFICATION", {
    x: margin + 10,
    y: curY - 13,
    size: 7.5,
    font: fontBold,
    color: cMuted,
  });

  page.drawText("CATEGORY", {
    x: margin + 320,
    y: curY - 13,
    size: 7.5,
    font: fontBold,
    color: cMuted,
  });

  page.drawText("AMOUNT (USD)", {
    x: width - margin - 80,
    y: curY - 13,
    size: 7.5,
    font: fontBold,
    color: cMuted,
  });

  curY -= 20;

  // Row 1: Primary Package
  const pkgRowHeight = 36;
  page.drawRectangle({
    x: margin,
    y: curY - pkgRowHeight,
    width: contentWidth,
    height: pkgRowHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.5,
  });

  page.drawText(b.packageName || "Signature Grooming Experience", {
    x: margin + 10,
    y: curY - 14,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText("Hydro-massage bath, blow-dry, ear cleaning, nail trim & precision styling", {
    x: margin + 10,
    y: curY - 26,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("Primary Service", {
    x: margin + 320,
    y: curY - 14,
    size: 7.5,
    font: fontRegular,
    color: cCream,
  });

  const totalCost = Number(b.estimatedTotal) || 125;
  const upgradesCount = Array.isArray(b.addons) ? b.addons.length : 0;
  const approxUpgradesCost = upgradesCount * 15;
  const basePrice = Math.max(50, totalCost - approxUpgradesCost);

  page.drawText(`$${basePrice}.00`, {
    x: width - margin - 75,
    y: curY - 14,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  curY -= pkgRowHeight;

  // Rows for Addons
  if (Array.isArray(b.addons) && b.addons.length > 0) {
    for (const addon of b.addons) {
      const addRowHeight = 22;
      page.drawRectangle({
        x: margin,
        y: curY - addRowHeight,
        width: contentWidth,
        height: addRowHeight,
        color: cCardBg,
        borderColor: cBorder,
        borderWidth: 0.5,
      });

      page.drawText(`+ ${addon}`, {
        x: margin + 14,
        y: curY - 14,
        size: 8,
        font: fontRegular,
        color: cCream,
      });

      page.drawText("Spa Upgrade", {
        x: margin + 320,
        y: curY - 14,
        size: 7.5,
        font: fontRegular,
        color: cGoldLight,
      });

      page.drawText("$15.00", {
        x: width - margin - 75,
        y: curY - 14,
        size: 8,
        font: fontRegular,
        color: cGoldLight,
      });

      curY -= addRowHeight;
    }
  }

  // Complimentary Solar Travel Row
  const feeRowHeight = 20;
  page.drawRectangle({
    x: margin,
    y: curY - feeRowHeight,
    width: contentWidth,
    height: feeRowHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.5,
  });

  page.drawText("Doorstep Travel & Clean Solar Energy Power", {
    x: margin + 10,
    y: curY - 13,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("Fleet Logistics", {
    x: margin + 320,
    y: curY - 13,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("FREE ($0.00)", {
    x: width - margin - 75,
    y: curY - 13,
    size: 7.5,
    font: fontBold,
    color: cGold,
  });

  curY -= feeRowHeight;

  // Total Summary Box
  const totalBoxHeight = 36;
  page.drawRectangle({
    x: margin,
    y: curY - totalBoxHeight,
    width: contentWidth,
    height: totalBoxHeight,
    color: cCardDark,
    borderColor: cGold,
    borderWidth: 1,
  });

  page.drawText("TOTAL ESTIMATED DUE AT DOORSTEP:", {
    x: margin + 12,
    y: curY - 15,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText("Payment collected upon service completion: Cash, Check, Credit Card or Zelle", {
    x: margin + 12,
    y: curY - 27,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText(`$${totalCost}.00 USD`, {
    x: width - margin - 105,
    y: curY - 22,
    size: 13,
    font: fontBold,
    color: cGold,
  });

  curY -= totalBoxHeight + 16;

  // ─── SERVICE AGREEMENT & SIGNATURE SECTION ───
  page.drawText("SIGNED PET CARE SERVICE AGREEMENT", {
    x: margin,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: cGold,
  });
  curY -= 6;

  // Agreement Terms Text Box
  const agreeHeight = 74;
  page.drawRectangle({
    x: margin,
    y: curY - agreeHeight,
    width: contentWidth,
    height: agreeHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  const legalLines = [
    "• Pets are accepted for grooming only under the circumstances that the pet is fit and healthy.",
    "• Grooming on an elderly or infirm pet is at owner's risk and may expose pre-existing conditions for which Souva is not liable.",
    "• Pet's rabies vaccine is confirmed up to date (as required by law) unless otherwise discussed.",
    "• In an emergency in your absence, owner authorizes Souva to contact the nearest Vet and treat the pet at owner's expense.",
    "• Payment is to be made at time of service via Cash, Check, Credit Card or Zelle.",
  ];

  let lineY = curY - 14;
  for (const line of legalLines) {
    page.drawText(line, {
      x: margin + 10,
      y: lineY,
      size: 6.8,
      font: fontRegular,
      color: cMuted,
    });
    lineY -= 11.5;
  }

  curY -= agreeHeight + 8;

  // Signature Block
  const sigBoxHeight = 52;
  page.drawRectangle({
    x: margin,
    y: curY - sigBoxHeight,
    width: contentWidth,
    height: sigBoxHeight,
    color: cCardDark,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("DIGITAL SIGNATURE ACCEPTANCE", {
    x: margin + 12,
    y: curY - 14,
    size: 7.5,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Authorized by: ${b.ownerName}`, {
    x: margin + 12,
    y: curY - 26,
    size: 8.5,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Timestamp: ${new Date().toLocaleString("en-US")} · IP Doorstep Record Verified`, {
    x: margin + 12,
    y: curY - 38,
    size: 6.8,
    font: fontRegular,
    color: cMuted,
  });

  // Embed customer's actual drawn signature if provided
  if (b.signature && typeof b.signature === "string" && b.signature.includes("base64,")) {
    try {
      const base64Data = b.signature.split("base64,")[1];
      const imageBytes = Buffer.from(base64Data, "base64");
      const sigImage = await pdfDoc.embedPng(imageBytes);
      page.drawImage(sigImage, {
        x: width - margin - 150,
        y: curY - 46,
        width: 130,
        height: 40,
      });
    } catch (e) {
      page.drawText("[Digitally Signed by Owner]", {
        x: width - margin - 140,
        y: curY - 28,
        size: 8,
        font: fontBold,
        color: cGold,
      });
    }
  } else {
    page.drawText("[Digitally Signed by Owner]", {
      x: width - margin - 140,
      y: curY - 28,
      size: 8,
      font: fontBold,
      color: cGold,
    });
  }

  // Bottom Footer
  page.drawLine({
    start: { x: margin, y: 32 },
    end: { x: width - margin, y: 32 },
    thickness: 0.8,
    color: cBorder,
  });

  page.drawText("SOUVA MOBILE PET GROOMING LLC · Official Doorstep Care Invoice & Service Receipt · Page 1 of 1", {
    x: margin + 35,
    y: 18,
    size: 6.8,
    font: fontRegular,
    color: cMuted,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
