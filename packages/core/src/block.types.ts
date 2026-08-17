import type { StandardSchemaV1 } from "@standard-schema/spec";

export type UnknownProps = Record<string, unknown>;

/**
 * A block's props, derived from its schema. The whole of invariant 1 in one type: there is no
 * second definition of a block's shape, so nothing can drift from it.
 *
 * `InferOutput` rather than `InferInput` because a component receives what `validate()`
 * returned — compile freezes the validated value, so a field a transform reshaped reaches the
 * component in its output form, not as the author typed it.
 */
export type InferProps<Schema extends StandardSchemaV1> = StandardSchemaV1.InferOutput<Schema>;

export interface SlotConstraint {
  /** Block names permitted here, each resolved at registration. Omitted means any registered block. */
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
