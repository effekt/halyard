import type { PrismTheme } from "prism-react-renderer";

/**
 * One code scheme for both site themes, from the colour system artifact's applied code
 * sample — deep-water ground, teal keys, the rope for strings, brass for values. Each
 * colour is AA on this background by the artifact's own contrast tables:
 * https://claude.ai/code/artifact/93952615-c490-4fa2-9427-ab6b92cac765
 * Token classes not listed fall back to `plain`, the highest-contrast pair of the set.
 */
export const codeTheme: PrismTheme = {
  plain: { color: "#F1F4F3", backgroundColor: "#071F25" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "#7C949A", fontStyle: "italic" },
    },
    {
      types: [
        "keyword",
        "property",
        "tag",
        "boolean",
        "constant",
        "symbol",
        "attr-name",
        "selector",
        "builtin",
        "class-name",
      ],
      style: { color: "#4FB3C7" },
    },
    {
      types: ["string", "char", "attr-value", "inserted", "url", "regex"],
      style: { color: "#E4572E" },
    },
    {
      types: ["number", "function", "deleted", "important", "variable"],
      style: { color: "#C08A3E" },
    },
  ],
};
