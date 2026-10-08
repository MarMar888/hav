// Build milestones for the public page, the handout and the PowerPoint, in order. `when` is the date (or range) shown;
// `date` (ISO, YYYY-MM-DD) is the start; `detail` is the rest of the line (site and timeline.txt only). The handout and
// scripts/handout-pptx.py use the date and title, and the script reads this file, so keep each entry's fields as plain
// `key: "string"` pairs.

export const TIMELINE: readonly { when: string; date: string; label: string; detail?: string }[] = [
  { when: "Oct 25", date: "2026-10-25", label: "Hull design frozen" },
  {
    when: "Nov 1",
    date: "2026-11-01",
    label: "Preliminary design review",
    detail: "Full CAD + circuit design and a rough proof of concept (cardboard with boxes for components).",
  },
  { when: "Nov 10", date: "2026-11-10", label: "Critical and long-lead parts are ordered" },
  {
    when: "Nov 20",
    date: "2026-11-20",
    label: "Mechanical and electrical design frozen",
    detail: "With the full BOM and the order.",
  },
  {
    when: "Nov 20–Dec 20",
    date: "2026-11-20",
    label: "Build the hull, composite parts and any custom-milled parts",
  },
  {
    when: "Jan 8",
    date: "2027-01-08",
    label: "First float and tow test",
    detail: "With deadweight for the real weight, towed behind a motorized boat.",
  },
  {
    when: "Jan 8–30",
    date: "2027-01-08",
    label: "Manufacture and assemble everything",
    detail: "With dry fits, electrical assembly out of the boat first, and debugging.",
  },
  { when: "Jan 8–30", date: "2027-01-08", label: "Build likely spare parts, in parallel" },
  {
    when: "Jan 31",
    date: "2027-01-31",
    label: "First nautical mile",
    detail:
      "It's the first time everything is powered on in the hull, with the first motor and propeller spin in the air and the first propulsion and navigation test commanded by the autonomous pipeline.",
  },
  {
    when: "Feb 1–14",
    date: "2027-02-01",
    label: "Slow drives on the water",
    detail: "Manual first and then adding autonomy.",
  },
  { when: "Feb 15", date: "2027-02-15", label: "Start increasing speed" },
  { when: "Until April", date: "2027-02-15", label: "Testing / Tuning" },
];
