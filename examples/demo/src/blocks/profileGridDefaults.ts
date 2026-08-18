import type { z } from "zod";
import type { profileGridSchema } from "./ProfileGrid.schema";

export const profileGridDefaults: z.infer<typeof profileGridSchema> = {
  heading: "The crew",
  tone: "light",
  people: [
    {
      name: "Marta Voss",
      role: "Founder",
      bio: "Ran delivery for a fifty-person studio and kept the schedule in her head until it stopped fitting.",
    },
    {
      name: "Dele Akande",
      role: "Engineering",
      bio: "Builds the import pipeline. Believes a tool you cannot leave in an afternoon is a trap, not a product.",
    },
    {
      name: "Priya Shah",
      role: "Operations",
      bio: "Our first customer before joining. Still reads the schedule the way a customer does — out loud, on Mondays.",
    },
  ],
};
