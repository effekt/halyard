import type { Artifact } from "@nubbin/core";
import { setNodeProp } from "@nubbin/core";
import { compileVersion } from "./compileVersion";
import { editedDrafts } from "./editedDrafts";
import { readDraft } from "./readDraft";

/** What could not be found for an edit that named it: the route's draft, or the node in it.
 * A value rather than a throw because both name a client fault the endpoint answers for. */
export type DraftEditRejection = { missing: "draft" | "node" };

/**
 * The commit half of editing: apply one field edit, compile the result, and keep it only if
 * it compiled — the preview always renders, and a bad value surfaces as the thrown
 * `CompileError` instead of a broken page. The node is checked before `setNodeProp` because
 * this is the first caller holding both the document and the untrusted id — core's throw is
 * for callers that composed the id in code.
 */
export function commitDraftEdit(
  route: string,
  nodeId: string,
  path: string,
  value: unknown,
): Artifact | DraftEditRejection {
  const draft = readDraft(route);
  if (draft === undefined) {
    return { missing: "draft" };
  }
  if (draft.elements[nodeId] === undefined) {
    return { missing: "node" };
  }
  const edited = setNodeProp(draft, nodeId, path, value);
  const artifact = compileVersion(edited, route);
  editedDrafts.set(route, edited);
  return artifact;
}
