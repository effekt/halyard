import type { DocumentVersion, Node } from "@nubbin/core";

/** The props a fixture uses for its visible title, in the order to prefer them. */
const TITLE_FIELDS = ["headline", "heading"];

/**
 * Suffixes the first title prop found with `stamp`, so republishing the same fixture yields a
 * different hash and visibly different bytes.
 *
 * Without it there is no way to tell an invalidated route from an untouched one: republishing an
 * unchanged document is content-addressed to the same hash, so the pointer would not move and
 * the page would be byte-identical either way. The stamp is what makes "winter changed, flash
 * did not" observable.
 */
export function stampedVersion(version: DocumentVersion, stamp?: string): DocumentVersion {
  if (stamp === undefined) {
    return version;
  }
  const elements: Record<string, Node> = { ...version.elements };
  for (const [id, node] of Object.entries(elements)) {
    const field = TITLE_FIELDS.find((name) => typeof node.props[name] === "string");
    if (field !== undefined) {
      const stamped = `${String(node.props[field])} ${stamp}`;
      elements[id] = { ...node, props: { ...node.props, [field]: stamped } };
      return { ...version, elements };
    }
  }
  throw new Error(`no ${TITLE_FIELDS.join(" or ")} prop to stamp in ${version.documentId}`);
}
