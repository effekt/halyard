import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, test } from "vitest";
import { blockRegistry } from "../nubbin/blockRegistry";
import { catalog } from "../nubbin/catalog";

/**
 * Marine composited onto the light grounds it lands on — `bg-canvas` (`#f1f4f3`) and the white
 * card fill. At 60% it measures 4.00:1 and 4.15:1; at 50%, 3.03:1 and 3.11:1. AA wants 4.5:1 for
 * body text, so neither may reach a rendered block; 70% is the first step that clears it.
 * An alpha composite is not the token it names, which is why a table of solid tokens cannot
 * cover it — see `.claude/rules/accessibility.md`.
 */
const BELOW_AA_INK = ["text-marine/50", "text-marine/60"];

/** Every tone, not only the default one: a block whose defaults are dark renders its light
 * styles on any page that picks them, and that is the ground these inks fail on. */
const TONES = ["light", "dark"];

function inksIn(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[class]")].flatMap((element) =>
    element.className.split(/\s+/).filter((token) => BELOW_AA_INK.includes(token)),
  );
}

describe("muted ink contrast", () => {
  test.each(Object.entries(blockRegistry))("%s renders no ink below AA", async (name, importer) => {
    const Block = (await importer()) as ComponentType<Record<string, unknown>>;
    const defaults = { ...catalog[name]?.defaults } as Record<string, unknown>;
    const tones = typeof defaults.tone === "string" ? TONES : [undefined];
    for (const tone of tones) {
      const props = tone === undefined ? defaults : { ...defaults, tone };
      const { container, unmount } = render(<Block {...props} />);
      expect(inksIn(container), `${name} in the ${tone ?? "only"} tone`).toEqual([]);
      unmount();
    }
  });
});
