import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";

const block = (name: string, version = 1) =>
  defineBlock({ name, schema: z.object({ t: z.string() }), component: null, version, slots: {} });

const withSlot = (name: string, slot: string, allow: readonly string[]) =>
  defineBlock({
    name,
    schema: z.object({ t: z.string() }),
    component: null,
    version: 1,
    slots: { [slot]: { allow } },
  });

describe("createRegistry", () => {
  test("resolves a block by name and reports the names it holds", () => {
    const registry = createRegistry([block("Hero"), block("FAQ")]);
    expect(registry.get("Hero")?.name).toBe("Hero");
    expect(registry.get("Nope")).toBeUndefined();
    expect(registry.names().sort()).toEqual(["FAQ", "Hero"]);
  });

  test("rejects two blocks with the same name, which would make resolution order matter", () => {
    expect(() => createRegistry([block("Hero"), block("Hero", 2)])).toThrow(/Hero/);
  });

  test("rejects an allow entry naming no registered block, naming block, slot and entry", () => {
    expect(() =>
      createRegistry([withSlot("Page", "items", ["Testimonal"]), block("Testimonial")]),
    ).toThrow(/"Testimonal" \(Page\.items\)/);
  });

  test("names every unresolvable entry, so two typos take one round trip", () => {
    const build = () =>
      createRegistry([
        withSlot("Page", "items", ["Testimonal"]),
        withSlot("Aside", "cards", ["CtaCrd"]),
        block("Testimonial"),
        block("CtaCard"),
      ]);
    expect(build).toThrow(/"Testimonal" \(Page\.items\)/);
    expect(build).toThrow(/"CtaCrd" \(Aside\.cards\)/);
  });

  test("accepts a sibling registered later in the same array", () => {
    const registry = createRegistry([
      withSlot("Page", "items", ["Testimonial"]),
      block("Testimonial"),
    ]);
    expect(registry.names().sort()).toEqual(["Page", "Testimonial"]);
  });

  test("fingerprint is stable across registration order", () => {
    const heroFirst = createRegistry([block("Hero"), block("FAQ")]).fingerprint();
    const faqFirst = createRegistry([block("FAQ"), block("Hero")]).fingerprint();
    expect(heroFirst).toBe(faqFirst);
  });

  test("fingerprint changes when a version changes", () => {
    const before = createRegistry([block("Hero", 1)]).fingerprint();
    const after = createRegistry([block("Hero", 2)]).fingerprint();
    expect(after).not.toBe(before);
  });

  test("fingerprint ignores everything except name and version", () => {
    const plain = createRegistry([block("Hero")]).fingerprint();
    const withSlots = createRegistry([
      defineBlock({
        name: "Hero",
        schema: z.object({ t: z.string() }),
        component: null,
        version: 1,
        slots: { items: { max: 3 } },
        status: "deprecated",
      }),
    ]).fingerprint();
    expect(withSlots).toBe(plain);
  });
});
