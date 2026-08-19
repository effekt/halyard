import { z } from "zod";
import { richTextSchema } from "./shared/richText.schema";

/** `body` is rich text: inline structure the schema can see, never markup inside a string. */
export const proseSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  body: richTextSchema,
});
