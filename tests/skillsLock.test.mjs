// `skills-lock.json` is the only committed record of which third-party skills this repository is
// worked on with. That makes it a claim about an environment nobody can see from the repository,
// and an unverified claim drifts three ways: an entry for a skill nobody installed sends a
// contributor to fetch something the work never used, an installed skill missing from the lockfile
// is a result nobody else can reproduce, and a skill whose text has changed under a name that still
// matches is the one that changes what an agent produces while looking identical.
//
// Two halves, because they need different things. The lockfile has to parse and every entry has to
// carry the fields a reinstall reads — true on any machine, and the half that was missing when a
// `skills-lock.json` replaced with `{ this is not valid json` exited 0 on every CI run. The
// comparison against disk needs `.agents/skills`, which is gitignored, so a runner has none: that
// half is skipped rather than passed, because a skipped test says so and a tick does not.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installedSkills, skillFiles } from "../scripts/installedSkills.mjs";
import { skillDigest } from "../scripts/skillDigest.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";

const REQUIRED = ["source", "sourceType", "skillPath", "contentHash"];
const lock = JSON.parse(readFileSync(join(REPO_ROOT, "skills-lock.json"), "utf8"));
const hasSkillsOnDisk = existsSync(join(REPO_ROOT, ".agents", "skills"));

describe("the digest", () => {
  it("changes when content moves between two files", () => {
    const written = new Map([
      ["SKILL.md", Buffer.from("one")],
      ["rules.md", Buffer.from("two")],
    ]);
    const swapped = new Map([
      ["SKILL.md", Buffer.from("two")],
      ["rules.md", Buffer.from("one")],
    ]);
    expect(skillDigest(written)).not.toBe(skillDigest(swapped));
  });

  it("does not depend on the order files are read in", () => {
    const forwards = new Map([
      ["a", Buffer.from("1")],
      ["b", Buffer.from("2")],
    ]);
    const backwards = new Map([
      ["b", Buffer.from("2")],
      ["a", Buffer.from("1")],
    ]);
    expect(skillDigest(forwards)).toBe(skillDigest(backwards));
  });
});

describe("the lockfile", () => {
  it("is one a reinstall could use", () => {
    expect(Object.keys(lock.skills ?? {}).length).toBeGreaterThan(0);
    const problems = Object.entries(lock.skills).flatMap(([name, entry]) =>
      REQUIRED.filter((field) => typeof entry[field] !== "string" || entry[field] === "").map(
        (field) => `${name}  missing ${field}`,
      ),
    );
    expect(problems).toEqual([]);
  });
});

describe.skipIf(!hasSkillsOnDisk)("the skills installed here", () => {
  it("are the set the lockfile records, by name", async () => {
    const installed = await installedSkills(REPO_ROOT);
    expect(installed.sort()).toEqual(Object.keys(lock.skills).sort());
  });

  it("are the content the lockfile records, over every file in each skill", async () => {
    const drifted = [];
    for (const [name, entry] of Object.entries(lock.skills)) {
      const files = await skillFiles(REPO_ROOT, name);
      if (files === null) {
        drifted.push(`${name}  no SKILL.md on disk`);
        continue;
      }
      const digest = skillDigest(files);
      if (digest !== entry.contentHash) {
        drifted.push(
          `${name}  recorded ${entry.contentHash.slice(0, 12)}…, on disk ${digest.slice(0, 12)}…`,
        );
      }
    }
    expect(drifted).toEqual([]);
  });
});
