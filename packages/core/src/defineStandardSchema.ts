import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";
import type { StandardDataSchema } from "./standardDataSchema.types";

/** The Standard Schema revision these hand-written schemas declare. */
const STANDARD_SCHEMA_VERSION = 1;

/**
 * The `~standard` envelope the hand-written schemas share: validation from an issue collector,
 * and a JSON Schema projection so `zodAdapter.describe` reads the same field tree it reads from
 * a validator's own schemas. Written against `@standard-schema/spec` alone, so `core` still
 * depends on nothing.
 */
export function defineStandardSchema<Value>(
  issuesOf: (value: unknown) => StandardSchemaV1.Issue[],
  jsonSchemaOf: (options: StandardJSONSchemaV1.Options) => Record<string, unknown>,
): StandardDataSchema<Value> {
  return {
    "~standard": {
      version: STANDARD_SCHEMA_VERSION,
      vendor: "nubbin",
      validate: (value: unknown) => {
        const issues = issuesOf(value);
        // The one assertion in the chain: `issuesOf` returning nothing is what makes it true.
        return issues.length > 0 ? { issues } : { value: value as Value };
      },
      jsonSchema: { input: jsonSchemaOf, output: jsonSchemaOf },
    },
  };
}
