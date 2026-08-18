import type { DocumentVersion } from "@nubbin/core";

/** `/changelog` re-authored with the two blocks the header and entry list needed —
 * `PageHeader` because `Hero` requires a `cta` and an `image` the header has no use for, and
 * `ChangelogList` because `FaqAccordion`'s items are compiled into a revalidate hole, so
 * authored entries would be discarded at compile. Entries are an array inside one block, not
 * child blocks in a slot: an entry is a record an author fills in, not a region an author
 * composes, and ten slot children would breach `SectionStack`'s `max: 12` on their own. */
export const changelog: DocumentVersion = {
  documentId: "changelog",
  version: 1,
  root: "stack",
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: {
        sections: ["header", "entries", "cta", "footer"],
      },
    },
    header: {
      id: "header",
      block: "PageHeader",
      props: {
        eyebrow: "Changelog",
        headline: "What shipped, and when",
        body: "We ship weekly. This page is the record — no roadmap, no “coming soon.”",
        tone: "dark",
      },
    },
    entries: {
      id: "entries",
      block: "ChangelogList",
      props: {
        tone: "light",
        entries: [
          {
            date: "2026-08-04",
            tag: "added",
            title: "Spreadsheet import maps owners",
            paragraphs: [
              "Importing a spreadsheet now recognises an owner column and assigns each row to a seat, so a freshly imported workstream reads like one that was always here.",
              "Unmatched names land in a review list instead of silently dropping.",
            ],
          },
          {
            date: "2026-07-21",
            tag: "improved",
            title: "Dependency alerts settle down",
            paragraphs: [
              "An upstream slip that resolves itself within an hour no longer notifies every downstream owner. Alerts now wait for the dust to settle, and the median team sees two-thirds fewer of them.",
            ],
          },
          {
            date: "2026-07-07",
            tag: "fixed",
            title: "Share links respect timezone",
            paragraphs: [
              "A read-only link opened in a different timezone showed dates shifted by a day at the boundary. Dates now render in the schedule's own timezone everywhere.",
            ],
          },
          {
            date: "2026-06-23",
            tag: "added",
            title: "Nested workstreams roll up",
            paragraphs: [
              "A parent workstream now shows the latest end date of its children, so the top of the schedule answers the question the bottom used to.",
              "Rollups recompute on every change — there is no refresh button because there is nothing to refresh.",
            ],
          },
          {
            date: "2026-06-09",
            tag: "improved",
            title: "Faster first read",
            paragraphs: [
              "The schedule view now streams above-the-fold workstreams first. A large schedule is readable in under a second on a mid-range laptop.",
            ],
          },
        ],
      },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: {
        heading: "See next week's entry from the inside",
        body: "Start a free trial and watch the schedule update itself.",
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
    title: "Changelog — Tidewell",
    description:
      "What shipped in Tidewell, and when. We ship weekly, and this page is the record — no roadmap, no “coming soon.”",
  },
  createdAt: "2026-08-18T00:00:00Z",
  createdBy: "fixtures",
};
