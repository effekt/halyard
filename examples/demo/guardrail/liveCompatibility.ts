import { type CompatibilityReport, checkCompatibility } from "@nubbin/core";
import { liveStore } from "../src/nubbin/liveStore";
import { readLiveRoutes } from "../src/nubbin/readLiveRoutes";
import { registry } from "../src/nubbin/registry";

/**
 * This site's already-published pages against the registry in the working tree — the guardrail,
 * as a consumer would wire it: read your own store, then hand what you read to `core`.
 */
export async function liveCompatibility(): Promise<CompatibilityReport> {
  return checkCompatibility(await readLiveRoutes(liveStore), registry);
}
