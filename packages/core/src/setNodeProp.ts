import type { DocumentVersion, Node } from "./document.types";
import { setAtPath } from "./setAtPath";

/**
 * The first document operation: a new `DocumentVersion` with one prop set on one node,
 * copy-on-write, every other node untouched by reference. It lives beside `compile` so any
 * caller — an editor, a script, an agent — writes a document the same way
 * ([#134](https://github.com/effekt/nubbin/issues/134)).
 *
 * It does not validate the value (that is `compile`'s job at the next compile) and does not
 * bump `version` — appending a version is the authoring store's concern
 * ([#11](https://github.com/effekt/nubbin/issues/11)), not a property of one edit.
 */
export function setNodeProp(
  version: DocumentVersion,
  nodeId: string,
  path: string,
  value: unknown,
): DocumentVersion {
  const node = version.elements[nodeId];
  if (node === undefined) {
    throw new Error(`no node "${nodeId}" in document "${version.documentId}"`);
  }
  const edited: Node = { ...node, props: setAtPath(node.props, path, value) };
  return { ...version, elements: { ...version.elements, [nodeId]: edited } };
}
