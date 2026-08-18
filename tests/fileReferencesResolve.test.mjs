// Every repository file named inside a code span exists, or is gitignored on purpose.
//
// The detector is `scripts/danglingFileRefs.mjs` rather than logic here, because
// `scaffold-issue.mjs` asks the same question of an issue draft that is not in the tree. One home,
// so a ticket and a document are held to the same rule rather than to two copies of it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { danglingFileRefs } from "../scripts/danglingFileRefs.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

const AGENTS = join(REPO_ROOT, "AGENTS.md");
const refs = (text) => danglingFileRefs(REPO_ROOT, AGENTS, text);

describe("the detector", () => {
  it("fails a span naming a real root file with the wrong extension", () => {
    expect(refs("see `commitlint.config.js`")).toEqual(["commitlint.config.js"]);
  });

  it("fails a span naming a path that is not there", () => {
    expect(refs("see `scripts/check-nothing.mjs`")).toEqual(["scripts/check-nothing.mjs"]);
  });

  it("passes a span naming a file that is there", () => {
    expect(refs("see `commitlint.config.mjs`")).toEqual([]);
  });

  it("leaves module specifiers and shapes alone", () => {
    expect(refs("`next/cache.js`, `@nubbin/core`, `packages/*/src`, `<Name>.block.ts`")).toEqual(
      [],
    );
  });

  it("leaves a deliberately absent, gitignored path alone", () => {
    expect(refs("see `.claude/CATALOG.md`")).toEqual([]);
  });
});

describe("every tracked document", () => {
  it("names only repository files that exist", () => {
    const files = trackedFiles(REPO_ROOT).filter((path) => path.endsWith(".md"));
    expect(files.length).toBeGreaterThan(20);
    const offenders = files.flatMap((rel) => {
      const file = join(REPO_ROOT, rel);
      return danglingFileRefs(REPO_ROOT, file, readFileSync(file, "utf8")).map(
        (span) => `${rel}  ${span}`,
      );
    });
    expect(offenders).toEqual([]);
  });
});
