import type { z } from "zod";
import type { siteFooterSchema } from "./SiteFooter.schema";

export const siteFooterDefaults: z.infer<typeof siteFooterSchema> = {
  tagline: "One schedule. Read the same way by everyone on the team.",
  tone: "dark",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Changelog", href: "/#" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "/#" },
        { label: "Careers", href: "/#" },
        { label: "Contact", href: "/#" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Documentation", href: "/#" },
        { label: "Support", href: "/#" },
        { label: "Status", href: "/#" },
      ],
    },
  ],
  legal: "© 2026 Tidewell. All rights reserved.",
};
