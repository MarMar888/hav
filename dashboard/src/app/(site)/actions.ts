"use server";

import { z } from "zod";
import { db, hasDatabase } from "@/lib/db";
import { oneLine, notifyTeam } from "@/lib/notify";
import { INTERESTS } from "@/lib/sponsors";

export type InquiryState = { ok: boolean; error?: string };

const optional = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const inquiry = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(200),
  email: z.string().trim().max(320).pipe(z.email("That email doesn't look right.")),
  org: optional(200),
  interest: z.enum(INTERESTS),
  message: optional(5000),
});

type Inquiry = z.infer<typeof inquiry>;

async function notify({ name, email, org, interest, message }: Inquiry): Promise<boolean> {
  return notifyTeam({
    subject: `Haav sponsor inquiry: ${oneLine(name)}${org ? ` (${oneLine(org)})` : ""}`,
    replyTo: email,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Organization: ${org ?? "-"}`,
      `Wants to help with: ${interest}`,
      "",
      message ?? "(no message)",
    ].join("\n"),
  });
}

async function save({ name, email, org, interest, message }: Inquiry): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    await db().query(
      `insert into sponsor_inquiries (name, email, org, interest, message) values ($1, $2, $3, $4, $5)`,
      [name, email, org, interest, message]
    );
    return true;
  } catch {
    return false;
  }
}

export async function sendInquiry(_prev: InquiryState, f: FormData): Promise<InquiryState> {
  // Bots fill every field. Pretend it worked so they don't retry.
  if (String(f.get("website") ?? "") !== "") return { ok: true };

  const parsed = inquiry.safeParse({
    name: f.get("name") ?? "",
    email: f.get("email") ?? "",
    org: f.get("org") ?? "",
    interest: f.get("interest") ?? "",
    message: f.get("message") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  // The inquiry counts as received if the email went out or the row was saved.
  const [emailed, saved] = await Promise.all([notify(parsed.data), save(parsed.data)]);
  if (emailed || saved) return { ok: true };
  return { ok: false, error: "Something went wrong sending that. Please try again later." };
}
