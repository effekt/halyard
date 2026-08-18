import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ReadOnlyField } from "./ReadOnlyField";

/** Marine at 60% composites to 4.00:1 on `bg-canvas` and 4.15:1 on the inspector's white panel —
 * both under AA's 4.5:1 for body text. See `.claude/rules/accessibility.md`. */
const BELOW_AA_INK = ["text-marine/50", "text-marine/60"];

describe("ReadOnlyField", () => {
  test("labels the kind in an ink that passes AA on the inspector's white panel", () => {
    const { container } = render(
      <ReadOnlyField field={{ path: "items", kind: "array", optional: false, value: [1] }} />,
    );
    const inks = [...container.querySelectorAll("[class]")].flatMap((element) =>
      element.className.split(/\s+/).filter((token) => BELOW_AA_INK.includes(token)),
    );
    expect(inks).toEqual([]);
  });
});
