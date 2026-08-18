import type { DocumentVersion } from "@nubbin/core";
import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { editedDrafts } from "./editedDrafts";

/** The current draft for a route: the committed fixture, overlaid by whatever this process
 * has edited. `undefined` for a route no fixture covers. */
export function readDraft(route: string): DocumentVersion | undefined {
  return editedDrafts.get(route) ?? fixtureRoutes[route];
}
