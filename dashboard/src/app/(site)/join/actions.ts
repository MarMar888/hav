"use server";

import { z } from "zod";
import { oneLine, notifyTeam } from "@/lib/notify";
import { GROUPS } from "@/lib/team";

export type JoinState = { ok: boolean; error?: string };

const optional = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const application = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(200),
  email: z.string().trim().max(320).pipe(z.email("That email doesn't look right.")),
  program: optional(200),
  interest: z.enum([...GROUPS, "Not sure yet"]),
  message: optional(5000),
});

export async function sendApplication(_prev: JoinState, f: FormData): Promise<JoinState> {
  // Bots fill every field. Pretend it worked so they don't retry.
  if (String(f.get("website") ?? "") !== "") return { ok: true };

  const parsed = application.safeParse({
    name: f.get("name") ?? "",
    email: f.get("email") ?? "",
    program: f.get("program") ?? "",
    interest: f.get("interest") ?? "",
    message: f.get("message") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { name, email, program, interest, message } = parsed.data;
  const emailed = await notifyTeam({
    subject: `Haav membership interest: ${oneLine(name)}`,
    replyTo: email,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Year and major: ${program ?? "-"}`,
      `Wants to join: ${interest}`,
      "",
      message ?? "(no message)",
    ].join("\n"),
  });
  if (emailed) return { ok: true };
  return { ok: false, error: "Something went wrong sending that. Please try again later." };
}
