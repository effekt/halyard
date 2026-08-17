import type { ReactNode } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { renderNode } from "./renderNode";

const Stack = (props: Record<string, unknown>) =>
  createElement("main", null, props.sections as ReactNode);
const Card = (props: Record<string, unknown>) =>
  createElement("article", null, String(props.label));

describe("renderNode", () => {
  test("renders slot children inside the parent, each stamped with its own node id", async () => {
    const html = renderToStaticMarkup(
      await renderNode(
        {
          id: "stack",
          block: "Stack",
          props: {},
          slots: { sections: [{ id: "c1", block: "Card", props: { label: "L" } }] },
        },
        { route: "/x", blocks: { Stack, Card } },
      ),
    );
    expect(html).toBe(
      '<main data-nubbin-node="stack"><article data-nubbin-node="c1">L</article></main>',
    );
  });

  test("fills holes before invoking the block, so the block reads the resolved value", async () => {
    const seen: unknown[] = [];
    const Price = (props: Record<string, unknown>) => {
      seen.push(props.amount);
      return createElement("p", null, String(props.amount));
    };
    const html = renderToStaticMarkup(
      await renderNode(
        { id: "p1", block: "Price", props: {}, holes: { amount: "request" } },
        { route: "/x", blocks: { Price }, resolveHole: async () => 42 },
      ),
    );
    expect(seen).toEqual([42]);
    expect(html).toBe('<p data-nubbin-node="p1">42</p>');
  });

  test("fails on a block the loaded map lacks, naming block and route", async () => {
    await expect(
      renderNode({ id: "n1", block: "Ghost", props: {} }, { route: "/x", blocks: {} }),
    ).rejects.toThrow(/artifact for \/x names "Ghost"/);
  });
});
