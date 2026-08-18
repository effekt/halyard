import { demoStore } from "../src/nubbin/demoStore";
import { publishRouteSet } from "./publishRouteSet";

/** Fills a developer's `.nubbin/` store so `next build` and `next dev` have pages to serve. */
export async function publishFixtures(): Promise<void> {
  await publishRouteSet(demoStore);
}

await publishFixtures();
