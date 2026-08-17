import type { DocumentVersion } from "@nubbin/core";
import { featureGridDefaults } from "../src/blocks/featureGridDefaults";
import { heroDefaults } from "../src/blocks/heroDefaults";
import { testimonialQuoteDefaults } from "../src/blocks/testimonialQuoteDefaults";

/** The summer route's pair: same shape, one more section, a headline that differs by one word,
 * so a revalidation that served the wrong one is visible rather than plausible. */
export const promotionsWinter: DocumentVersion = {
  documentId: "promotions-winter",
  version: 1,
  root: "stack",
  elements: {
    stack: {
      id: "stack",
      block: "SectionStack",
      props: {},
      slots: { sections: ["hero", "features", "quote"] },
    },
    hero: {
      id: "hero",
      block: "Hero",
      props: { ...heroDefaults, headline: "Winter planning, minus the spreadsheets" },
    },
    features: {
      id: "features",
      block: "FeatureGrid",
      props: { ...featureGridDefaults, heading: "What a winter rollout gets you" },
    },
    quote: { id: "quote", block: "TestimonialQuote", props: { ...testimonialQuoteDefaults } },
  },
  meta: { title: "Winter promotion" },
  createdAt: "2026-08-01T00:00:00Z",
  createdBy: "fixtures",
};
