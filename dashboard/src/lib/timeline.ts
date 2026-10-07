// Build milestones for the public page, oldest first. Dates are ISO (YYYY-MM-DD).

export const TIMELINE = [
  { date: "2026-10-15", label: "Rough hull dimensions" },
  { date: "2026-10-15", label: "Preliminary BOM list" },
  { date: "2026-10-25", label: "Hull design" },
  { date: "2026-11-15", label: "Electrical design" },
  { date: "2026-11-25", label: "Hull built" },
  { date: "2026-12-01", label: "Order parts deadline" },
  { date: "2027-01-25", label: "First drive" },
  { date: "2027-02-15", label: "First fast drive" },
  { date: "2027-03-15", label: "Tuning and testing" },
] as const;
