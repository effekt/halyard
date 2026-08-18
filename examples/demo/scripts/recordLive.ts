import { liveStore } from "../src/nubbin/liveStore";
import { publishRouteSet } from "./publishRouteSet";

/**
 * Re-records the committed store of pages that are already live, against the registry in the
 * working tree. This is the deliberate path out of a guardrail failure, and it is deliberate
 * because the result is a diff a reviewer reads — a block version moving under a live page is
 * visible in the same pull request that moved it. In a real deployment the equivalent act is
 * republishing every affected page, not turning a check off.
 */
export async function recordLive(): Promise<void> {
  await publishRouteSet(liveStore);
}

await recordLive();
