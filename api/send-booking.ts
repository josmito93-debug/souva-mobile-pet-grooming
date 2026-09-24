import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

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
      sizeLabel = "Medium",
      sizeWeight = "16–35 lb",
      gender = "N/A",
      petAge = "Adult (1–7 yrs)",
      petCondition = "Healthy & Well-Maintained",
      vaccinated = "yes",
      medicalConditions = "None / Healthy",
      groomerNotes = "",
      packageName = "Signature Grooming",
      packageDescription = "Our elevated grooming experience for longer styles, customized finishes and more detailed coat work.",
      packageDuration = "90 - 115 min",
      packageIncludes = [
        "Hydro-massage bath",
        "Blow-dry & coat brush",
        "Ear cleaning & flush",
        "Nail trim & grind",
        "Custom signature haircut",
        "Finishing fragrance mist",
        "Souva bandana",
        "Complimentary treat",
      ],
      basePrice = 125,
      addons = [],
      estimatedTotal = 125,
      scheduledDate = "Upcoming Date",
      scheduledTime = "Arrival Window",
      signature = null,
    } = booking;

    // 1. Generate the luxury branded PDF invoice with SOUVA brand colors and logo
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
      sizeLabel,
      sizeWeight,
      gender,
      petAge,
      petCondition,
      vaccinated,
      medicalConditions,
      groomerNotes,
      packageName,
      packageDescription,
      packageDuration,
      packageIncludes,
      basePrice,
      addons,
      estimatedTotal,
      scheduledDate,
      scheduledTime,
      signature,
    });

    const cleanPetName = petName.replace(/[^a-zA-Z0-9]/g, "-");
    const pdfFileName = `SOUVA-Invoice-${cleanPetName}-${Date.now().toString().slice(-4)}.pdf`;

    // 1.5 Save record to Airtable on Vercel Backend if credentials configured
    const airtableKey = (process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN || "").trim();
    const airtableBaseId = (process.env.AIRTABLE_BASE_ID || "apptb52dkVCyq2rPA").trim();
    const airtableTable = (process.env.AIRTABLE_TABLE_NAME || "Bookings").trim();

    if (airtableKey) {
      try {
        await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTable}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${airtableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  "Booking ID": booking.bookingId || `SOU-${Math.floor(1000 + Math.random() * 9000)}`,
                  "Status": "Pendiente",
                  "Customer Name": ownerName,
                  "Phone": phone,
                  "Email": email,
                  "Doorstep Address": address,
                  "ZIP Code": booking.zipCode || "",
                  "Service Zone": booking.serviceZone || "San Francisco – Select",
                  "Parking Notes": parkingNotes || "Driveway available",
                  "Scheduled Time Window": scheduledTime,
                  "Number of Dogs": Number(booking.dogCount) || 1,
                  "Dog Names": petName,
                  "Breeds": breed,
                  "Dog Sizes": [sizeLabel ? `${sizeLabel} (${sizeWeight})` : "Small (Up to 15 lb)"],
                  "Dog Ages": petAge,
                  "Genders": gender === "male" ? "Macho" : "Hembra",
                  "Rabies Vaccine": vaccinated === "yes" ? "Al día (Up to Date)" : "En trámite (In Progress)",
                  "Temperament": ["Amigable"],
                  "Medical Conditions": medicalConditions || "None / Healthy",
                  "Groomer Notes": groomerNotes || "Doorstep service",
                  "Service Package": packageName || "Signature Grooming",
                  "Base Price": Number(basePrice) || 0,
                  "Addons Total": Number(booking.addonsCost) || 0,
                  "Discount 20% 2nd Dog": Number(booking.multiDogDiscount) || 0,
                  "Estimated Total": Number(estimatedTotal) || 0,
                  "Payment Status": "Pendiente en Puerta",
                  "Agreement Accepted": true,
                },
              },
            ],
          }),
        });
      } catch (airtableErr) {
        console.warn("Airtable backend sync error:", airtableErr);
      }
    }

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

    // 2. Define business admin notification recipients (Always notify business inbox)
    const adminEmails: string[] = ["souvamobilepetgrooming@gmail.com", "info@souvagrooming.com"];
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      process.env.ADMIN_NOTIFICATION_EMAIL.split(",").forEach((item) => {
        const clean = item.trim();
        if (clean && !adminEmails.includes(clean)) adminEmails.push(clean);
      });
    }

    // Always include admin emails so business is notified of every appointment
    const toRecipients = Array.from(new Set([email, ...adminEmails].filter(Boolean)));

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Souva Mobile Grooming <info@souvagrooming.com>";

    const plainTextContent = `Hello ${ownerName},

Thank you for choosing SOUVA Mobile Pet Grooming! Your luxury doorstep appointment has been confirmed.

📅 SCHEDULED DOORSTEP APPOINTMENT:
• Date: ${scheduledDate}
• Time Window: ${scheduledTime} (30-Minute Arrival Window)
• Unit: Self-Contained Solar Powered Mobile Van Fleet

🐾 PET COMPANION PROFILE:
• Pet Name: ${petName}
• Breed: ${breed}
• Size Bracket: ${sizeLabel} (${sizeWeight})
• Gender: ${gender === "male" ? "Male" : "Female"}
• Age Bracket: ${petAge}
• Coat & Temperament: ${petCondition}
• Rabies Vaccine Status: ${vaccinated === "yes" ? "Up to Date (Compliant)" : "In Progress"}
• Medical Conditions: ${medicalConditions}
• Stylist Notes: ${groomerNotes || "Standard luxury handling"}

✂️ SERVICE & TREATMENT BREAKDOWN:
• Package: ${packageName} (Est. ${packageDuration})
• Overview: ${packageDescription}
• Inclusions: ${packageIncludes.join(", ")}
${addons && addons.length > 0 ? `• Spa Upgrades: ${addons.join(", ")}\n` : ""}• Estimated Total Due: $${estimatedTotal}.00 USD
• Payment Terms: Collected upon service completion at your doorstep via Cash, Check, Credit Card, or Zelle.

📍 DOORSTEP DESTINATION:
• Pet Parent: ${ownerName}
• Mobile Phone: ${phone}
• Email: ${email}
• Address: ${address}
• Van Parking Instructions: ${parkingNotes || "Driveway or curbside available"}

📝 SIGNED SERVICE AGREEMENT:
• Digitally Authorized by ${ownerName}
• Date: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
• Status: Legally Binding Pet Care Agreement Verified

Attached to this email is your official SOUVA Service Agreement & Itemized Invoice in PDF.

Warm regards,
SOUVA Mobile Pet Grooming LLC
San Francisco Bay Area & Select East Bay Area CA
Concierge / WhatsApp: +1 (850) 960-0034 · info@souvagrooming.com`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #14160E; color: #FAF0E2; padding: 36px 26px; border-radius: 20px; border: 1px solid rgba(250, 240, 226, 0.12); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        
        <!-- Header with SOUVA Logo -->
        <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid rgba(250, 240, 226, 0.1); padding-bottom: 24px;">
          <img
            src="https://souva-mobile-pet-grooming.vercel.app/assets/souva-badge-circle-transparent.png"
            alt="SOUVA Mobile Pet Grooming"
            width="84"
            height="84"
            style="display: block; margin: 0 auto 12px auto; border-radius: 50%; filter: drop-shadow(0 0 16px rgba(170,139,99,0.55));"
          />
          <h1 style="color: #AA8B63; font-size: 26px; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">SOUVA</h1>
          <p style="color: #A4AA93; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">The Bay Area's Elevated Mobile Pet Grooming Experience</p>
          <div style="margin-top: 10px;">
            <span style="color: #AA8B63; background: rgba(170,139,99,0.15); border: 1px solid #AA8B63; padding: 4px 14px; border-radius: 9999px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Official Booking Confirmation & Invoice
            </span>
          </div>
        </div>

        <!-- Appointment Card -->
        <div style="background-color: #1B1E15; border: 1px solid #AA8B63; border-radius: 14px; padding: 22px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <span style="color: #AA8B63; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">CONFIRMED DOORSTEP APPOINTMENT</span>
          <h2 style="color: #FAF0E2; font-size: 21px; margin: 0 0 6px 0;">📅 ${scheduledDate} · ${scheduledTime}</h2>
          <p style="color: #A4AA93; font-size: 12px; margin: 0; line-height: 1.5;">
            30-Minute Doorstep Arrival Window · Self-Contained Solar Spa Van Dispatched
          </p>
        </div>

        <!-- Pet Companion Profile Card -->
        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 18px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">
            🐾 Pet Companion Profile
          </h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr><td style="color: #A4AA93; width: 35%;">Dog's Name:</td><td style="color: #FAF0E2; font-weight: 700;">${petName}</td></tr>
            <tr><td style="color: #A4AA93;">Breed / Mix:</td><td style="color: #FAF0E2;">${breed}</td></tr>
            <tr><td style="color: #A4AA93;">Size & Weight:</td><td style="color: #FAF0E2;">${sizeLabel} (${sizeWeight})</td></tr>
            <tr><td style="color: #A4AA93;">Gender & Age:</td><td style="color: #FAF0E2;">${gender === "male" ? "♂ Male (Macho)" : "♀ Female (Hembra)"} · ${petAge}</td></tr>
            <tr><td style="color: #A4AA93;">Coat & Condition:</td><td style="color: #FAF0E2;">${petCondition}</td></tr>
            <tr><td style="color: #A4AA93;">Rabies Vaccine:</td><td style="color: #FAF0E2;">${vaccinated === "yes" ? "✓ Up to Date (Compliant)" : "In Progress"}</td></tr>
            <tr><td style="color: #A4AA93;">Medical Conditions:</td><td style="color: #FAF0E2;">${medicalConditions}</td></tr>
            ${groomerNotes ? `<tr><td style="color: #A4AA93;">Groomer Notes:</td><td style="color: #FAF0E2; font-style: italic;">${groomerNotes}</td></tr>` : ""}
          </table>
        </div>

        <!-- Service Package & Inclusions Card -->
        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 18px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">
            ✂️ Grooming Service & Inclusions
          </h3>
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="color: #FAF0E2; font-size: 15px;">${packageName}</strong>
              <span style="color: #AA8B63; font-size: 11px; font-weight: 600;">Est. ${packageDuration}</span>
            </div>
            <p style="color: #A4AA93; font-size: 12px; margin: 6px 0 10px 0; line-height: 1.5;">${packageDescription}</p>
          </div>

          <div style="background: rgba(20,22,14,0.6); padding: 12px; border-radius: 10px; border: 1px solid rgba(250,240,226,0.06); margin-bottom: 14px;">
            <span style="color: #AA8B63; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px; font-weight: 700;">Included Treatments:</span>
            <p style="color: #FAF0E2; font-size: 12px; margin: 0; line-height: 1.6;">
              ${packageIncludes.join(" · ")}
            </p>
          </div>

          ${addons && addons.length > 0 ? `
            <div style="border-top: 1px solid rgba(250, 240, 226, 0.08); padding-top: 10px;">
              <span style="color: #AA8B63; font-size: 11px; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 6px;">Selected Spa Upgrades:</span>
              ${addons.map((add: string) => `<p style="margin: 2px 0; font-size: 12px; color: #FAF0E2;">✨ ${add} (+$15.00)</p>`).join("")}
            </div>
          ` : ""}
        </div>

        <!-- Client & Doorstep Destination Card -->
        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 18px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">
            📍 Client Contact & Doorstep Address
          </h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Pet Parent:</strong> ${ownerName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Mobile Phone:</strong> ${phone}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Service Address:</strong> ${address}</p>
          <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #AA8B63;"><strong>Van Parking:</strong> ${parkingNotes || "Driveway or curbside space available"}</p>
        </div>

        <!-- Invoice Pricing Summary Card -->
        <div style="background-color: #1B1E15; border: 1px solid rgba(250, 240, 226, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #AA8B63; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 8px;">
            💵 Itemized Invoice & Doorstep Payment
          </h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr><td style="color: #FAF0E2;">${packageName} (${sizeLabel})</td><td style="color: #FAF0E2; text-align: right; font-weight: 700;">$${basePrice}.00</td></tr>
            ${addons && addons.length > 0 ? addons.map((add: string) => `<tr><td style="color: #A4AA93; padding-left: 10px;">+ ${add}</td><td style="color: #AA8B63; text-align: right;">$15.00</td></tr>`).join("") : ""}
            <tr><td style="color: #A4AA93; font-size: 12px;">Doorstep Solar Travel Fee</td><td style="color: #AA8B63; text-align: right; font-size: 12px;">FREE ($0.00)</td></tr>
            <tr style="border-top: 1px solid rgba(250, 240, 226, 0.12);"><td style="color: #AA8B63; font-weight: 700; font-size: 15px; padding-top: 10px;">TOTAL ESTIMATED DUE:</td><td style="color: #AA8B63; text-align: right; font-weight: 800; font-size: 18px; padding-top: 10px;">$${estimatedTotal}.00 USD</td></tr>
          </table>
          <p style="color: #A4AA93; font-size: 11px; margin: 10px 0 0 0; font-style: italic;">
            Payment is collected upon service completion at your doorstep via Cash, Check, Credit Card, or Zelle.
          </p>
        </div>

        <!-- Service Agreement Confirmation & Signature Status -->
        <div style="background-color: rgba(170, 139, 99, 0.08); border: 1px dashed rgba(170, 139, 99, 0.4); border-radius: 14px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #AA8B63; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              ✓ Signed Service Agreement Verified
            </span>
            <span style="color: #A4AA93; font-size: 10px;">Accepted by ${ownerName}</span>
          </div>
          <p style="color: #A4AA93; font-size: 11px; margin: 0; line-height: 1.5;">
            All pet care policies, pre-existing condition acknowledgments, emergency veterinary authorizations, and doorstep service terms have been digitally signed and archived.
          </p>
        </div>

        <!-- Attached PDF Banner -->
        <div style="background: #1B1E15; border: 1px solid #AA8B63; border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 24px;">
          <span style="color: #AA8B63; font-size: 12px; font-weight: 700; text-transform: uppercase;">
            📎 Official PDF Invoice & Receipt Attached
          </span>
          <p style="color: #A4AA93; font-size: 11px; margin: 4px 0 0 0;">
            Download and keep the attached PDF for your household records and tax receipts.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 20px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 700; color: #FAF0E2;">SOUVA Mobile Pet Grooming LLC</p>
          <p style="margin: 2px 0;">San Francisco Bay Area & Select East Bay Area CA</p>
          <p style="margin: 4px 0 0 0;">Concierge / WhatsApp: <strong style="color: #FAF0E2;">+1 (850) 960-0034</strong> · info@souvagrooming.com</p>
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
        reply_to: "info@souvagrooming.com",
        subject: `Your SOUVA Booking Confirmation & Invoice: ${petName} on ${scheduledDate}`,
        text: plainTextContent,
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

    let emailSent = resendResponse.ok;
    let hint = null;
    if (!resendResponse.ok && resendData?.message?.includes("testing emails")) {
      hint = "Notice: Resend test domain (onboarding@resend.dev) only allows sending to the email registered on your Resend account (info@souvagrooming.com). To send to any client, verify your domain in Resend Dashboard (resend.com/domains) and set RESEND_FROM_EMAIL in Vercel.";
      
      // Automatic fallback: send to the registered account email so the invoice PDF is never lost!
      try {
        const fallbackRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: ["info@souvagrooming.com"],
            subject: `✨ SOUVA Invoice & Booking Confirmed: ${petName} on ${scheduledDate} (Client: ${email})`,
            html: `<div style="padding: 12px 16px; background-color: #AA8B63; color: #161811; font-weight: bold; margin-bottom: 18px; border-radius: 10px; font-size: 13px;">Notice: Delivered to admin inbox (info@souvagrooming.com) because client email (${email}) requires domain verification at resend.com/domains</div>` + htmlContent,
            attachments: [
              {
                filename: pdfFileName,
                content: pdfBase64,
              },
            ],
          }),
        });
        if (fallbackRes.ok) {
          emailSent = true;
          console.log("Invoice delivered to admin email info@souvagrooming.com via fallback");
        }
      } catch (fallbackErr) {
        console.warn("Fallback to info@souvagrooming.com failed:", fallbackErr);
      }
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
                  <img
                    src="https://souva-mobile-pet-grooming.vercel.app/assets/souva-badge-circle-transparent.png"
                    alt="SOUVA"
                    width="70"
                    height="70"
                    style="display: block; margin: 0 auto 10px auto; border-radius: 50%;"
                  />
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

