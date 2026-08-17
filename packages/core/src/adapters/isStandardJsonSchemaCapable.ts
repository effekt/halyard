import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

/**
 * True when a schema exposes the Standard JSON Schema converter — the only door the adapter
 * reads a schema through, so `core` never touches a validator's internals.
 */
export function isStandardJsonSchemaCapable(value: unknown): value is StandardJSONSchemaV1 {
  if (typeof value !== "object" || value === null || !("~standard" in value)) return false;
  const props = value["~standard"];
  if (typeof props !== "object" || props === null || !("jsonSchema" in props)) return false;
  const converter = props.jsonSchema;
  if (typeof converter !== "object" || converter === null || !("input" in converter)) return false;
  return typeof converter.input === "function";
}
