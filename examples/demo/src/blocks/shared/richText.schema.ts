import { type RichText, richText } from "@nubbin/core";
import { z } from "zod";

const spec = richText();
const JSON_SCHEMA = spec["~standard"].jsonSchema.input({ target: "draft-2020-12" });

/**
 * `core`'s rich-text schema, seated inside the validator this site's blocks are written in.
 * zod holds only the seat: it rejects a foreign Standard Schema in an object shape, so the
 * field is carried as `unknown`, `core` decides what is valid and supplies the JSON Schema the
 * studio reads its field tree from, and `z.custom` carries the type across the pipe.
 */
export const richTextSchema = z
  .unknown()
  .check((ctx) => {
    const result = spec["~standard"].validate(ctx.value);
    if (result.issues === undefined) return;
    for (const issue of result.issues) {
      // The spec allows a path segment to be a key or a `{ key }` wrapper; zod wants the key.
      const path = (issue.path ?? []).map((segment) =>
        typeof segment === "object" ? segment.key : segment,
      );
      ctx.issues.push({ code: "custom", message: issue.message, path, input: ctx.value });
    }
  })
  .pipe(z.custom<RichText>())
  .meta(JSON_SCHEMA);
