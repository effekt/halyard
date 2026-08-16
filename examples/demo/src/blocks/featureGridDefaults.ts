import type { z } from "zod";
import type { featureGridSchema } from "./FeatureGrid.schema";

export const featureGridDefaults: z.infer<typeof featureGridSchema> = {
  heading: "Everything a distributed team needs to stay on course",
  tone: "light",
  items: [
    {
      icon: "chart",
      title: "One read of the schedule",
      body: "Every workstream rolls up into a single timeline, so a stakeholder gets the same answer whether they ask you or open the app.",
    },
    {
      icon: "shield",
      title: "Changes never surprise you",
      body: "Tidewell flags a downstream date the moment an upstream task slips, before it becomes a standup surprise.",
    },
    {
      icon: "bolt",
      title: "Set up in an afternoon",
      body: "Import from a spreadsheet or a ticket tracker and get a working schedule the same day, not after a quarter of onboarding.",
    },
    {
      icon: "layers",
      title: "Built for how teams actually work",
      body: "Nested workstreams, dependencies, and owners map to how the work is really structured, not a flat list pretending it is.",
    },
  ],
};
