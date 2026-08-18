import type { DocumentVersion } from "@nubbin/core";

/** `/pricing` re-authored by hand: six sections carrying the reference page's content. */
export const pricing: DocumentVersion = {
  documentId: "pricing",
  version: 1,
  root: "stack",
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: {
        sections: ["hero", "plans", "included", "faq", "cta", "footer"],
      },
    },
    hero: {
      id: "hero",
      block: "Hero",
      props: {
        eyebrow: "Pricing",
        headline: "Simple pricing, no surprises",
        body: "Every plan includes unlimited workstreams and the same fast setup. Pick the seat count that matches your team today — change it anytime.",
        tone: "dark",
        cta: { label: "Compare plans", href: "#plans" },
        image: {
          url: "/hero-pricing.svg",
          alt: "Abstract illustration of three plan tiers as ascending sails",
        },
      },
    },
    plans: {
      id: "plans",
      block: "PlanTiers",
      props: {
        heading: "Plans",
        tone: "light",
        tiers: [
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
        ],
      },
    },
    included: {
      id: "included",
      block: "FeatureGrid",
      props: {
        heading: "Every plan includes",
        tone: "dark",
        items: [
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
        ],
      },
    },
    faq: {
      id: "faq",
      block: "FaqAccordion",
      props: {
        heading: "Pricing questions",
        tone: "light",
        items: [
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
        ],
      },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: {
        heading: "Still deciding?",
        body: "Start on Starter and upgrade the moment you need more seats — every plan migrates without losing a workstream.",
        tone: "light",
        cta: { label: "Start a free trial", href: "/pricing#plans" },
      },
    },
    footer: {
      id: "footer",
      block: "SiteFooter",
      props: {
        tagline: "One schedule. Read the same way by everyone on the team.",
        tone: "dark",
        columns: [
          {
            heading: "Product",
            links: [
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog", href: "/#" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "About", href: "/#" },
              { label: "Careers", href: "/#" },
              { label: "Contact", href: "/#" },
            ],
          },
          {
            heading: "Resources",
            links: [
              { label: "Documentation", href: "/#" },
              { label: "Support", href: "/#" },
              { label: "Status", href: "/#" },
            ],
          },
        ],
        legal: "© 2026 Tidewell. All rights reserved.",
      },
    },
  },
  meta: {
    title: "Pricing — Tidewell",
    description:
      "Every Tidewell plan includes unlimited workstreams and the same fast setup. Pick the seat count that matches your team today.",
  },
  createdAt: "2026-08-18T00:00:00Z",
  createdBy: "fixtures",
};
