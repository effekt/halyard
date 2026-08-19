import type { DocumentVersion } from "@nubbin/core";

/** `/about` re-authored by hand: six sections carrying the reference page's content, with no
 * loss. The second prose paragraph keeps the anchor to `/security` inside its sentence —
 * `Prose.body` is rich text, so inline structure is data the schema can see. */
export const about: DocumentVersion = {
  documentId: "about",
  version: 1,
  roots: ["stack"],
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: {
        sections: ["hero", "why", "values", "crew", "cta", "footer"],
      },
    },
    hero: {
      id: "hero",
      block: "Hero",
      props: {
        eyebrow: "About",
        headline: "Built by people who ran the Friday status hunt",
        body: "Tidewell exists because every team we worked on kept three versions of the same plan and trusted none of them.",
        tone: "dark",
        cta: { label: "See how it reads", href: "/" },
        image: {
          url: "/hero-board.svg",
          alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
        },
      },
    },
    why: {
      id: "why",
      block: "Prose",
      props: {
        heading: "Why we build this",
        tone: "light",
        body: [
          {
            kind: "paragraph",
            spans: [
              {
                text: "Most planning tools optimise for the person entering the work. Tidewell optimises for the person reading it — the one deciding on Monday morning what the week actually holds.",
              },
            ],
          },
          {
            kind: "paragraph",
            spans: [
              {
                text: "That is why there is one schedule rather than one per team, and why a read-only link is a first-class thing rather than an export. How we keep that one schedule safe is written up on our ",
              },
              { text: "security page", href: "/security" },
              { text: "." },
            ],
          },
          {
            kind: "paragraph",
            spans: [
              {
                text: "We are a small crew and we ship weekly. The changelog is public because a roadmap is a promise, and promises age badly.",
              },
            ],
          },
        ],
      },
    },
    values: {
      id: "values",
      block: "FeatureGrid",
      props: {
        heading: "What we optimise for",
        tone: "dark",
        items: [
          {
            icon: "chart",
            title: "Optimise for the reader",
            body: "The person reading the schedule outnumbers the person writing it ten to one. We build for the ten.",
          },
          {
            icon: "shield",
            title: "One version of the truth",
            body: "A plan that exists in three places is three plans. Tidewell holds exactly one.",
          },
          {
            icon: "bolt",
            title: "Ship weekly, say so",
            body: "A public changelog keeps us honest about pace in a way a roadmap never does.",
          },
          {
            icon: "layers",
            title: "Model the real structure",
            body: "Work nests and depends on other work. Flattening that to a list is where trust leaks out.",
          },
        ],
      },
    },
    crew: {
      id: "crew",
      block: "ProfileGrid",
      props: {
        heading: "The crew",
        tone: "light",
        people: [
          {
            name: "Marta Voss",
            role: "Founder",
            bio: "Ran delivery for a fifty-person studio and kept the schedule in her head until it stopped fitting.",
          },
          {
            name: "Dele Akande",
            role: "Engineering",
            bio: "Builds the import pipeline. Believes a tool you cannot leave in an afternoon is a trap, not a product.",
          },
          {
            name: "Priya Shah",
            role: "Operations",
            bio: "Our first customer before joining. Still reads the schedule the way a customer does — out loud, on Mondays.",
          },
        ],
      },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: {
        heading: "Read the schedule, not the status thread",
        body: "Start a free trial — your first workstream is live the same afternoon.",
        tone: "light",
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
    title: "About — Tidewell",
    description:
      "Tidewell is built by a small crew who ran the Friday status hunt and decided one schedule, read the same way by everyone, was the fix.",
  },
  createdAt: "2026-08-18T00:00:00Z",
  createdBy: "fixtures",
};
