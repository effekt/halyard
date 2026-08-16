import type { z } from "zod";
import type { statBandSchema } from "./StatBand.schema";

export const statBandDefaults: z.infer<typeof statBandSchema> = {
  tone: "dark",
  stats: [
    { value: "18 hrs", label: "saved per team, per month, on status updates" },
    { value: "4.9 / 5", label: "average rating from planning leads" },
    { value: "6 min", label: "median time to set up a new workstream" },
  ],
};
