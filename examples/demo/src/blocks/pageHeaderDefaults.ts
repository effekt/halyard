import type { z } from "zod";
import type { pageHeaderSchema } from "./PageHeader.schema";

export const pageHeaderDefaults: z.infer<typeof pageHeaderSchema> = {
  eyebrow: "Changelog",
  headline: "What shipped, and when",
  body: "We ship weekly. This page is the record.",
  tone: "dark",
};
