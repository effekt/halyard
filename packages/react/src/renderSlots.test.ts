import type { ArtifactNode } from "@nubbin/core";
import { createElement } from "react";
import { describe, expect, test } from "vitest";
import { renderSlots } from "./renderSlots";

const renderChild = (node: ArtifactNode) =>
  Promise.resolve(createElement("article", { key: node.id }, node.block));

describe("renderSlots", () => {
  test("renders each slot's children into a prop named after the slot", async () => {
    const rendered = await renderSlots(
      {
        sections: [
          { id: "a", block: "Card", props: {} },
          { id: "b", block: "Price", props: {} },
        ],
        aside: [{ id: "c", block: "Note", props: {} }],
      },
      renderChild,
    );
    expect(Object.keys(rendered)).toEqual(["sections", "aside"]);
    expect(rendered.sections).toHaveLength(2);
    expect(rendered.aside).toHaveLength(1);
  });

  test("a node with no slots yields no props, so nothing shadows the block's own", async () => {
    expect(await renderSlots(undefined, renderChild)).toEqual({});
  });

  test("keeps declaration order even when a later child resolves first", async () => {
    const renderSlowFirst = async (node: ArtifactNode) => {
      if (node.id === "first") {
        await Promise.resolve();
      }
      return createElement("article", { key: node.id }, node.block);
    };
    const rendered = await renderSlots(
      {
        sections: [
          { id: "first", block: "Card", props: {} },
          { id: "second", block: "Card", props: {} },
        ],
      },
      renderSlowFirst,
    );
    expect(rendered.sections?.map((element) => element.key)).toEqual(["first", "second"]);
  });
});
