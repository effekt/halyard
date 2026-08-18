import { publishFixture } from "./publishFixture";

/** `/promotions/flash` is absent on purpose: it is published against a running server, so the
 * build has to leave that route unresolved. */
const PREBUILD_ROUTES = [
  "/",
  "/pricing",
  "/promotions/summer",
  "/promotions/winter",
  "/live/pulse",
];

/** Sequential rather than concurrent — the routes are few, and a log read top to bottom is the
 * point of running this by hand. */
export async function publishFixtures(): Promise<void> {
  for (const route of PREBUILD_ROUTES) {
    const hash = await publishFixture(route);
    console.log(`published ${route} -> ${hash}`);
  }
}

await publishFixtures();
