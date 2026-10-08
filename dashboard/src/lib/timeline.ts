// Build milestones for the public page and the handout, in order. `when` is the date (or range) shown; `date` (ISO,
// YYYY-MM-DD) is the start. `detail` is one or two plain sentences shown on the site only.

export const TIMELINE: readonly { when: string; date?: string; label: string; detail?: string }[] = [
  { when: "Oct 25", date: "2026-10-25", label: "Current hull design frozen" },
  {
    when: "Nov 15",
    date: "2026-11-15",
    label: "Preliminary design review",
    detail:
      "Complete CAD and circuit design, plus a rough proof of concept, even a cardboard boat with boxes for the components, to see the dimensions and catch problems early. Order critical and long-lead components.",
  },
  {
    when: "Dec 1",
    date: "2026-12-01",
    label: "Mechanical and electrical design frozen",
    detail: "Full bill of materials, and the order goes in.",
  },
  {
    when: "Dec 1–31",
    date: "2026-12-01",
    label: "Build the hull and composite parts",
    detail: "Plus any custom-milled parts.",
  },
  {
    when: "Jan 11–28",
    date: "2027-01-11",
    label: "Manufacture and assemble everything",
    detail:
      "All mechanical and electrical parts, including dry fits, electrical assembly out of the boat first, and debugging.",
  },
  {
    when: "Jan 11–Feb 26",
    date: "2027-01-11",
    label: "Build likely spare parts, in parallel",
  },
  {
    when: "Jan 22",
    date: "2027-01-22",
    label: "First float and tow test",
    detail:
      "The hull floats with deadweight standing in for the real weight, then is towed behind a motorized boat to validate the hull design and build quality.",
  },
  {
    when: "Jan 29",
    date: "2027-01-29",
    label: "Zeroth nautical mile",
    detail:
      "The first time everything is assembled in the hull and powered on: every microcontroller, sensor and actuator. The first motor and propeller spin with the boat lifted in the air, and the first propulsion and navigation test commanded by the autonomous pipeline.",
  },
  {
    when: "Feb 1–14",
    date: "2027-02-01",
    label: "Slow drives on the water",
    detail: "First fully manual by remote command, then adding autonomy over time.",
  },
  { when: "Feb 15", date: "2027-02-15", label: "Start increasing speed" },
  {
    when: "From Feb 15",
    date: "2027-02-15",
    label: "Keep testing until the competition",
    detail: "Expect plenty of hardware and software issues to work through.",
  },
];
