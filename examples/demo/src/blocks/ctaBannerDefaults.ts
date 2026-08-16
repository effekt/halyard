import type { z } from "zod";
import type { ctaBannerSchema } from "./CtaBanner.schema";

export const ctaBannerDefaults: z.infer<typeof ctaBannerSchema> = {
  heading: "Ready to chart a clearer course?",
  body: "Start a free trial today — no credit card, and your first workstream is live in minutes.",
  tone: "dark",
  cta: { label: "Start a free trial", href: "/pricing" },
};
