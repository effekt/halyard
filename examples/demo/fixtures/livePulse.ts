import type { DocumentVersion } from "@nubbin/core";
import { faqAccordionDefaults } from "../src/blocks/faqAccordionDefaults";
import { statBandDefaults } from "../src/blocks/statBandDefaults";

/** The only route carrying holes, and it carries both kinds: `StatBand.stats` resolves per
 * request, `FaqAccordion.items` on an interval. The authored values still have to satisfy their
 * schemas — compile validates a field before deciding it is a hole and discarding it. */
export const livePulse: DocumentVersion = {
  documentId: "live-pulse",
  version: 1,
  roots: ["stack"],
  elements: {
    stack: { id: "stack", block: "SectionStack", props: {}, slots: { sections: ["stats", "faq"] } },
    stats: { id: "stats", block: "StatBand", props: { ...statBandDefaults } },
    faq: {
      id: "faq",
      block: "FaqAccordion",
      props: { ...faqAccordionDefaults, heading: "Questions about the live figures" },
    },
  },
  meta: { title: "Live pulse" },
  createdAt: "2026-08-01T00:00:00Z",
  createdBy: "fixtures",
};
