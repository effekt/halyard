import type { DocumentVersion } from "@nubbin/core";
import { livePulse } from "./livePulse";
import { promotionsFlash } from "./promotionsFlash";
import { promotionsSummer } from "./promotionsSummer";
import { promotionsWinter } from "./promotionsWinter";

/** Every route the demo has a document for. Which of them the build publishes is a separate
 * decision, made by the publish script. */
export const fixtureRoutes: Record<string, DocumentVersion> = {
  "/promotions/summer": promotionsSummer,
  "/promotions/winter": promotionsWinter,
  "/promotions/flash": promotionsFlash,
  "/live/pulse": livePulse,
};
