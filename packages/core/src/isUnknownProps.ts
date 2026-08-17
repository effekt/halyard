import type { UnknownProps } from "./block.types";

/** Narrows a parsed value to a props record. Standard Schema types the parsed value as unknown, but a block schema parses to an object. */
export function isUnknownProps(value: unknown): value is UnknownProps {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