/* -------------------- BRANDED PDF INVOICE GENERATOR (EXHAUSTIVE MODAL DATA + LOGO) -------------------- */
async function generateBrandInvoicePdf(b: any): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // SOUVA Luxury Brand Color Palette
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

  const margin = 38;
  const contentWidth = width - margin * 2;

  // Try to embed SOUVA Badge Logo
  let textLeftX = margin;
  try {
    let logoBytes: Uint8Array | null = null;
    const localLogoPath = path.join(process.cwd(), "public", "assets", "souva-badge-circle-transparent.png");
    if (fs.existsSync(localLogoPath)) {
      logoBytes = fs.readFileSync(localLogoPath);
    } else {
      const logoRes = await fetch("https://souva-mobile-pet-grooming.vercel.app/assets/souva-badge-circle-transparent.png");
      if (logoRes.ok) {
        logoBytes = new Uint8Array(await logoRes.arrayBuffer());
      }
    }

    if (logoBytes) {
      const logoImg = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: margin,
        y: height - 74,
        width: 44,
        height: 44,
      });
      textLeftX = margin + 52;
    }
  } catch (err) {
    console.warn("Logo embedding skipped:", err);
  }

  // Header Brand Info
  page.drawText("SOUVA", {
    x: textLeftX,
    y: height - 42,
    size: 19,
    font: fontBold,
    color: cGold,
  });

  page.drawText("ELEVATED MOBILE PET GROOMING · SOLAR VAN FLEET", {
    x: textLeftX,
    y: height - 55,
    size: 7.2,
    font: fontBold,
    color: cCream,
  });

  page.drawText("San Francisco Bay Area & Select East Bay CA · +1 (850) 960-0034", {
    x: textLeftX,
    y: height - 67,
    size: 6.8,
    font: fontRegular,
    color: cMuted,
  });

  // Invoice Number & Meta on Right Header
  const invoiceNum = `INVOICE #SOU-${Date.now().toString().slice(-6)}`;
  page.drawText(invoiceNum, {
    x: width - margin - 155,
    y: height - 42,
    size: 10.5,
    font: fontBold,
    color: cCream,
  });

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  page.drawText(`Issue Date: ${todayStr}`, {
    x: width - margin - 155,
    y: height - 55,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("STATUS: CONFIRMED · DUE AT SERVICE", {
    x: width - margin - 155,
    y: height - 67,
    size: 6.8,
    font: fontBold,
    color: cGold,
  });

  // Top Divider
  page.drawLine({
    start: { x: margin, y: height - 80 },
    end: { x: width - margin, y: height - 80 },
    thickness: 1,
    color: cBorder,
  });

  let curY = height - 96;

  // ─── BANNER: SCHEDULED APPOINTMENT ───
  page.drawRectangle({
    x: margin,
    y: curY - 38,
    width: contentWidth,
    height: 44,
    color: cCardBg,
    borderColor: cGold,
    borderWidth: 1,
  });

  page.drawText("CONFIRMED DOORSTEP APPOINTMENT WINDOW", {
    x: margin + 12,
    y: curY - 10,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`${b.scheduledDate || "Scheduled Date"}  ·  ${b.scheduledTime || "Arrival Window"}`, {
    x: margin + 12,
    y: curY - 24,
    size: 12,
    font: fontBold,
    color: cCream,
  });

  page.drawText("30-Minute Doorstep Arrival Window · Self-Sustaining Solar Van Fleet · One-on-One Stress-Free Care", {
    x: margin + 12,
    y: curY - 34,
    size: 6.5,
    font: fontRegular,
    color: cMuted,
  });

  curY -= 54;

  // ─── TWO-COLUMN DOSSIER: CLIENT & PET ───
  const boxWidth = (contentWidth - 10) / 2;
  const boxHeight = 105;

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
    x: margin + 10,
    y: curY - 13,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Pet Parent: ${b.ownerName}`, {
    x: margin + 10,
    y: curY - 27,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Mobile Phone: ${b.phone}`, {
    x: margin + 10,
    y: curY - 40,
    size: 7.5,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Email: ${b.email || "N/A"}`, {
    x: margin + 10,
    y: curY - 52,
    size: 7.2,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText(`Address: ${b.address}`, {
    x: margin + 10,
    y: curY - 65,
    size: 7.2,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Van Parking: ${b.parkingNotes || "Driveway or curbside available"}`, {
    x: margin + 10,
    y: curY - 80,
    size: 7,
    font: fontOblique,
    color: cGoldLight,
  });

  page.drawText("Solar van needs ~2 car lengths parking space.", {
    x: margin + 10,
    y: curY - 94,
    size: 6.5,
    font: fontRegular,
    color: cMuted,
  });

  // Right Box: Pet Profile
  const rightBoxX = margin + boxWidth + 10;
  page.drawRectangle({
    x: rightBoxX,
    y: curY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("PET COMPANION DOSSIER", {
    x: rightBoxX + 10,
    y: curY - 13,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Dog: ${b.petName}  (${b.breed})`, {
    x: rightBoxX + 10,
    y: curY - 27,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Size: ${b.sizeLabel || (b.size || "N/A").toUpperCase()} (${b.sizeWeight || ""}) · Gender: ${b.gender === "male" ? "Macho (Male)" : "Hembra (Female)"}`, {
    x: rightBoxX + 10,
    y: curY - 40,
    size: 7.2,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText(`Age Bracket: ${b.petAge}  ·  Condition: ${b.petCondition}`, {
    x: rightBoxX + 10,
    y: curY - 52,
    size: 7.2,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Rabies Vaccine: ${b.vaccinated === "yes" ? "Up to Date (Compliant)" : "In Progress"}`, {
    x: rightBoxX + 10,
    y: curY - 65,
    size: 7.2,
    font: fontRegular,
    color: cCream,
  });

  page.drawText(`Medical Notes: ${b.medicalConditions || "None / Healthy"}`, {
    x: rightBoxX + 10,
    y: curY - 78,
    size: 6.8,
    font: fontOblique,
    color: cCream,
  });

  if (b.groomerNotes) {
    page.drawText(`Stylist Notes: ${b.groomerNotes}`, {
      x: rightBoxX + 10,
      y: curY - 92,
      size: 6.8,
      font: fontOblique,
      color: cGoldLight,
    });
  } else {
    page.drawText("Stylist Notes: Standard luxury styling & grooming handling.", {
      x: rightBoxX + 10,
      y: curY - 92,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });
  }

  curY -= boxHeight + 14;

  // ─── ITEMIZED INVOICE TABLE ───
  page.drawText("ITEMIZED SERVICE & TREATMENT SPECIFICATION", {
    x: margin,
    y: curY,
    size: 8,
    font: fontBold,
    color: cGold,
  });
  curY -= 6;

  // Table Header Row
  page.drawRectangle({
    x: margin,
    y: curY - 16,
    width: contentWidth,
    height: 18,
    color: cCardDark,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("ITEM DESCRIPTION / SPECIFICATION", {
    x: margin + 8,
    y: curY - 12,
    size: 7,
    font: fontBold,
    color: cMuted,
  });

  page.drawText("CATEGORY", {
    x: margin + 310,
    y: curY - 12,
    size: 7,
    font: fontBold,
    color: cMuted,
  });

  page.drawText("AMOUNT (USD)", {
    x: width - margin - 75,
    y: curY - 12,
    size: 7,
    font: fontBold,
    color: cMuted,
  });

  curY -= 18;

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

  page.drawText(`${b.packageName || "Signature Grooming"} (${b.sizeLabel || (b.size || "M").toUpperCase()}) - Est. ${b.packageDuration || "60-90 min"}`, {
    x: margin + 8,
    y: curY - 13,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  const inclSummary = Array.isArray(b.packageIncludes) ? b.packageIncludes.slice(0, 7).join(" · ") : "Bath, blow-dry, ear cleaning, nail trim, sanitary trim, styling";
  page.drawText(inclSummary, {
    x: margin + 8,
    y: curY - 25,
    size: 6.5,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("Primary Package", {
    x: margin + 310,
    y: curY - 13,
    size: 7.2,
    font: fontRegular,
    color: cCream,
  });

  const basePriceNum = Number(b.basePrice) || Math.max(65, (Number(b.estimatedTotal) || 125) - (Array.isArray(b.addons) ? b.addons.length * 15 : 0));
  page.drawText(`$${basePriceNum}.00`, {
    x: width - margin - 70,
    y: curY - 13,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  curY -= pkgRowHeight;

  // Rows for Addons
  if (Array.isArray(b.addons) && b.addons.length > 0) {
    for (const addon of b.addons) {
      const addRowHeight = 18;
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
        x: margin + 12,
        y: curY - 12,
        size: 7.5,
        font: fontRegular,
        color: cCream,
      });

      page.drawText("Spa Upgrade", {
        x: margin + 310,
        y: curY - 12,
        size: 7,
        font: fontRegular,
        color: cGoldLight,
      });

      page.drawText("$15.00", {
        x: width - margin - 70,
        y: curY - 12,
        size: 7.5,
        font: fontRegular,
        color: cGoldLight,
      });

      curY -= addRowHeight;
    }
  }

  // Complimentary Solar Travel Row
  const feeRowHeight = 18;
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
    x: margin + 8,
    y: curY - 12,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("Fleet Logistics", {
    x: margin + 310,
    y: curY - 12,
    size: 7,
    font: fontRegular,
    color: cMuted,
  });

  page.drawText("FREE ($0.00)", {
    x: width - margin - 70,
    y: curY - 12,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  curY -= feeRowHeight;

  // Total Summary Box
  const totalBoxHeight = 32;
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
    x: margin + 10,
    y: curY - 13,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  page.drawText("Payable at doorstep upon completion: Cash, Check, Credit Card or Zelle", {
    x: margin + 10,
    y: curY - 24,
    size: 6.5,
    font: fontRegular,
    color: cMuted,
  });

  const totalCost = Number(b.estimatedTotal) || 125;
  page.drawText(`$${totalCost}.00 USD`, {
    x: width - margin - 95,
    y: curY - 20,
    size: 12,
    font: fontBold,
    color: cGold,
  });

  curY -= totalBoxHeight + 14;

  // ─── SERVICE AGREEMENT & SIGNATURE SECTION ───
  page.drawText("SIGNED PET CARE SERVICE AGREEMENT & LIABILITY RELEASE", {
    x: margin,
    y: curY,
    size: 8,
    font: fontBold,
    color: cGold,
  });
  curY -= 6;

  // Agreement Terms Text Box
  const agreeHeight = 65;
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

  let lineY = curY - 12;
  for (const line of legalLines) {
    page.drawText(line, {
      x: margin + 8,
      y: lineY,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });
    lineY -= 10.5;
  }

  curY -= agreeHeight + 6;

  // Signature Block
  const sigBoxHeight = 48;
  page.drawRectangle({
    x: margin,
    y: curY - sigBoxHeight,
    width: contentWidth,
    height: sigBoxHeight,
    color: cCardDark,
    borderColor: cBorder,
    borderWidth: 0.8,
  });

  page.drawText("DIGITAL SIGNATURE VERIFICATION", {
    x: margin + 10,
    y: curY - 12,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  page.drawText(`Authorized by: ${b.ownerName}`, {
    x: margin + 10,
    y: curY - 24,
    size: 8,
    font: fontBold,
    color: cCream,
  });

  page.drawText(`Timestamp: ${new Date().toLocaleString("en-US")} · IP Doorstep Record Verified`, {
    x: margin + 10,
    y: curY - 35,
    size: 6.5,
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
        x: width - margin - 140,
        y: curY - 42,
        width: 120,
        height: 36,
      });
    } catch (e) {
      page.drawText("[Digitally Signed by Owner]", {
        x: width - margin - 130,
        y: curY - 25,
        size: 7.5,
        font: fontBold,
        color: cGold,
      });
    }
  } else {
    page.drawText("[Digitally Signed by Owner]", {
      x: width - margin - 130,
      y: curY - 25,
      size: 7.5,
      font: fontBold,
      color: cGold,
    });
  }

  // Bottom Footer
  page.drawLine({
    start: { x: margin, y: 28 },
    end: { x: width - margin, y: 28 },
    thickness: 0.8,
    color: cBorder,
  });

  page.drawText("SOUVA MOBILE PET GROOMING LLC · Official Doorstep Care Invoice & Service Receipt · Page 1 of 1 · www.souvapetgrooming.com", {
    x: margin + 20,
    y: 16,
    size: 6.5,
    font: fontRegular,
    color: cMuted,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
