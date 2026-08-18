import type { Config } from "@docusaurus/types";

import { codeTheme } from "./codeTheme";

// The site renders `docs/` in place — the documents' one home on `main` — so the content
// root points up and out of this workspace rather than at a copy of anything.
const config: Config = {
  title: "Nubbin",
  tagline: "Your components. Their pages. A page builder that lives inside your codebase.",
  // Where GitHub Pages serves the artifact CI deploys, recorded in docs/decisions/
  // ("The design site runs Docusaurus"). The address is the repository's own, so it moves
  // when the decision does and not when a domain is bought.
  url: "https://effekt.github.io",
  baseUrl: "/nubbin/",
  organizationName: "effekt",
  projectName: "nubbin",
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  markdown: {
    // `detect` keeps `.md` files on CommonMark, where `<Route>` in prose is text rather
    // than a component reference MDX fails to resolve.
    format: "detect",
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "throw" },
  },

  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      {
        docs: {
          path: "../../docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.config.ts",
          // The function form: the string form is joined to the doc's path relative to this
          // workspace, and `../../docs` normalises the repository out of the URL.
          editUrl: ({ docPath }: { docPath: string }) =>
            `https://github.com/effekt/nubbin/edit/main/docs/${docPath}`,
        },
        blog: false,
        pages: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    prism: { theme: codeTheme, darkTheme: codeTheme },
    navbar: {
      title: "Nubbin",
      items: [{ href: "https://github.com/effekt/nubbin", label: "GitHub", position: "right" }],
    },
  },
};

export default config;
