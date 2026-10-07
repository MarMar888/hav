// Headers can't carry line breaks; keep visitor-supplied text out of them.
export const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** Emails the team through Resend. Returns false if it isn't configured or the send fails. */
export async function notifyTeam({ subject, replyTo, text }: { subject: string; replyTo: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Haav <onboarding@resend.dev>",
        to: [to],
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
