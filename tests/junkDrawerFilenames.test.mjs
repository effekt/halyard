// Rejects junk-drawer filenames: a file named for a category rather than for the unit it holds
// accumulates whatever nobody wanted to name.
//
// Biome owns the line caps and `useFilenamingConvention: filenameCases:["export"]` forces
// filename === export. That last rule technically permits `export const utils = {…}` in `utils.ts`,
// which is exactly the shape worth blocking, so this closes it.
//
// It is also what keeps filename → symbol invertible: `utils.ts` names no unit, so a file with that
// name has no row `scripts/catalog.mjs` could derive. The other two rules make the mapping; this
// one stops a name that maps to nothing.

import { describe, expect, it } from "vitest";
import { sourceFiles } from "./support/sourceFiles.mjs";

const JUNK_BASENAME =
  /^(utils?|helpers?|misc|common|stuff|shared|things|lib|core|base|extras?|temp|tmp)\.(ts|tsx)$/i;

const isJunkDrawer = (path) => JUNK_BASENAME.test(path.split("/").at(-1) ?? "");

describe("the detector", () => {
  it("sees a category name, in either extension", () => {
    expect(isJunkDrawer("packages/core/src/utils.ts")).toBe(true);
    expect(isJunkDrawer("apps/studio/src/helpers.tsx")).toBe(true);
    expect(isJunkDrawer("packages/core/src/Misc.ts")).toBe(true);
  });

  it("leaves a name that names its unit alone", () => {
    expect(isJunkDrawer("packages/core/src/compile.ts")).toBe(false);
    // The word appears, but the file names the unit it holds.
    expect(isJunkDrawer("packages/core/src/sharedRouteKey.ts")).toBe(false);
  });
});

describe("every source file", () => {
  it("is named after the unit it holds", () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(20);
    expect(files.filter(isJunkDrawer)).toEqual([]);
  });
});
