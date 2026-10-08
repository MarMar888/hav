// Build milestones for the public page, the handout and the PowerPoint, in order. `when` is the date (or range) shown;
// `date` (ISO, YYYY-MM-DD) is the start; `detail` is the full description. scripts/handout-pptx.py reads this file,
// so keep each entry's fields as plain `key: "string"` pairs.

export const TIMELINE: readonly { when: string; date: string; label: string; detail?: string }[] = [
  { when: "Oct 25", date: "2026-10-25", label: "Current hull design frozen" },
  {
    when: "Nov 15",
    date: "2026-11-15",
    label: "Preliminary design review",
    detail:
      "Full CAD and circuit design, plus a rough proof of concept, even a cardboard boat with boxes for the components, to visually check dimensions and catch issues. Critical and long-lead components are ordered.",
  },
  {
    when: "Dec 1",
    date: "2026-12-01",
    label: "Mechanical and electrical design frozen",
    detail: "With the full BOM and the order.",
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
      "All mechanical and electrical components, with dry fits, electrical assembly out of the boat first, and debugging.",
  },
  {
    when: "Jan 11–Feb 26",
    date: "2027-01-11",
    label: "Build likely spare parts, in parallel",
    detail: "Spares for the parts most likely to be used.",
  },
  {
    when: "Jan 22",
    date: "2027-01-22",
    label: "First float and tow test",
    detail:
      "The hull floats with deadweight for the real weight, and is towed behind a motorized boat to validate the hull design and quality.",
  },
  {
    when: "Jan 29",
    date: "2027-01-29",
    label: "Zeroth nautical mile",
    detail:
      "The first time everything is powered on in the hull: all microcontrollers, sensors and actuators. The first motor and propeller spin with the boat lifted in the air, and the first propulsion and navigation test commanded by the autonomous pipeline.",
  },
  {
    when: "Feb 1–14",
    date: "2027-02-01",
    label: "Slow drives on the water",
    detail: "Fully manual first, by remote command, then adding autonomy over time.",
  },
  { when: "Feb 15", date: "2027-02-15", label: "Start increasing speed" },
  {
    when: "From Feb 15",
    date: "2027-02-15",
    label: "Test as much as possible",
    detail: "Right up to the competition, working through the hardware and software issues that come up.",
  },
];
