// The compatibility guardrail, as this repository runs it against itself.
//
// The claim: merging a pull request cannot break a page that is already live. The pages already
// live are `examples/demo/live/`, a committed artifact store recorded against the registry at an
// earlier commit; the registry under test is the one in this working tree.
//
// Two assertions, both load-bearing. The first seeds a registry that has lost a block and proves
// the detector still fires. The second is the gate itself, over every live pointer.
//
// This suite is not part of `demo#test` and is registered as no turbo task: its verdict depends
// on the contents of an artifact store, which is state a task hash has no reason to see.

import { checkCompatibility, createRegistry, formatCompatibilityReport } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import { BLOCKS } from "../src/nubbin/blocks.constants";
import { liveStore } from "../src/nubbin/liveStore";
import { readLiveRoutes } from "../src/nubbin/readLiveRoutes";
import { liveCompatibility } from "./liveCompatibility";

describe("the registry in this commit against the pages already live", () => {
  test("a block removed from the registry is reported against every live route that needs it", async () => {
    const withoutHero = createRegistry(BLOCKS.filter((block) => block.name !== "Hero"));
    const report = checkCompatibility(await readLiveRoutes(liveStore), withoutHero);

    expect(report.compatible).toBe(false);
    expect(report.incompatible.map((entry) => entry.route)).toContain("/");
    expect(formatCompatibilityReport(report)).toContain(
      "Hero: page needs v1, no longer in the registry",
    );
  });

  test("every live route pointer is compatible with the registry in this commit", async () => {
    const report = await liveCompatibility();

    // A store with no pointers is compatible with everything, which is the shape a gate takes
    // when it has quietly stopped reading anything. Assert the corpus before the verdict.
    expect(report.checked).toBeGreaterThan(0);

    expect(
      formatCompatibilityReport(report),
      "A block a live page needs has changed version or been removed. Either restore it, or " +
        "republish the affected pages and re-record the committed store with " +
        "`pnpm --filter demo run live:record` — in this pull request, so the change to what is " +
        "live is reviewed beside the change that caused it.",
    ).toBe(
      `${report.checked} live route pointer(s) checked; every one is compatible with this registry.`,
    );
  });
});
