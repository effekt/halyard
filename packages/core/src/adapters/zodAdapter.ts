import type { FieldNode, SchemaAdapter } from "../field.types";
import { projectJsonSchema } from "./projectJsonSchema";
import { walkJsonSchema } from "./walkJsonSchema";

/**
 * Reads a zod schema for the studio and hint resolution, entirely through the Standard JSON
 * Schema converter the schema itself carries — `core` imports nothing from zod to do it.
 * Validation never runs against this projection; it always runs `schema["~standard"].validate()`
 * on the real schema.
 */
export const zodAdapter: SchemaAdapter = {
  describe(schema: unknown): FieldNode[] {
    const fields = walkJsonSchema(projectJsonSchema(schema), "");
    const seen = new Set<string>();
    return fields.filter((field) => {
      if (seen.has(field.path)) return false;
      seen.add(field.path);
      return true;
    });
  },
};
