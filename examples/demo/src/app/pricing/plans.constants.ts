/** Page-specific content, not a curated block — a pricing table is composition. */
export const PLANS = [
  {
    name: "Starter",
    price: "$19",
    unit: "per seat / month",
    description: "For one team finding its footing.",
    features: ["Up to 3 workstreams", "Read-only share links", "Email support"],
    recommended: false,
  },
  {
    name: "Crew",
    price: "$39",
    unit: "per seat / month",
    description: "For teams coordinating across several workstreams.",
    features: [
      "Unlimited workstreams",
      "Dependency alerts",
      "Priority support",
      "Spreadsheet import",
    ],
    recommended: true,
  },
  {
    name: "Fleet",
    price: "Talk to sales",
    unit: "annual billing",
    description: "For an organization running many teams on one schedule.",
    features: ["Everything in Crew", "Single sign-on", "A dedicated onboarding lead"],
    recommended: false,
  },
] as const;
