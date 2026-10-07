"use server";

import { z } from "zod";
import { db, hasDatabase } from "@/lib/db";
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
  if (!hasDatabase()) return { ok: false, error: "Messages aren't being collected right now. Please try again later." };

  const { name, email, org, interest, message } = parsed.data;
  try {
    await db().query(
      `insert into sponsor_inquiries (name, email, org, interest, message) values ($1, $2, $3, $4, $5)`,
      [name, email, org, interest, message]
    );
  } catch {
    return { ok: false, error: "Something went wrong saving that. Please try again." };
  }
  return { ok: true };
}
