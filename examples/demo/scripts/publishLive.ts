import { compile } from "@nubbin/core";
import { fixtureRoutes } from "../fixtures/fixtureRoutes";
import { catalog } from "../src/nubbin/catalog";
import { demoStore } from "../src/nubbin/demoStore";
import { registry } from "../src/nubbin/registry";
import { stampedVersion } from "./stampedVersion";

const DEFAULT_ORIGIN = "http://127.0.0.1:3000";

/**
 * Compiles a fixture, writes the artifact, then moves the pointer **through the running server**.
 *
 * `publishFixture.ts` calls `demoStore.publish` directly, which is correct before a build. This
 * cannot: `revalidatePath` only invalidates the cache of the process that runs it, so publishing
 * from here would move the pointer while the server kept serving its cached copy — the store and
 * the page would disagree, and the publish-without-deploy claim would look false when it is not.
 *
 * `registry`, the compile-side one — never `blockRegistry`, which has no `fingerprint()` and is
 * what the render path uses.
 */
export async function publishLive(route: string, stamp?: string): Promise<string> {
  const version = fixtureRoutes[route];
  if (version === undefined) {
    throw new Error(`no fixture for ${route}`);
  }
  const artifact = compile(stampedVersion(version, stamp), catalog, registry, route);
  await demoStore.write(artifact);
  const origin = process.env.DEMO_ORIGIN ?? DEFAULT_ORIGIN;
  const response = await fetch(`${origin}/api/nubbin/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ route, hash: artifact.hash }),
  });
  if (!response.ok) {
    throw new Error(`publish endpoint at ${origin} answered ${response.status}`);
  }
  return artifact.hash;
}

const [route, stamp] = process.argv.slice(2);
if (route === undefined) {
  throw new Error("usage: tsx scripts/publishLive.ts <fixture route> [stamp]");
}
console.log(`published ${route} -> ${await publishLive(route, stamp)}`);
