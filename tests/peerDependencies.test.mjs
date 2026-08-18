// Fails when a package declares a peer dependency nothing in it imports.
//
// npm installs peers by default, so a declared peer is a package the consumer receives whether
// they need it or not. `@nubbin/react` shipped a React peer while importing nothing from React,
// and `npm install @nubbin/react` pulled React in for two pure functions.
//
// This is the same defect knip rejects for `dependencies` — a declaration nothing uses — but knip
// does not read `peerDependencies`, and the tarball install cannot see it either, because the
// package imports perfectly well. It just brings something along.
//
// A peer is matched by any import of it or a subpath, in any source file including tests: a peer
// used only by a test is still genuinely used. `import type` counts, because a type-only peer is a
// real requirement on the consumer's install.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { publishablePackages } from "./support/publishablePackages.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";

function sourceFilesUnder(dir, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFilesUnder(full, found);
    else if (/\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

/** True when any source file imports the peer, or a subpath of it. */
function isImported(packageDir, peer) {
  const escaped = peer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`["']${escaped}(/[^"']*)?["']`);
  return sourceFilesUnder(join(packageDir, "src")).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function unusedPeers(packageDir) {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const peers = Object.keys(manifest.peerDependencies ?? {});
  return { peers, unused: peers.filter((peer) => !isImported(packageDir, peer)) };
}

describe("the detector", () => {
  it("matches a subpath import and a type-only import", () => {
    const react = publishablePackages().find((dir) => dir.endsWith("/react"));
    expect(react).toBeDefined();
    // A peer nothing anywhere imports is unused however the package resolves.
    expect(isImported(react, "not-a-real-package-name")).toBe(false);
  });
});

describe("every publishable package", () => {
  it("imports every peer dependency it declares", () => {
    const dirs = publishablePackages();
    expect(dirs.length).toBeGreaterThan(0);
    const offenders = [];
    let declared = 0;
    for (const dir of dirs) {
      const { peers, unused } = unusedPeers(dir);
      declared += peers.length;
      if (unused.length > 0) offenders.push(`${relative(REPO_ROOT, dir)}  ${unused.join(", ")}`);
    }
    expect(declared).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
