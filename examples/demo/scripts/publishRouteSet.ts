import type { ArtifactStore } from "@nubbin/core";
import { publishFixture } from "./publishFixture";

/** `/promotions/flash` is absent on purpose: it is published against a running server, so the
 * build has to leave that route unresolved. */
const PREBUILD_ROUTES = [
  "/",
  "/pricing",
  "/about",
  "/security",
  "/changelog",
  "/promotions/summer",
  "/promotions/winter",
  "/live/pulse",
];

/**
 * Sequential rather than concurrent — the routes are few, and a log read top to bottom is the
 * point of running this by hand. The store is a parameter because two of them take this set: the
 * developer's `.nubbin/`, and the committed store standing in for what is already live.
 */
export async function publishRouteSet(store: ArtifactStore): Promise<void> {
  for (const route of PREBUILD_ROUTES) {
    const hash = await publishFixture(route, store);
    console.log(`published ${route} -> ${hash}`);
  }
}
