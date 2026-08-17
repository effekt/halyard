import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Narrows to a schema exposing `~standard.validate` — the one door validation goes through,
 * whichever validator the consumer brings.
 */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  if (typeof value !== "object" || value === null) return false;
  if (!("~standard" in value)) return false;
  const contract = value["~standard"];
  if (typeof contract !== "object" || contract === null) return false;
  return "validate" in contract && typeof contract.validate === "function";
}
