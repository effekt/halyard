import { createRegistry } from "@nubbin/core";
import { ctaBannerBlock } from "../blocks/CtaBanner.block";
import { faqAccordionBlock } from "../blocks/FaqAccordion.block";
import { featureGridBlock } from "../blocks/FeatureGrid.block";
import { heroBlock } from "../blocks/Hero.block";
import { logoWallBlock } from "../blocks/LogoWall.block";
import { planTiersBlock } from "../blocks/PlanTiers.block";
import { sectionStackBlock } from "../blocks/SectionStack.block";
import { siteFooterBlock } from "../blocks/SiteFooter.block";
import { statBandBlock } from "../blocks/StatBand.block";
import { testimonialQuoteBlock } from "../blocks/TestimonialQuote.block";

/**
 * Schemas and components together — what `compile` validates a document against, and what its
 * `registryFingerprint` is taken over. Publishing needs this; rendering does not.
 */
export const registry = createRegistry([
  heroBlock,
  logoWallBlock,
  featureGridBlock,
  planTiersBlock,
  statBandBlock,
  testimonialQuoteBlock,
  faqAccordionBlock,
  ctaBannerBlock,
  siteFooterBlock,
  sectionStackBlock,
]);
