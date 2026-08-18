import type { DocumentVersion } from "@nubbin/core";
import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { editedDrafts } from "./editedDrafts";

/** The current draft for a route: the committed fixture, overlaid by whatever this process
 * has edited. `undefined` for a route no fixture covers — own properties only, because
 * `fixtureRoutes` is a plain object and an untrusted route like `"constructor"` would
 * otherwise read its prototype rather than a fixture. */
export function readDraft(route: string): DocumentVersion | undefined {
  const fixture = Object.hasOwn(fixtureRoutes, route) ? fixtureRoutes[route] : undefined;
  return editedDrafts.get(route) ?? fixture;
}
