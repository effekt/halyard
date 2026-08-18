import { describe, expect, test } from "vitest";
import { formatBlockDrift } from "./formatBlockDrift";

describe("formatBlockDrift", () => {
  test("names the block and both versions", () => {
    expect(formatBlockDrift({ block: "Hero", live: 1, registered: 2 })).toBe(
      "Hero: page needs v1, registry has v2",
    );
  });

  test("a removed block reads as removed rather than as a null version", () => {
    expect(formatBlockDrift({ block: "Hero", live: 1, registered: null })).toBe(
      "Hero: page needs v1, no longer in the registry",
    );
  });
});
