import { z } from "zod";

/** No authored props at all: everything a stack shows arrives through its `sections` slot. */
export const sectionStackSchema = z.object({});
