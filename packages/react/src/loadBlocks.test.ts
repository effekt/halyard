import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { defineRegistry } from "./defineRegistry";
import { loadBlocks } from "./loadBlocks";

const Hero = (props: { title: string }): ReactNode => props.title;
const Faq = (): ReactNode => null;
const Gallery = (): ReactNode => null;

describe("loadBlocks", () => {
  test("loads exactly the names asked for", async () => {
    const registry = defineRegistry({
      Hero: () => Promise.resolve(Hero),
      Faq: () => Promise.resolve(Faq),
    });

    const blocks = await loadBlocks(registry, ["Hero"]);

    expect(blocks).toEqual({ Hero });
  });

  test("what comes back renders with the props an artifact carries", async () => {
    const registry = defineRegistry({ Hero: () => Promise.resolve(Hero) });

    const blocks = await loadBlocks(registry, ["Hero"]);
    const Component = blocks.Hero;
    if (!Component) {
      throw new Error("loadBlocks dropped a name it resolved");
    }

    expect(await Component({ title: "Summer sale" })).toBe("Summer sale");
  });

  test("never invokes an importer for a block not named — the per-route cost claim", async () => {
    const loads = { Hero: 0, Faq: 0, Gallery: 0 };
    const registry = defineRegistry({
      Hero: () => {
        loads.Hero += 1;
        return Promise.resolve(Hero);
      },
      Faq: () => {
        loads.Faq += 1;
        return Promise.resolve(Faq);
      },
      Gallery: () => {
        loads.Gallery += 1;
        return Promise.resolve(Gallery);
      },
    });

    await loadBlocks(registry, ["Hero"]);

    expect(loads).toEqual({ Hero: 1, Faq: 0, Gallery: 0 });
  });

  test("names the whole registry can satisfy all resolve", async () => {
    const registry = defineRegistry({
      Hero: () => Promise.resolve(Hero),
      Faq: () => Promise.resolve(Faq),
    });

    const blocks = await loadBlocks(registry, ["Faq", "Hero"]);

    expect(blocks).toEqual({ Hero, Faq });
  });

  test("rejects naming every missing block, not just the first", async () => {
    const registry = defineRegistry({ Hero: () => Promise.resolve(Hero) });

    await expect(loadBlocks(registry, ["Ghost", "Hero", "Phantom"])).rejects.toThrow(
      /Ghost.*Phantom/s,
    );
  });

  test("a missing name loads nothing — the failure is the whole list, not a partial result", async () => {
    let heroLoads = 0;
    const registry = defineRegistry({
      Hero: () => {
        heroLoads += 1;
        return Promise.resolve(Hero);
      },
    });

    await expect(loadBlocks(registry, ["Hero", "Ghost"])).rejects.toThrow(/Ghost/);
    expect(heroLoads).toBe(0);
  });
});
