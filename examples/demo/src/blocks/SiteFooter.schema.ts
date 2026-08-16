import { z } from "zod";
import { footerColumnSchema } from "./footerColumn.schema";

export const siteFooterSchema = z.object({
  tagline: z.string(),
  tone: z.enum(["light", "dark"]),
  columns: z.array(footerColumnSchema),
  legal: z.string(),
});
