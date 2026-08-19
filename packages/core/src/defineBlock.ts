import type { StandardSchemaV1 } from "@standard-schema/spec";
import { assertBlockVersion } from "./assertBlockVersion";
import { assertSlotBounds } from "./assertSlotBounds";
import type { Block } from "./block.types";

/**
 * Identity at runtime; its job is to fix the generic parameters at the call site so props are
 * inferred from the schema rather than declared beside it. The checks here are the ones the
 * type system cannot make — a version below 1, or a slot that no composition could satisfy.
 */
export function defineBlock<Schema extends StandardSchemaV1, Component>(
  block: Block<Schema, Component>,
): Block<Schema, Component> {
  assertBlockVersion(block.name, block.version);
  assertSlotBounds(block.name, block.slots);
  return block;
}
