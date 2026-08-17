import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";

const block = (name: string, version = 1) =>
  defineBlock({ name, schema: z.object({ t: z.string() }), component: null, version, slots: {} });

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
