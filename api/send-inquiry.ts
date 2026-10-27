export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    ""
  ).trim();

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse body string:", e);
      }
    }
    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString("utf-8"));
      } catch (e) {
        console.error("Failed to parse buffer body:", e);
      }
    }
    if (!body || typeof body !== "object") {
      body = {};
    }

    const {
      name = "Valued Pet Parent",
      email = "",
      phone = "",
      petName = "",
      petBreed = "",
      zipCode = "",
      question = "",
      category = "General Inquiry",
    } = body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question/message is required." });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    const submissionTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "full",
      timeStyle: "short",
    });

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "SOUVA Mobile Grooming <info@souvagrooming.com>";
    const staffRecipient = "souvamobilepetgrooming@gmail.com";

    // Plaintext Fallback
    const plainText = `
🐾 NEW CLIENT INQUIRY - SOUVA MOBILE PET GROOMING
===================================================

Received: ${submissionTime} PST
Category: ${category}

CLIENT DETAILS:
• Name: ${name}
• Email: ${email}
• Phone: ${phone || "Not provided"}
• ZIP Code: ${zipCode || "Not specified"}

PET DETAILS:
• Pet Name: ${petName || "Not provided"}
• Breed: ${petBreed || "Not provided"}

QUESTION / INQUIRY:
${question}

===================================================
Reply directly to this email to respond to ${name} (${email}).
`;

    // High-End Luxury HTML Email Template
    const htmlEmail = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #14160E; color: #FAF0E2; padding: 36px 24px; border-radius: 20px; border: 1px solid rgba(250, 240, 226, 0.12); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 26px; border-bottom: 1px solid rgba(250, 240, 226, 0.1); padding-bottom: 22px;">
          <img
            src="https://www.souvagrooming.com/assets/souva-badge-circle-transparent.png"
            alt="SOUVA Mobile Pet Grooming"
            width="80"
            height="80"
            style="display: block; margin: 0 auto 12px auto; border-radius: 50%; filter: drop-shadow(0 0 16px rgba(170,139,99,0.55));"
          />
          <h1 style="color: #AA8B63; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">SOUVA</h1>
          <p style="color: #A4AA93; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">New Client Inquiry & Question Box</p>
          <div style="margin-top: 10px;">
            <span style="display: inline-block; background-color: rgba(170, 139, 99, 0.15); border: 1px solid rgba(170, 139, 99, 0.35); color: #FAF0E2; font-size: 11px; padding: 4px 12px; rounded-radius: 20px; font-family: monospace;">
              Category: ${category}
            </span>
          </div>
        </div>

        <!-- Question Body Callout -->
        <div style="background-color: #1D2116; border-left: 4px solid #AA8B63; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
          <h3 style="color: #AA8B63; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">
            💬 Customer's Question:
          </h3>
          <p style="color: #FAF0E2; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(question)}</p>
        </div>

        <!-- Details Grid -->
        <div style="background-color: #1B1E14; border: 1px solid rgba(250, 240, 226, 0.08); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
          <h3 style="color: #AA8B63; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; border-bottom: 1px solid rgba(250, 240, 226, 0.08); padding-bottom: 6px;">
            Client & Pet Information
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="color: #A4AA93; padding: 4px 0; width: 38%;">Client Name:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">Email:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #AA8B63; text-decoration: underline;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">Phone:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;">${phone ? `<a href="tel:${escapeHtml(phone)}" style="color: #FAF0E2;">${escapeHtml(phone)}</a>` : "Not provided"}</td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">ZIP Code:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;">${zipCode ? escapeHtml(zipCode) : "Not specified"}</td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">Pet Name:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;">${petName ? escapeHtml(petName) : "Not provided"}</td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">Pet Breed:</td>
              <td style="color: #FAF0E2; font-weight: 600; padding: 4px 0;">${petBreed ? escapeHtml(petBreed) : "Not provided"}</td>
            </tr>
            <tr>
              <td style="color: #A4AA93; padding: 4px 0;">Submitted:</td>
              <td style="color: #A4AA93; padding: 4px 0; font-family: monospace; font-size: 11px;">${submissionTime} PST</td>
            </tr>
          </table>
        </div>

        <!-- Quick Reply Action -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a
            href="mailto:${escapeHtml(email)}?subject=Re:%20Your%20SOUVA%20Inquiry%20-%20Doorstep%20Mobile%20Grooming"
            style="display: inline-block; background-color: #AA8B63; color: #161811; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 26px; border-radius: 24px; text-decoration: none; box-shadow: 0 4px 15px rgba(170,139,99,0.4);"
          >
            Reply to ${escapeHtml(name)} Directly
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #A4AA93; font-size: 11px; border-top: 1px solid rgba(250, 240, 226, 0.1); padding-top: 18px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 700; color: #FAF0E2;">SOUVA CORP · Mobile Pet Grooming</p>
          <p style="margin: 2px 0;">San Francisco & Peninsula · 100% Solar-Powered Autonomous Fleet</p>
          <p style="margin: 4px 0 0 0;">Concierge: +1 (415) 375-5823 · info@souvagrooming.com · <a href="https://www.souvagrooming.com" style="color: #AA8B63; text-decoration: none;">www.souvagrooming.com</a></p>
        </div>
      </div>
    `;

    // If Resend API key is missing (local dev or unconfigured test), log and return success mock
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured in process.env. Mocking successful submission.");
      return res.status(200).json({
        success: true,
        mock: true,
        message: "Inquiry received in dev mode (RESEND_API_KEY not configured).",
      });
    }

    // Send Notification to SOUVA Concierge
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [staffRecipient],
        reply_to: email,
        subject: `🐾 New Inquiry from ${name}: "${truncate(question, 45)}"`,
        text: plainText,
        html: htmlEmail,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API returned error:", resendData);
      return res.status(200).json({
        success: false,
        error: resendData.message || "Failed to transmit inquiry via Resend.",
        details: resendData,
      });
    }

    // GA4 Server-Side Measurement Protocol: generate_lead
    const gaMeasurementId = process.env.GA_MEASUREMENT_ID || "G-5MT50H7N7K";
    const gaApiSecret = process.env.GA_MEASUREMENT_PROTOCOL_SECRET || "FPHUVxA5TdCjRQjb3TrSmQ";
    if (gaMeasurementId && gaApiSecret) {
      try {
        await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: `lead_${Math.floor(100000000 + Math.random() * 900000000)}`,
              user_id: email ? email.toLowerCase().trim() : undefined,
              events: [
                {
                  name: "generate_lead",
                  params: {
                    currency: "USD",
                    value: 25,
                  },
                },
              ],
            }),
          }
        ).catch(() => {});
      } catch {}
    }

    return res.status(200).json({
      success: true,
      messageId: resendData.id,
      timestamp: submissionTime,
    });
  } catch (error: any) {
    console.error("send-inquiry handler error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error processing inquiry.",
    });
  }
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  const cleaned = str.trim().replace(/\s+/g, " ");
  if (cleaned.length <= len) return cleaned;
  return cleaned.slice(0, len) + "...";
}
