import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CATALOGS,
  declaredExports,
  firstSentence,
  generate,
  primaryOf,
  readFrontmatter,
  renderClaude,
  renderPackage,
} from "./catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("readFrontmatter", () => {
  it("reads the key/value pairs between the leading fences", () => {
    const text = '---\ntitle: Gates\npaths: "scripts/**, lefthook.yml"\n---\n\n# Gates\n';
    expect(readFrontmatter(text)).toEqual({ title: "Gates", paths: "scripts/**, lefthook.yml" });
  });

  it("returns nothing for a document with no frontmatter", () => {
    expect(readFrontmatter("# Gates\n")).toEqual({});
  });

  it("keeps a colon inside a value", () => {
    expect(readFrontmatter("---\ndescription: Use when: a thing.\n---\n")).toEqual({
      description: "Use when: a thing.",
    });
  });
});

describe("firstSentence", () => {
  it("takes the first sentence of a multi-sentence doc comment", () => {
    const doc = "Validates a document against its catalog. Structure first, then props.";
    expect(firstSentence(doc)).toBe("Validates a document against its catalog.");
  });

  it("joins a wrapped comment into one line", () => {
    expect(firstSentence("A compiled,\ncontent-addressed page.")).toBe(
      "A compiled, content-addressed page.",
    );
  });

  it("is empty for an empty doc comment", () => {
    expect(firstSentence("")).toBe("");
    expect(firstSentence(undefined)).toBe("");
  });

  it("keeps an abbreviation inside the sentence", () => {
    expect(firstSentence("Fields, e.g. a string. The rest.")).toBe("Fields, e.g. a string.");
  });

  it("keeps a long sentence whole rather than cutting it mid-clause", () => {
    const long = `${"word ".repeat(40)}end. The rest.`;
    const cut = firstSentence(long);
    expect(cut).toBe(`${"word ".repeat(40)}end.`);
    expect(cut).not.toContain("…");
  });

  it("escapes a pipe so a summary cannot break the table", () => {
    expect(firstSentence("Either a string | a number.")).toBe("Either a string \\| a number.");
  });
});

describe("declaredExports", () => {
  it("reads a documented function", () => {
    const source = "/** Does the thing. */\nexport function compile(a) {}\n";
    expect(declaredExports(source, "compile.ts")).toEqual([
      { name: "compile", kind: "fn", isDefault: false, doc: "Does the thing." },
    ]);
  });

  it("reads every type in a types file, in declaration order", () => {
    const source = [
      "import type { X } from './x';",
      "",
      "/** Field path. */",
      "export type Holes = Record<string, X>;",
      "",
      "/** A compiled page. */",
      "export interface Artifact {",
      "  hash: string;",
      "}",
      "",
    ].join("\n");
    expect(declaredExports(source, "artifact.types.ts").map((one) => one.name)).toEqual([
      "Holes",
      "Artifact",
    ]);
    expect(declaredExports(source, "artifact.types.ts")[1]).toMatchObject({
      kind: "type",
      doc: "A compiled page.",
    });
  });

  it("reads a default export and marks it", () => {
    const source = "/** The shell. */\nexport default async function Page() {}\n";
    expect(declaredExports(source, "page.tsx")).toEqual([
      { name: "Page", kind: "component", isDefault: true, doc: "The shell." },
    ]);
  });

  it("calls a PascalCase function in a .tsx file a component and a hook a fn", () => {
    expect(declaredExports("export function Inspector() {}", "Inspector.tsx")[0].kind).toBe(
      "component",
    );
    expect(declaredExports("export function useCanvasPick() {}", "useCanvasPick.ts")[0].kind).toBe(
      "fn",
    );
  });

  it("reads a const as a const, whatever it holds", () => {
    expect(declaredExports("export const NUBBIN_VERSION = '1';", "version.constants.ts")).toEqual([
      { name: "NUBBIN_VERSION", kind: "const", isDefault: false, doc: "" },
    ]);
  });

  it("carries a doc comment across an intervening line comment", () => {
    const source = "/** Stamped in. */\n// Generated. Do not edit.\nexport const A = 1;\n";
    expect(declaredExports(source, "a.constants.ts")[0].doc).toBe("Stamped in.");
  });

  it("does not attach a doc comment separated by a blank line", () => {
    expect(declaredExports("/** Unrelated. */\n\nexport const A = 1;\n", "a.ts")[0].doc).toBe("");
  });

  it("finds nothing in a re-export barrel", () => {
    expect(declaredExports("export { compile } from './compile';", "index.ts")).toEqual([]);
  });
});

describe("primaryOf", () => {
  const exports = [
    { name: "DocumentMeta", kind: "type", isDefault: false, doc: "Meta." },
    { name: "Node", kind: "type", isDefault: false, doc: "A node." },
  ];

  it("prefers the export whose name matches the filename stem", () => {
    const found = primaryOf("artifact.types.ts", [
      { name: "Holes", kind: "type", isDefault: false, doc: "" },
      { name: "Artifact", kind: "type", isDefault: false, doc: "A page." },
    ]);
    expect(found.primary.name).toBe("Artifact");
    expect(found.others).toEqual(["Holes"]);
  });

  it("prefers the default export when no name matches the stem", () => {
    const found = primaryOf("layout.tsx", [
      { name: "metadata", kind: "const", isDefault: false, doc: "" },
      { name: "RootLayout", kind: "component", isDefault: true, doc: "The shell." },
    ]);
    expect(found.primary.name).toBe("RootLayout");
    expect(found.others).toEqual(["metadata"]);
  });

  it("falls back to the first declaration", () => {
    expect(primaryOf("document.types.ts", exports).primary.name).toBe("DocumentMeta");
    expect(primaryOf("document.types.ts", exports).others).toEqual(["Node"]);
  });

  it("has no primary when the file declares nothing", () => {
    expect(primaryOf("index.ts", []).primary).toBeUndefined();
  });
});

