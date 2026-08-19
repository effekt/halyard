import type { DocumentVersion } from "@nubbin/core";

/** `/security` re-authored by hand with zero new blocks — `Prose` from `/about` covers the
 * three write-ups. Four losses are deliberate measurements, not bugs: the inline `<strong>`
 * and the inline `/changelog` anchor flatten to plain text (`Prose` holds plain strings), the
 * hero CTA's `#practices` target no longer exists (no block prop carries an id), and the
 * authored FAQ items are compiled into a revalidate hole and replaced at request time. */
export const security: DocumentVersion = {
  documentId: "security",
  version: 1,
  roots: ["stack"],
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: {
        sections: ["hero", "handled", "access", "changes", "practices", "faq", "cta", "footer"],
      },
    },
    hero: {
      id: "hero",
      block: "Hero",
      props: {
        eyebrow: "Security",
        headline: "Your schedule is your business",
        body: "Tidewell holds the one plan everyone trusts, so protecting it is not a feature tier — it is the product.",
        tone: "dark",
        cta: { label: "Read the practices", href: "#practices" },
        image: {
          url: "/hero-board.svg",
          alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
        },
      },
    },
    handled: {
      id: "handled",
      block: "Prose",
      props: {
        heading: "How your data is handled",
        tone: "light",
        paragraphs: [
          "Every schedule lives in one region, encrypted at rest and in transit. Exports are generated on demand and never cached; a deleted workstream is purged from backups on a fixed thirty-day cycle.",
        ],
      },
    },
    access: {
      id: "access",
      block: "Prose",
      props: {
        heading: "Who can see what",
        tone: "light",
        paragraphs: [
          "Access follows the schedule, not the org chart. A seat sees the workstreams it is invited to, a read-only link sees exactly one, and nobody at Tidewell can open your schedule without a recorded grant that you approve first.",
        ],
      },
    },
    changes: {
      id: "changes",
      block: "Prose",
      props: {
        heading: "When something changes",
        tone: "light",
        paragraphs: [
          "Security-relevant changes ship the way everything here ships — versioned, reviewed, and announced. Recent ones are on the changelog, not in a quarterly PDF.",
        ],
      },
    },
    practices: {
      id: "practices",
      block: "FeatureGrid",
      props: {
        heading: "The practices behind that",
        tone: "dark",
        items: [
          {
            icon: "shield",
            title: "Encrypted everywhere",
            body: "TLS in transit, AES-256 at rest, and no plaintext copies in logs or exports.",
          },
          {
            icon: "layers",
            title: "Tenant isolation",
            body: "Every workstream is scoped to your organisation at the query layer, not the UI.",
          },
          {
            icon: "bolt",
            title: "Revocable share links",
            body: "A read-only link can be expired at any time, and every open is recorded.",
          },
          {
            icon: "chart",
            title: "Audited access",
            body: "Every read and write carries who, what, and when — exportable on request.",
          },
        ],
      },
    },
    faq: {
      id: "faq",
      block: "FaqAccordion",
      props: {
        heading: "Security questions",
        tone: "light",
        items: [
          {
            question: "Where is our data stored?",
            answer:
              "In a single region you choose at signup. Backups stay in the same region and are encrypted with a separate key.",
          },
          {
            question: "Do you support single sign-on?",
            answer: "Yes, on the Fleet plan — SAML and OIDC, with enforced session lifetimes.",
          },
          {
            question: "Can we get a copy of your latest assessment?",
            answer:
              "Yes. Contact support and we will share the current third-party penetration test summary under NDA.",
          },
        ],
      },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: {
        heading: "Questions we did not answer?",
        body: "Security review for a larger rollout? We will walk your team through the details.",
        tone: "dark",
        cta: { label: "Talk to us", href: "/pricing" },
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
    title: "Security — Tidewell",
    description:
      "Tidewell holds the one plan everyone trusts. How that plan is stored, who can see it, and what changes when the practices do.",
  },
  createdAt: "2026-08-18T00:00:00Z",
  createdBy: "fixtures",
};
