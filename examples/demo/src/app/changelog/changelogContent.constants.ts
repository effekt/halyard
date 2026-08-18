/** Page-specific content: dated entries, newest first. */
export const ENTRIES = [
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
] as const;
