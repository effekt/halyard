import type { Artifact } from "@nubbin/core";
import { setNodeProp } from "@nubbin/core";
import { compileVersion } from "./compileVersion";
import { editedDrafts } from "./editedDrafts";
import { readDraft } from "./readDraft";

/**
 * The commit half of editing: apply one field edit, compile the result, and keep it only if
 * it compiled — the preview always renders, and a bad value surfaces as the thrown
 * `CompileError` instead of a broken page. `undefined` when the route has no draft, matching
 * `compileDraft`.
 */
export function commitDraftEdit(
  route: string,
  nodeId: string,
  path: string,
  value: unknown,
): Artifact | undefined {
  const draft = readDraft(route);
  if (draft === undefined) {
    return undefined;
  }
  const edited = setNodeProp(draft, nodeId, path, value);
  const artifact = compileVersion(edited, route);
  editedDrafts.set(route, edited);
  return artifact;
}
