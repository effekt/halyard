import { defineRegistry } from "@nubbin/react";

/** The literal map the bundler splits into one chunk per block. Values resolve to the component
 * itself, which is what the renderer invokes — a module namespace is not callable. */
export const blockRegistry = defineRegistry({
  Hero: () => import("../blocks/Hero").then((module) => module.Hero),
  LogoWall: () => import("../blocks/LogoWall").then((module) => module.LogoWall),
  FeatureGrid: () => import("../blocks/FeatureGrid").then((module) => module.FeatureGrid),
  PlanTiers: () => import("../blocks/PlanTiers").then((module) => module.PlanTiers),
  StatBand: () => import("../blocks/StatBand").then((module) => module.StatBand),
  TestimonialQuote: () =>
    import("../blocks/TestimonialQuote").then((module) => module.TestimonialQuote),
  FaqAccordion: () => import("../blocks/FaqAccordion").then((module) => module.FaqAccordion),
  CtaBanner: () => import("../blocks/CtaBanner").then((module) => module.CtaBanner),
  SiteFooter: () => import("../blocks/SiteFooter").then((module) => module.SiteFooter),
  SectionStack: () => import("../blocks/SectionStack").then((module) => module.SectionStack),
});
