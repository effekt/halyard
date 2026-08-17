export type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "object"
  | "union"
  | "unknown";

export interface FieldNode {
  /** Dotted path from the schema root, with `[]` for array members: `cta.label`, `items[].title`. */
  path: string;
  kind: FieldKind;
  optional: boolean;
  /** Present only for `enum`. */
  members?: readonly string[];
}

export interface SchemaAdapter {
  describe(schema: unknown): FieldNode[];
}
