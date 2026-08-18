// Installs every package from its own tarball into an empty project and imports it.
//
// Reading the packed *manifest* was a separate gate. Nothing loaded the packed *code*, and three
// defects shipped through that gap: a peer dependency the package never imported, a workspace
// protocol that had to survive rewriting, and a bare subpath specifier that resolves only through a
// bundler — which broke every export in the package, not just the one that used it.
//
// Each was invisible in the source tree, in the tests and in every other gate. The only place they
// existed was the artifact a consumer installs, so that is what this loads. The install is real,
// peers included, because the failures were resolution failures and a shim would have resolved what
// npm does not.
//
// The manifest assertion is kept as one expectation rather than a second gate, because the install
// below already subsumes it: npm has no `catalog:` protocol, so a packed manifest carrying one
// fails with `EUNSUPPORTEDPROTOCOL` before anything is unpacked. The expectation is here for the
// diagnostic — a message naming the specifier beats one naming the protocol.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { packageManagerCommand } from "../../scripts/packageManager.mjs";
import { publishablePackages } from "../support/publishablePackages.mjs";

const UNRESOLVED = /"(catalog:[^"]*|workspace:[^"]*|link:[^"]*)"/g;

// `-C` rather than cwd: a package manager running this exports environment pointing at the
// workspace root, which wins over the child's working directory. pnpm then packs the root, whose
// manifest has no `version`, and reports that instead of the cause.
const [PACK, PACK_ARGV] = packageManagerCommand();

describe("every publishable package", () => {
  const dirs = publishablePackages();
  let tarballs;
  let project;
  let archives;

  beforeAll(() => {
    tarballs = mkdtempSync(join(tmpdir(), "nubbin-tgz-"));
    project = mkdtempSync(join(tmpdir(), "nubbin-consumer-"));
    for (const dir of dirs) {
      execFileSync(PACK, [...PACK_ARGV, "-C", dir, "pack", "--pack-destination", tarballs], {
        stdio: "pipe",
      });
    }
    archives = readdirSync(tarballs).map((file) => join(tarballs, file));
  });

  afterAll(() => {
    rmSync(tarballs, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  });

  it("packs with every dependency resolved to a real version", () => {
    expect(dirs.length).toBeGreaterThan(0);
    expect(archives).toHaveLength(dirs.length);
    const offenders = [];
    for (const archive of archives) {
      const manifest = execFileSync("tar", ["-xzOf", archive, "package/package.json"], {
        encoding: "utf8",
      });
      for (const [, specifier] of manifest.matchAll(UNRESOLVED)) {
        offenders.push(`${basename(archive)}  ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("installs from its own tarball into an empty project and imports", () => {
    writeFileSync(join(project, "package.json"), '{"name":"consumer","private":true}\n');
    execFileSync("npm", ["install", "--no-audit", "--no-fund", ...archives], {
      cwd: project,
      stdio: "pipe",
    });
    const names = dirs.map(
      (dir) => JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name,
    );
    const probe = join(project, "probe.mjs");
    const body = names
      .map(
        (name) => `{ const m = await import(${JSON.stringify(name)});
  if (Object.keys(m).length === 0) throw new Error(${JSON.stringify(name)} + " imported with no exports");
  console.log("ok " + ${JSON.stringify(name)} + " — " + Object.keys(m).length + " export(s)"); }`,
      )
      .join("\n");
    writeFileSync(probe, body);
    const output = execFileSync(process.execPath, [probe], { cwd: project, encoding: "utf8" });
    expect(output.split("\n").filter(Boolean)).toHaveLength(names.length);
  });
});
