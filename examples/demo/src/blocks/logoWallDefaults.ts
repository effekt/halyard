import type { z } from "zod";
import type { logoWallSchema } from "./LogoWall.schema";

export const logoWallDefaults: z.infer<typeof logoWallSchema> = {
  heading: "Trusted by teams who ship on schedule",
  tone: "light",
  logos: [
    { url: "/logos/solstice.svg", alt: "Solstice Analytics" },
    { url: "/logos/bramblewood.svg", alt: "Bramblewood" },
    { url: "/logos/ferro-works.svg", alt: "Ferro Works" },
    { url: "/logos/cobalt-freight.svg", alt: "Cobalt Freight" },
    { url: "/logos/highline.svg", alt: "Highline Studio" },
  ],
};
