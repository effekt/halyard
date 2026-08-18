import { createRegistry } from "@nubbin/core";
import { changelogListBlock } from "../blocks/ChangelogList.block";
import { ctaBannerBlock } from "../blocks/CtaBanner.block";
import { faqAccordionBlock } from "../blocks/FaqAccordion.block";
import { featureGridBlock } from "../blocks/FeatureGrid.block";
import { heroBlock } from "../blocks/Hero.block";
import { logoWallBlock } from "../blocks/LogoWall.block";
import { pageHeaderBlock } from "../blocks/PageHeader.block";
import { planTiersBlock } from "../blocks/PlanTiers.block";
import { profileGridBlock } from "../blocks/ProfileGrid.block";
import { proseBlock } from "../blocks/Prose.block";
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
  proseBlock,
  profileGridBlock,
  statBandBlock,
  testimonialQuoteBlock,
  faqAccordionBlock,
  ctaBannerBlock,
  pageHeaderBlock,
  changelogListBlock,
  siteFooterBlock,
  sectionStackBlock,
]);
