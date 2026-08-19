import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A schema `core` hand-writes rather than one a validator brings. Narrower than
 * `StandardSchemaV1` in the two ways that matter to a consumer hosting it: `validate` is
 * synchronous, which compile requires anyway, and the JSON Schema converter is always there,
 * so the studio can read the field tree without testing for it.
 */
export interface StandardDataSchema<Value> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardSchemaV1.Result<Value>;
    readonly jsonSchema: StandardJSONSchemaV1.Converter;
  };
}
