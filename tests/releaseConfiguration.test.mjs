// Every publishable package is one release-please releases, at the version it is actually at.
//
// Both halves fail silently. A package added under `packages/` that nobody adds to
// `release-please-config.json` is never versioned, never changelogged and never tagged — and
// nothing says so, because release-please releases what it was told about and reports success. A
// `.release-please-manifest.json` entry that disagrees with the manifest beside it is worse: that
// file is what release-please treats as the last released version, so a wrong entry computes the
// next version from a version that never shipped, and looks for a tag that does not exist.
//
// The linked group is asserted too. `linked-versions` is what makes the four packages share a
// version, and it matches on component names — a package missing from `components` keeps its own
// version line while the rest move together, which reads as a release-please bug rather than as a
// configuration gap.

import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";
import { publishablePackages } from "./support/publishablePackages.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";

const CONFIG = JSON.parse(readFileSync(join(REPO_ROOT, "release-please-config.json"), "utf8"));
const MANIFEST = JSON.parse(readFileSync(join(REPO_ROOT, ".release-please-manifest.json"), "utf8"));

/** Every publishable package as `packages/<dir>`, the path form both files key on. */
function releasablePaths() {
  return publishablePackages()
    .map((dir) => `packages/${basename(dir)}`)
    .sort();
}

function versionsOnDisk() {
  const versions = {};
  for (const dir of publishablePackages()) {
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    versions[`packages/${basename(dir)}`] = manifest.version;
  }
  return versions;
}

/** The components the `linked-versions` plugin groups, or `[]` where it is not configured. */
function linkedComponents() {
  const plugin = (CONFIG.plugins ?? []).find((entry) => entry.type === "linked-versions");
  return [...(plugin?.components ?? [])].sort();
}

describe("the detector", () => {
  it("sees a path that one file has and the other does not", () => {
    const configured = ["packages/core", "packages/react"];
    const released = ["packages/core"];
    expect(configured.filter((path) => !released.includes(path))).toEqual(["packages/react"]);
  });
});

describe("release-please", () => {
  it("releases every publishable package", () => {
    const paths = releasablePaths();
    expect(paths.length).toBeGreaterThan(0);
    expect(Object.keys(CONFIG.packages).sort()).toEqual(paths);
    expect(Object.keys(MANIFEST).sort()).toEqual(paths);
  });

  it("records the version each package is actually at", () => {
    expect(MANIFEST).toEqual(versionsOnDisk());
  });

  it("links every package into one version", () => {
    const components = releasablePaths().map((path) => CONFIG.packages[path].component);
    expect(components.every(Boolean)).toBe(true);
    expect(linkedComponents()).toEqual([...components].sort());
  });

  it("stays on the prerelease line rather than graduating off it", () => {
    expect(CONFIG.versioning).toBe("prerelease");
    expect(CONFIG.prerelease).toBe(true);
  });
});
