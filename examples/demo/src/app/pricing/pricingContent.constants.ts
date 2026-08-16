/** Page-specific copy, lifted out so the page reads as composition rather than content. */
export const INCLUDED_FEATURES = [
  {
    icon: "layers",
    title: "Every workstream, unlimited",
    body: "No plan caps how much of the schedule you can model.",
  },
  {
    icon: "shield",
    title: "Read-only share links",
    body: "Send a client a link that always shows the current schedule, never a stale export.",
  },
  {
    icon: "bolt",
    title: "Same-day onboarding",
    body: "A first workstream is live the day you sign up, on every plan.",
  },
  {
    icon: "chart",
    title: "Nested dependencies",
    body: "Model how work actually depends on other work, not a flat list pretending it does.",
  },
] as const;

export const PRICING_FAQS = [
  {
    question: "Can I change seat count later?",
    answer: "Yes — upgrade or downgrade anytime; we prorate the difference to the day.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Annual billing saves two months compared to paying monthly.",
  },
  {
    question: "What counts as a seat?",
    answer:
      "Anyone who edits a schedule. Read-only viewers with a share link never count against your seat total.",
  },
  {
    question: "Do you offer a nonprofit or education discount?",
    answer:
      "Yes — contact sales with a verification and we’ll apply a standard discount to any plan.",
  },
] as const;
