import type { DocumentVersion } from "@nubbin/core";

/** `/` re-authored by hand: the eight blocks carrying the content their defaults render. */
export const home: DocumentVersion = {
  documentId: "home",
  version: 1,
  root: "stack",
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: {
        sections: [
          "hero",
          "logo-wall",
          "feature-grid",
          "stat-band",
          "testimonial",
          "faq",
          "cta",
          "footer",
        ],
      },
    },
    hero: {
      id: "hero",
      block: "Hero",
      props: {
        eyebrow: "Now shipping weekly",
        headline: "Plan the work. Trust the read.",
        body: "Tidewell turns scattered planning docs into one schedule everyone on the team reads the same way — no more Friday afternoon status hunts.",
        tone: "dark",
        cta: { label: "Start a free trial", href: "/pricing" },
        image: {
          url: "/hero-board.svg",
          alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
        },
      },
    },
    "logo-wall": {
      id: "logo-wall",
      block: "LogoWall",
      props: {
        heading: "Trusted by teams who ship on schedule",
        tone: "light",
        logos: [
          { url: "/logos/solstice.svg", alt: "Solstice Analytics" },
          { url: "/logos/bramblewood.svg", alt: "Bramblewood" },
          { url: "/logos/ferro-works.svg", alt: "Ferro Works" },
          { url: "/logos/cobalt-freight.svg", alt: "Cobalt Freight" },
          { url: "/logos/highline.svg", alt: "Highline Studio" },
        ],
      },
    },
    "feature-grid": {
      id: "feature-grid",
      block: "FeatureGrid",
      props: {
        heading: "Everything a distributed team needs to stay on course",
        tone: "light",
        items: [
          {
            icon: "chart",
            title: "One read of the schedule",
            body: "Every workstream rolls up into a single timeline, so a stakeholder gets the same answer whether they ask you or open the app.",
          },
          {
            icon: "shield",
            title: "Changes never surprise you",
            body: "Tidewell flags a downstream date the moment an upstream task slips, before it becomes a standup surprise.",
          },
          {
            icon: "bolt",
            title: "Set up in an afternoon",
            body: "Import from a spreadsheet or a ticket tracker and get a working schedule the same day, not after a quarter of onboarding.",
          },
          {
            icon: "layers",
            title: "Built for how teams actually work",
            body: "Nested workstreams, dependencies, and owners map to how the work is really structured, not a flat list pretending it is.",
          },
        ],
      },
    },
    "stat-band": {
      id: "stat-band",
      block: "StatBand",
      props: {
        tone: "dark",
        stats: [
          { value: "18 hrs", label: "saved per team, per month, on status updates" },
          { value: "4.9 / 5", label: "average rating from planning leads" },
          { value: "6 min", label: "median time to set up a new workstream" },
        ],
      },
    },
    testimonial: {
      id: "testimonial",
      block: "TestimonialQuote",
      props: {
        quote:
          "We stopped reconciling three versions of the plan every Monday. Now there’s just the one, and everyone trusts it.",
        name: "Priya Shah",
        role: "Head of Operations",
        avatar: { url: "/avatar-priya.svg", alt: "Portrait illustration of Priya Shah" },
        tone: "light",
      },
    },
    faq: {
      id: "faq",
      block: "FaqAccordion",
      props: {
        heading: "Frequently asked questions",
        tone: "light",
        items: [
          {
            question: "Does Tidewell replace our ticket tracker?",
            answer:
              "No — Tidewell reads from the tracker you already use and turns it into one shared schedule. Your team keeps filing tickets exactly where they do today.",
          },
          {
            question: "How long does setup take?",
            answer:
              "Most teams import a first workstream and see a working schedule inside an afternoon. Full rollout across a department typically takes a week.",
          },
          {
            question: "Can clients see a read-only view?",
            answer:
              "Yes. Every schedule has a shareable read-only link that updates automatically, so a client never asks for the wrong version again.",
          },
          {
            question: "What happens to our data if we cancel?",
            answer:
              "You can export every workstream to a spreadsheet at any time, and your data stays exportable for 90 days after cancellation.",
          },
        ],
      },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: {
        heading: "Ready to chart a clearer course?",
        body: "Start a free trial today — no credit card, and your first workstream is live in minutes.",
        tone: "dark",
        cta: { label: "Start a free trial", href: "/pricing" },
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
    title: "Tidewell — one schedule, read the same way by everyone",
    description:
      "Tidewell turns scattered planning docs into one schedule everyone on the team reads the same way.",
  },
  createdAt: "2026-08-16T00:00:00Z",
  createdBy: "fixtures",
};
