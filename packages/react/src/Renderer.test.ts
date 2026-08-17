import type { Artifact } from "@nubbin/core";
import type { ReactNode } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { defineRegistry } from "./defineRegistry";
import { Renderer } from "./Renderer";

const Stack = (props: Record<string, unknown>) =>
  createElement("main", null, props.sections as ReactNode);
const Price = (props: Record<string, unknown>) => createElement("p", null, String(props.amount));

const artifact: Artifact = {
  hash: "h1",
  route: "/promotions/summer",
  documentId: "d1",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: { Stack: 1, Price: 1 },
  tree: [
    {
      id: "stack",
      block: "Stack",
      props: {},
      slots: { sections: [{ id: "p1", block: "Price", props: {}, holes: { amount: "request" } }] },
    },
  ],
  meta: { title: "t" },
  compiledWith: "0.0.0",
};

describe("Renderer", () => {
  test("loads only the blocks the artifact names and fills holes through the resolver", async () => {
    let unusedLoads = 0;
    const registry = defineRegistry({
      Stack: () => Promise.resolve(Stack),
      Price: () => Promise.resolve(Price),
      Unused: () => {
        unusedLoads += 1;
        return Promise.resolve(Stack);
      },
    });
    const html = renderToStaticMarkup(
      await Renderer({ artifact, registry, resolveHole: async () => 42 }),
    );
    expect(html).toContain('<p data-nubbin-node="p1">42</p>');
    expect(unusedLoads).toBe(0);
  });

  test("a static artifact renders with no resolver at all", async () => {
    const staticArtifact: Artifact = {
      ...artifact,
      blockVersions: { Price: 1 },
      tree: [{ id: "p1", block: "Price", props: { amount: 9 } }],
    };
    const registry = defineRegistry({ Price: () => Promise.resolve(Price) });
    expect(renderToStaticMarkup(await Renderer({ artifact: staticArtifact, registry }))).toBe(
      '<p data-nubbin-node="p1">9</p>',
    );
  });

  test("passes the artifact's route to the resolver, so a hole knows where it is rendering", async () => {
    const routes: string[] = [];
    const registry = defineRegistry({
      Stack: () => Promise.resolve(Stack),
      Price: () => Promise.resolve(Price),
    });
    await Renderer({
      artifact,
      registry,
      resolveHole: async (context) => {
        routes.push(context.route);
        return 1;
      },
    });
    expect(routes).toEqual(["/promotions/summer"]);
  });

  test("fails when the registry has no importer for a block the artifact names", async () => {
    const registry = defineRegistry({ Price: () => Promise.resolve(Price) });
    await expect(Renderer({ artifact, registry })).rejects.toThrow(
      /registry has no importer for: Stack/,
    );
  });

  test("fails when the artifact declares a hole and no resolver was given", async () => {
    const registry = defineRegistry({
      Stack: () => Promise.resolve(Stack),
      Price: () => Promise.resolve(Price),
    });
    await expect(Renderer({ artifact, registry })).rejects.toThrow(/declares holes/);
  });
});
