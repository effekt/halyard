import type { FieldNode } from "@nubbin/core";

/** One schema field with the draft's current value beneath it, ready for a field control. */
export interface InspectorField extends FieldNode {
  value: unknown;
}

/** Everything the inspector shows about one node, derived fresh on every server render. */
export interface InspectorNode {
  id: string;
  block: string;
  fields: InspectorField[];
}
