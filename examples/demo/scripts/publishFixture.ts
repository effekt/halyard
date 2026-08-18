import { type ArtifactStore, compile } from "@nubbin/core";
import { fixtureRoutes } from "../fixtures/fixtureRoutes";
import { catalog } from "../src/nubbin/catalog";
import { registry } from "../src/nubbin/registry";

/**
 * Compile, store, then move the pointer — in that order, because a route pointing at a hash
 * nothing has written is a live 404. Returns the hash the route now resolves to.
 */
export async function publishFixture(route: string, store: ArtifactStore): Promise<string> {
  const version = fixtureRoutes[route];
  if (version === undefined) {
    throw new Error(`no fixture for ${route}`);
  }
  const artifact = compile(version, catalog, registry, route);
  await store.write(artifact);
  await store.publish(route, artifact.hash);
  return artifact.hash;
}
