// Build milestones for the public page, the handout and the PowerPoint, in order. `when` is the date (or range) shown;
// `date` (ISO, YYYY-MM-DD) is the start; `detail` is the full description (site and timeline.txt only). The handout and
// scripts/handout-pptx.py use the date and title, and the script reads this file, so keep each entry's fields as plain
// `key: "string"` pairs.

export const TIMELINE: readonly { when: string; date: string; label: string; detail?: string }[] = [
  { when: "Oct 25", date: "2026-10-25", label: "Hull design frozen" },
  {
    when: "Nov 1",
    date: "2026-11-01",
    label: "Preliminary design review",
    detail:
      "Full, complete CAD and circuit design, plus a rough proof of concept: even a rough boat in cardboard with boxes for the components. It is there to visually see the dimensions and catch issues.",
  },
  {
    when: "Nov 10",
    date: "2026-11-10",
    label: "Critical and long-lead parts ordered",
    detail: "The critical components and the long-lead-time components.",
  },
  {
    when: "Nov 20",
    date: "2026-11-20",
    label: "Mechanical and electrical design frozen",
    detail: "With the full BOM and the order.",
  },
  {
    when: "Nov 20–Dec 20",
    date: "2026-11-20",
    label: "Build the hull and composite parts",
    detail: "Plus any custom-milled parts.",
  },
  {
    when: "Jan 8",
    date: "2027-01-08",
    label: "First float and tow test",
    detail:
      "The first time the hull floats, with deadweight to represent the real weight, plus a tow test behind a motorized boat to validate the hull design and quality.",
  },
  {
    when: "Jan 8–30",
    date: "2027-01-08",
    label: "Manufacture and assemble everything",
    detail:
      "Manufacturing and assembly of all mechanical and electrical components, including dry fits, the initial electrical assembly out of the boat, and debugging.",
  },
  {
    when: "Jan 8–30",
    date: "2027-01-08",
    label: "Build likely spare parts, in parallel",
    detail: "Spare parts that are likely to be used, built in parallel.",
  },
  {
    when: "Jan 31",
    date: "2027-01-31",
    label: "First nautical mile",
    detail:
      "Full assembly, and the first time every component of the boat is turned on in the hull: pinging all the microcontrollers, sensors and actuators. The first motor and propeller turn with the boat lifted in the air, and the first test of propulsion and navigation controlled through the autonomous pipeline, meaning the autonomous stack sending the commands.",
  },
  {
    when: "Feb 1–14",
    date: "2027-02-01",
    label: "Slow drives on the water",
    detail: "First fully manual, with remote commanding, then adding autonomy over time.",
  },
  { when: "Feb 15", date: "2027-02-15", label: "Start increasing speed" },
  {
    when: "Until April",
    date: "2027-02-15",
    label: "Testing and tuning",
    detail: "As much testing as possible. Expect plenty of issues, in both hardware and software.",
  },
];
