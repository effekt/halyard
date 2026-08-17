import type { z } from "zod";
import type { sectionStackSchema } from "./SectionStack.schema";

export const sectionStackDefaults: z.infer<typeof sectionStackSchema> = {};
