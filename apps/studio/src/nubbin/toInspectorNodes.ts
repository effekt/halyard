import type { Catalog, DocumentVersion } from "@nubbin/core";
import { zodAdapter } from "@nubbin/core";
import type { InspectorNode } from "./inspector.types";
import { withFieldValue } from "./withFieldValue";

/** The inspector's whole input, derived per render: every node in the draft, each field read
 * from the block's schema and paired with the draft's current value. */
export function toInspectorNodes(
  version: DocumentVersion,
  catalog: Catalog,
): Record<string, InspectorNode> {
  const nodes: Record<string, InspectorNode> = {};
  for (const node of Object.values(version.elements)) {
    const entry = catalog[node.block];
    const fields = entry === undefined ? [] : zodAdapter.describe(entry.schema);
    nodes[node.id] = {
      id: node.id,
      block: node.block,
      fields: fields.map((field) => withFieldValue(field, node.props)),
    };
  }
  return nodes;
}
