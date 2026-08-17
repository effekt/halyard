import type { DocumentVersion } from "@nubbin/core";
import { ctaBannerDefaults } from "../src/blocks/ctaBannerDefaults";

/** Compiled by the suite but not published by the pre-build script — this is the route that
 * goes live against an already-running server, so the build must leave it unresolved. */
export const promotionsFlash: DocumentVersion = {
  documentId: "promotions-flash",
  version: 1,
  root: "stack",
  elements: {
    stack: { id: "stack", block: "SectionStack", props: {}, slots: { sections: ["cta"] } },
    cta: {
      id: "cta",
      block: "CtaBanner",
      props: { ...ctaBannerDefaults, heading: "Flash offer: two days, then it is gone" },
    },
  },
  meta: { title: "Flash promotion" },
  createdAt: "2026-08-01T00:00:00Z",
  createdBy: "fixtures",
};
