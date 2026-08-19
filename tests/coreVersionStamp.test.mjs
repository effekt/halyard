// `NUBBIN_VERSION` is compiled into `dist/` and stamped into every artifact as `compiledWith`, so
// an artifact records what produced it. A stale value misreports that, and the field is then worse
// than absent — it looks like an answer. `0.1.0-rc.0` shipped stamping `0.0.0`.
//
// Nothing here writes the constant any more. release-please updates it in the release pull request,
// through the `extra-files` entry in `release-please-config.json` and the `x-release-please-version`
// annotation on the line itself. So this is a pure assertion over two files, and it fails the
// release pull request rather than the release: an annotation that stops matching leaves the
// constant behind while the manifest moves, and that is exactly what this catches.
//
// It runs on the release path as well as in the suite: `pnpm publishable` invokes it ahead of the
// build, because two materially different builds once published under one version string and both
// stamped it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";

const CONSTANT = /export const NUBBIN_VERSION = "([^"]*)"/;
const SOURCE = join(REPO_ROOT, "packages/core/src/version.constants.ts");
const MANIFEST = join(REPO_ROOT, "packages/core/package.json");

function stampedVersion(text) {
  return text.match(CONSTANT)?.[1] ?? null;
}

describe("the detector", () => {
  it("reads the literal past a trailing annotation", () => {
    expect(
      stampedVersion('export const NUBBIN_VERSION = "1.2.3"; // x-release-please-version'),
    ).toBe("1.2.3");
  });

  it("reports nothing where the declaration has been renamed away", () => {
    expect(stampedVersion('export const VERSION = "1.2.3";')).toBe(null);
  });
});

describe("the version stamp", () => {
  it("matches packages/core/package.json", () => {
    const { version } = JSON.parse(readFileSync(MANIFEST, "utf8"));
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
    expect(stampedVersion(readFileSync(SOURCE, "utf8"))).toBe(version);
  });
});
