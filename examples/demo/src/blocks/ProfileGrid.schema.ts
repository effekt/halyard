import { z } from "zod";
import { profileSchema } from "./profile.schema";

export const profileGridSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  people: z.array(profileSchema),
});
