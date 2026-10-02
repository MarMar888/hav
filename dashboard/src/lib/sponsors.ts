// Copy for the /sponsors page, kept apart from the layout so it can be edited
// without touching markup. Hard numbers come from docs/PEP-Rules; anything
// about what sponsors receive is the team's offer to change, not a fact.

export const WAYS_TO_BACK = [
  {
    id: "funds",
    title: "Funds",
    line: "Pay for the build",
    body: "Filament, fiberglass, batteries, two motor pods. Every line is on the public BOM with a price and a vendor link, so you can see exactly where the money goes.",
  },
  {
    id: "parts",
    title: "Parts",
    line: "Be the part on the boat",
    body: "Make or donate something on the BOM: cells, speed controllers, sensors, materials. Your product is the one actually doing the work, and we say so.",
  },
  {
    id: "skills",
    title: "Skills",
    line: "Lend a bench or a brain",
    body: "Machining, composites, test water, battery safety review, controls advice. Help that never touches a budget line still changes whether the boat finishes.",
  },
] as const;

export const WHAT_YOU_GET = [
  "Your name or logo on the boat",
  "Your name on the site and the competition white paper",
  "Build updates as parts arrive and the hull takes shape",
  "An invitation to race day",
  "A live, public record of what your support went into",
  "A direct line to the team",
] as const;

export const FACTS = [
  { value: "4 ft", label: "Autonomous RIB, built from scratch" },
  { value: "2 mi", label: "Uncrewed race course" },
  { value: "30 lb", label: "Payload it has to carry" },
  { value: "12S", label: "Two motor pods, steered by differential thrust" },
] as const;

export const INTERESTS = ["Funds", "Parts", "Skills", "Not sure yet"] as const;
