import type { DocumentVersion } from "@nubbin/core";
import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { draftFilePath } from "./draftFilePath";
import { readDraftFile } from "./readDraftFile";

/** The current draft for a route: the committed fixture, overlaid by the draft file the
 * last committed edit wrote — so an edit survives a restart, and every module graph reads
 * the same state. `undefined` for a route no fixture covers — own properties only, because
 * `fixtureRoutes` is a plain object and an untrusted route like `"constructor"` would
 * otherwise read its prototype rather than a fixture. */
export function readDraft(route: string): DocumentVersion | undefined {
  const fixture = Object.hasOwn(fixtureRoutes, route) ? fixtureRoutes[route] : undefined;
  return readDraftFile(draftFilePath(route)) ?? fixture;
}
