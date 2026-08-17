import type { UnknownProps } from "@nubbin/core";
import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { defineRegistry } from "./defineRegistry";
import type { BlockComponent, BlockRegistry } from "./registry.types";

const Hero = (props: { title: string; subtitle?: string }): ReactNode =>
  props.subtitle ?? props.title;

describe("defineRegistry", () => {
  test("returns the map unchanged — the literal is what the bundler analyses", () => {
    const importer = () => Promise.resolve(Hero);
    const registry = defineRegistry({ Hero: importer });
    expect(registry.Hero).toBe(importer);
  });

  test("a block component declaring its own props goes into the registry", async () => {
    const widened: BlockRegistry = defineRegistry({ Hero: () => Promise.resolve(Hero) });
    const load = widened.Hero;
    if (!load) {
      throw new Error("defineRegistry dropped a key it was given");
    }
    // Contravariance: a component that reads `title` cannot stand in for one obliged to accept
    // any record, so the registry stores `BlockComponent<never>` and what comes back out has
    // forgotten its props. The render site holds props compile already validated against the
    // block's schema, which is why the widening belongs there and nowhere else.
    const Component = (await load()) as BlockComponent;
    expect(await Component({ title: "Summer sale" })).toBe("Summer sale");
  });

  // Type-level. It compiles or it does not — the assertions below are the test, and a
  // `@ts-expect-error` that stops being an error fails the typecheck rather than passing
  // quietly.
  test("the props parameter is the only thing widened — a non-component is still rejected", () => {
    // @ts-expect-error a string is not callable, so it cannot render
    const notCallable: BlockComponent = "Hero";
    // @ts-expect-error props are not a ReactNode — returning them instead of markup is caught
    const returnsProps: BlockComponent = (props: UnknownProps) => props;
    // @ts-expect-error the component itself, not a function returning it, defeats code-splitting
    const eagerEntry: BlockRegistry = { Hero };

    expect([notCallable, returnsProps, eagerEntry]).toHaveLength(3);
  });
});
