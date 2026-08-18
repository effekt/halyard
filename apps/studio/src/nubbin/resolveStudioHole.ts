import type { HoleResolver } from "@nubbin/react";
import { demoHoleValue } from "demo/src/nubbin/demoHoleValue";
import { previewNowPayload } from "./previewNowPayload";

/**
 * Always fresh, never fetched: a draft preview answers "what would this page say now", so
 * both hole kinds resolve per render and the spec's cache lifecycle is left to whatever app
 * serves the published artifact.
 */
export const resolveStudioHole: HoleResolver = async ({ block, path }) =>
  demoHoleValue(block, path, previewNowPayload());
