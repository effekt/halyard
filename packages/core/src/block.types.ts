import type { StandardSchemaV1 } from "@standard-schema/spec";

export type UnknownProps = Record<string, unknown>;

export interface SlotConstraint {
  /** Block names permitted here. Omitted means any registered block. */
  allow?: readonly string[];
  min?: number;
  max?: number;
}

export interface Block<Schema extends StandardSchemaV1 = StandardSchemaV1, Component = unknown> {
  /** Stable identity, referenced by every node. Renaming it is a migration. */
  name: string;
  schema: Schema;
  /** Generic so core never imports a rendering library. */
  component: Component;
  /** Bumped when the schema changes incompatibly. */
  version: number;
  /** A deprecated block still resolves; the studio hides it from the palette. */
  status?: "active" | "deprecated";
  slots: Record<string, SlotConstraint>;
  /** Same-node prop reshaping only. It cannot touch slots, or split or delete a block. */
  migrate?: Record<number, (props: UnknownProps) => UnknownProps>;
}
