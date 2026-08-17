import type { UnknownProps } from "./block.types";

/** Narrows a parsed value to a props record. Standard Schema types the parsed value as unknown, but a block schema parses to an object. */
export function isUnknownProps(value: unknown): value is UnknownProps {
  if (typeof value !== "object") return false;
  return value !== null && !Array.isArray(value);
}
