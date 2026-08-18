// Fails when a publishable package is missing what a registry page needs.
//
// Four packages shipped with no README, so npmjs.com rendered "ERROR: No README data found!" as
// the public page of each. Three also declared no `license`, which npm reads as unlicensed on a
// project whose LICENSE sits at the repository root, and no `repository`, which is what provenance
// attests against.
//
// publint passes all of it. It checks that a package RESOLVES — the exports map, the types
// condition, the file paths — not that it is presentable or correctly licensed. Those are different
// questions and only one of them had a gate.
//
// A README is required on disk rather than in the tarball: npm always includes README.md and
// LICENSE from a package directory regardless of `files`, so its presence beside the manifest is
// what decides whether the registry page has anything on it.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { publishablePackages } from "./support/publishablePackages.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";

const REQUIRED = ["description", "license", "repository"];

function shortfall(packageDir) {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const missing = REQUIRED.filter((field) => {
    const value = manifest[field];
    return value === undefined || value === "" || Object.keys(value).length === 0;
  }).map((field) => `${field} — the registry page shows nothing for it`);
  if (!existsSync(join(packageDir, "README.md"))) {
    missing.push('README.md — npm renders "ERROR: No README data found!" without one');
  }
  if (!existsSync(join(packageDir, "LICENSE"))) {
    missing.push("LICENSE — pnpm may carry the root copy, which is not a guarantee to rely on");
  }
  return missing;
}

describe("the detector", () => {
  it("reports every reason a package would render as an empty registry page", () => {
    const dir = mkdtempSync(join(tmpdir(), "nubbin-metadata-"));
    try {
      writeFileSync(join(dir, "package.json"), '{"name":"@nubbin/nothing","version":"0.0.0"}');
      expect(shortfall(dir)).toEqual([
        "description — the registry page shows nothing for it",
        "license — the registry page shows nothing for it",
        "repository — the registry page shows nothing for it",
        'README.md — npm renders "ERROR: No README data found!" without one',
        "LICENSE — pnpm may carry the root copy, which is not a guarantee to rely on",
      ]);
      writeFileSync(join(dir, "README.md"), "# something\n");
      expect(shortfall(dir)).not.toContain(
        'README.md — npm renders "ERROR: No README data found!" without one',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("every publishable package", () => {
  it("carries a README, a licence and repository metadata", () => {
    const dirs = publishablePackages();
    expect(dirs.length).toBeGreaterThan(0);
    const offenders = dirs
      .map((dir) => ({ dir: relative(REPO_ROOT, dir), missing: shortfall(dir) }))
      .filter(({ missing }) => missing.length > 0)
      .map(({ dir, missing }) => `${dir}  ${missing.join("; ")}`);
    expect(offenders).toEqual([]);
  });
});
