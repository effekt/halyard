// `trackedFiles` decides the corpus of nearly every repository-wide assertion in this suite, and
// until now nothing exercised it. A corpus function that quietly returns less than it should
// makes every gate above it report a tick over a subset — the failure the module's own comment
// describes and could not itself detect.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isBinaryPath } from "./support/isBinaryPath.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

describe("isBinaryPath", () => {
  it("names what is certainly not text", () => {
    expect(isBinaryPath("docs/hero.png")).toBe(true);
    expect(isBinaryPath("fonts/Inter.woff2")).toBe(true);
    expect(isBinaryPath("packages/core/src/compile.ts")).toBe(false);
    expect(isBinaryPath("README.md")).toBe(false);
  });
});

describe("trackedFiles", () => {
  let repo;

  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), "nubbin-tracked-"));
    // Every `GIT_*` variable is stripped, and hooks are pointed at nothing. Run from a git hook —
    // which is where pre-commit runs this — `GIT_DIR` and `GIT_INDEX_FILE` name the *outer*
    // repository, so a bare `git commit` here operates on that one and re-enters lefthook.
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
    );
    const git = (...argv) =>
      execFileSync("git", ["-c", "core.hooksPath=/dev/null", ...argv], {
        cwd: repo,
        stdio: "pipe",
        env,
      });
    git("init", "-q");
    git("config", "user.email", "t@example.com");
    git("config", "user.name", "t");
    writeFileSync(join(repo, ".gitignore"), "ignored.md\nbuild/\n");
    writeFileSync(join(repo, "committed.md"), "# committed\n");
    git("add", "-A");
    git("commit", "-qm", "seed");
    writeFileSync(join(repo, "untracked.md"), "# untracked\n");
    writeFileSync(join(repo, "ignored.md"), "# ignored\n");
    writeFileSync(join(repo, "logo.png"), "not really a png");
    mkdirSync(join(repo, "build"));
    writeFileSync(join(repo, "build", "out.md"), "# generated\n");
    symlinkSync(join(repo, "committed.md"), join(repo, "ALIAS.md"));
  });

  afterAll(() => rmSync(repo, { recursive: true, force: true }));

  it("returns what is committed and what is written-but-not-ignored", () => {
    const files = trackedFiles(repo);
    expect(files).toContain("untracked.md");
    // `committed.md` is reached through the symlink that aliases it — see the dedup test below.
    expect(files.some((path) => path === "committed.md" || path === "ALIAS.md")).toBe(true);
  });

  it("excludes ignored paths, so build output can never enter a corpus", () => {
    const files = trackedFiles(repo);
    expect(files).not.toContain("ignored.md");
    expect(files).not.toContain("build/out.md");
  });

  it("excludes binaries and collapses a symlink onto its target", () => {
    const files = trackedFiles(repo);
    expect(files).not.toContain("logo.png");
    // The symlink and its target are the same bytes; keeping both would report a perfect clone.
    expect(files.filter((path) => path === "ALIAS.md" || path === "committed.md")).toHaveLength(1);
    expect(files).not.toContain("committed.md");
  });

  it("answers for the directory it was given, not for the repository a hook fired in", () => {
    // A git hook exports GIT_DIR and GIT_INDEX_FILE; git prefers them over cwd.
    const previous = process.env.GIT_DIR;
    process.env.GIT_DIR = join(REPO_ROOT, ".git");
    try {
      expect(trackedFiles(repo)).toContain("untracked.md");
    } finally {
      if (previous === undefined) delete process.env.GIT_DIR;
      else process.env.GIT_DIR = previous;
    }
  });

  it("throws rather than guessing when git cannot answer", () => {
    const notARepo = mkdtempSync(join(tmpdir(), "nubbin-not-a-repo-"));
    try {
      expect(() => trackedFiles(notARepo)).toThrow();
    } finally {
      rmSync(notARepo, { recursive: true, force: true });
    }
  });

  it("reads this repository", () => {
    const files = trackedFiles(REPO_ROOT);
    expect(files).toContain("AGENTS.md");
    expect(files).toContain("package.json");
    expect(files.length).toBeGreaterThan(100);
  });
});
