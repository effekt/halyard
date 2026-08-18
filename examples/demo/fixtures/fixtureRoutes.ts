import type { DocumentVersion } from "@nubbin/core";
import { about } from "./about";
import { home } from "./home";
import { livePulse } from "./livePulse";
import { pricing } from "./pricing";
import { promotionsFlash } from "./promotionsFlash";
import { promotionsSummer } from "./promotionsSummer";
import { promotionsWinter } from "./promotionsWinter";
import { security } from "./security";

/** Every route the demo has a document for. Which of them the build publishes is a separate
 * decision, made by the publish script. */
export const fixtureRoutes: Record<string, DocumentVersion> = {
  "/": home,
  "/pricing": pricing,
  "/about": about,
  "/security": security,
  "/promotions/summer": promotionsSummer,
  "/promotions/winter": promotionsWinter,
  "/promotions/flash": promotionsFlash,
  "/live/pulse": livePulse,
};
