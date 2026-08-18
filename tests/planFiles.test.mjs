// Rejects plan-shaped files committed under `docs/`.
//
// A plan is a description of work not yet done. As a file it has no close condition: nobody
// deletes it when the work lands and nobody updates it when the work changes shape, so a later
// reader cannot tell a record of what happened from a proposal that was abandoned. An issue
// closes, which is the whole argument — see `.claude/rules/planning.md`.
//
// Skills arrive with their own conventions and `superpowers:writing-plans` writes to
// `docs/superpowers/plans/YYYY-MM-DD-<name>.md` by default, so the shapes below are the ones a
// tool produces without being asked, not hypotheses about what someone might type.

import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

/**
 * Each names a shape a plan arrives in. Kept narrow deliberately: a document *about* planning is
 * legitimate, so the word alone is not the signal — a `plans/` directory, a date-stamped
 * filename, or a stem that is the word itself are.
 */
const PLAN_SHAPES = [
  { test: (rel) => rel.split("/").includes("plans"), why: "a `plans/` directory" },
  { test: (_rel, base) => /^\d{4}-\d{2}-\d{2}[-.]/.test(base), why: "a date-stamped filename" },
  { test: (_rel, base) => /^plan(-|\.)|(-plan)\.md$/.test(base), why: "a filename that is a plan" },
];

function planShapeOf(rel) {
  const base = rel.split("/").pop() ?? "";
  return PLAN_SHAPES.find((shape) => shape.test(rel, base))?.why;
}

describe("the detector", () => {
  it("names each shape a plan arrives in", () => {
    expect(planShapeOf("docs/plans/rollout.md")).toBe("a `plans/` directory");
    expect(planShapeOf("docs/2026-08-18-rollout.md")).toBe("a date-stamped filename");
    expect(planShapeOf("docs/plan-rollout.md")).toBe("a filename that is a plan");
    expect(planShapeOf("docs/rollout-plan.md")).toBe("a filename that is a plan");
  });

  it("leaves a document about planning alone", () => {
    expect(planShapeOf("docs/planning.md")).toBeUndefined();
    expect(planShapeOf(".claude/rules/planning.md")).toBeUndefined();
  });
});

describe("docs/", () => {
  it("holds no plan-shaped file", () => {
    const documents = trackedFiles(REPO_ROOT).filter(
      (path) => path.startsWith("docs/") && path.endsWith(".md"),
    );
    expect(documents.length).toBeGreaterThan(10);
    const offenders = documents
      .map((rel) => ({ rel, why: planShapeOf(rel) }))
      .filter(({ why }) => why !== undefined)
      .map(({ rel, why }) => `${rel}  ${why} — a plan is an issue, because an issue closes`);
    expect(offenders).toEqual([]);
  });
});
