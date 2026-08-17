import type { DocumentVersion } from "@nubbin/core";
import { ctaBannerDefaults } from "../src/blocks/ctaBannerDefaults";
import { heroDefaults } from "../src/blocks/heroDefaults";

/** Two blocks of nine, so a chunk measurement on this route reads against a known denominator. */
export const promotionsSummer: DocumentVersion = {
  documentId: "promotions-summer",
  version: 1,
  root: "stack",
  elements: {
    stack: { id: "stack", block: "SectionStack", props: {}, slots: { sections: ["hero", "cta"] } },
    hero: {
      id: "hero",
      block: "Hero",
      props: { ...heroDefaults, headline: "Summer planning, minus the spreadsheets" },
    },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: { ...ctaBannerDefaults, heading: "The summer offer ends with the season" },
    },
  },
  meta: { title: "Summer promotion" },
  createdAt: "2026-08-01T00:00:00Z",
  createdBy: "fixtures",
};
