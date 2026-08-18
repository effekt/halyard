import { describe, expect, test } from "vitest";
import { formatCompatibilityReport } from "./formatCompatibilityReport";

describe("formatCompatibilityReport", () => {
  test("a passing run states how many pointers it read, so an empty store cannot read as a pass", () => {
    expect(formatCompatibilityReport({ checked: 8, compatible: true, incompatible: [] })).toBe(
      "8 live route pointer(s) checked; every one is compatible with this registry.",
    );
    expect(formatCompatibilityReport({ checked: 0, compatible: true, incompatible: [] })).toBe(
      "0 live route pointer(s) checked; every one is compatible with this registry.",
    );
  });

  test("a failing run counts the affected routes and lists each one's blocks", () => {
    expect(
      formatCompatibilityReport({
        checked: 8,
        compatible: false,
        incompatible: [
          {
            route: "/",
            hash: "4a162726",
            reason: "block-drift",
            drifted: [{ block: "Hero", live: 1, registered: null }],
          },
        ],
      }),
    ).toBe(
      [
        "1 of 8 live route pointer(s) are incompatible with this registry:",
        "  /  (artifact 4a162726)",
        "    Hero: page needs v1, no longer in the registry",
      ].join("\n"),
    );
  });
});
