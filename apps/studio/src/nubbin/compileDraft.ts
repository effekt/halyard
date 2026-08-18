import type { Artifact } from "@nubbin/core";
import { compileVersion } from "./compileVersion";
import { readDraft } from "./readDraft";

/**
 * The studio's compile seam: the current draft — fixture plus in-process edits — against the
 * demo's own catalog and registry. `undefined` rather than a throw for an unknown route, so
 * each caller answers with its own status.
 */
export function compileDraft(route: string): Artifact | undefined {
  const draft = readDraft(route);
  if (draft === undefined) {
    return undefined;
  }
  return compileVersion(draft, route);
}
