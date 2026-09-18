export default async function handler(req: any, res: any) {
  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    return res.status(200).json({
      status: "error",
      message: "RESEND_API_KEY is NOT detected in process.env",
      envKeysPresent: Object.keys(process.env).filter((k) => !k.includes("SECRET") && !k.includes("KEY")),
    });
  }

  const maskedKey = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Souva Mobile Grooming <info@souvagrooming.com>";
  const toEmail = (req.query?.to as string) || "souvamobilepetgrooming@gmail.com";

  try {
    const testResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: "🐾 SOUVA Resend Diagnostic Test Email",
        html: "<p>This is a test email confirming that your Resend API integration is working properly on Vercel!</p>",
      }),
    });

    const data = await testResponse.json();
    return res.status(200).json({
      status: testResponse.ok ? "success" : "resend_api_error",
      httpStatus: testResponse.status,
      maskedKey,
      fromEmail,
      toTested: toEmail,
      resendResponse: data,
      hint: !testResponse.ok && data?.message?.includes("testing emails")
        ? "Resend test domain (onboarding@resend.dev) only allows sending to the email registered on your Resend account. To send to any email address, verify your domain in Resend Dashboard (resend.com/domains) and set RESEND_FROM_EMAIL in Vercel."
        : null,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fetch_exception",
      error: error.message,
    });
  }
}