describe("renderPackage", () => {
  const rendered = renderPackage({
    name: "@nubbin/core",
    description: "The Nubbin contract.",
    rows: [
      {
        path: "src/compile.ts",
        primary: { name: "compile", kind: "fn" },
        others: [],
        summary: "Validates a document.",
      },
      {
        path: "src/artifact.types.ts",
        primary: { name: "Artifact", kind: "type" },
        others: ["Holes"],
        summary: "",
      },
    ],
  });

  it("heads the page with the package name and its description", () => {
    expect(rendered.split("\n").slice(0, 3)).toEqual([
      "# @nubbin/core",
      "",
      "The Nubbin contract.",
    ]);
  });

  it("links each export to its file", () => {
    expect(rendered).toContain("| [`compile`](src/compile.ts) | fn | Validates a document. |");
  });

  it("leaves an undocumented export's summary cell empty", () => {
    expect(rendered).toContain("| [`Artifact`](src/artifact.types.ts) `Holes` | type |  |");
  });

  it("ends with a newline and no trailing whitespace on any line", () => {
    expect(rendered.endsWith("\n")).toBe(true);
    expect(rendered.split("\n").some((line) => /\s$/.test(line))).toBe(false);
  });
});

describe("renderClaude", () => {
  const rendered = renderClaude({
    rules: [
      { path: "rules/gates.md", paths: "scripts/**, lefthook.yml", summary: "How to add a gate." },
    ],
    agents: [{ path: "agents/planner.md", name: "planner", description: "Audits an issue." }],
    skills: [
      { path: "skills/decision/SKILL.md", name: "decision", description: "Record a decision." },
    ],
  });

  it("carries the three sections", () => {
    expect(rendered).toContain("## Rules");
    expect(rendered).toContain("## Agents");
    expect(rendered).toContain("## Skills");
  });

  it("renders a rule's paths as code spans and its summary as what it enforces", () => {
    expect(rendered).toContain(
      "| [gates.md](rules/gates.md) | `scripts/**` `lefthook.yml` | How to add a gate. |",
    );
  });

  it("names an agent and a skill by their frontmatter", () => {
    expect(rendered).toContain("| [planner](agents/planner.md) | Audits an issue. |");
    expect(rendered).toContain("| [decision](skills/decision/SKILL.md) | Record a decision. |");
  });
});

describe("generate", () => {
  it("emits one catalog per package and top-level surface, and nothing else", async () => {
    const written = await generate(ROOT);
    expect([...written.keys()].sort()).toEqual(
      [
        ".claude/CATALOG.md",
        "apps/studio/CATALOG.md",
        "packages/core/CATALOG.md",
        "packages/next/CATALOG.md",
        "packages/react/CATALOG.md",
        "packages/store-fs/CATALOG.md",
      ].sort(),
    );
    expect(CATALOGS.length).toBe(written.size);
  });

  it("quotes a summary from the source rather than inventing one", async () => {
    const core = (await generate(ROOT)).get("packages/core/CATALOG.md");
    expect(core).toContain("| [`fnv1a`](src/fnv1a.ts) | fn | FNV-1a, 32-bit.");
    expect(core).not.toMatch(/TODO|No description/);
  });

  it("gives an undocumented export an empty cell", async () => {
    const core = (await generate(ROOT)).get("packages/core/CATALOG.md");
    expect(core).toMatch(/\| \[`[A-Za-z]+`\]\([^)]+\)[^|]*\| \w+ \|\s*\|/);
  });

  it("orders rows by path, ignoring case, so a PascalCase filename is not exiled", async () => {
    const core = (await generate(ROOT)).get("packages/core/CATALOG.md");
    const paths = [...core.matchAll(/\]\((src\/[^)]+)\)/g)].map((match) => match[1]);
    expect(paths).toEqual(
      [...paths].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    );
    expect(paths.indexOf("src/CompileError.ts")).toBeGreaterThan(
      paths.indexOf("src/catalog.types.ts"),
    );
  });

  it("has no row for a test file or a re-export barrel", async () => {
    const core = (await generate(ROOT)).get("packages/core/CATALOG.md");
    expect(core).not.toContain(".test.ts");
    expect(core).not.toContain("(src/index.ts)");
  });
});

// Nothing is committed any more, so "the committed files match a fresh generation" has no
// subject — it would compare a generated file against the generator that wrote it moments
// earlier and pass by construction. What is still real, and is what a reader depends on, is that
// the generator runs against this tree at all and answers the same way twice: `pnpm install`
// regenerates these on every machine, so an unstable generator would hand two contributors two
// different indexes of one commit.
describe("the generator, against this repository", () => {
  it("produces every catalog without throwing", async () => {
    const written = await generate(ROOT);
    expect([...written.keys()].sort()).toEqual(
      CATALOGS.map(({ dir }) => `${dir}/CATALOG.md`).sort(),
    );
    for (const [path, content] of written) {
      expect(content, path).toMatch(/^# /m);
    }
  });

  it("answers the same way twice", async () => {
    expect([...(await generate(ROOT))]).toEqual([...(await generate(ROOT))]);
  });
});
