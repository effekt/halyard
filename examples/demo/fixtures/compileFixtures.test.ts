import { compile } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import { catalog } from "../src/nubbin/catalog";
import { registry } from "../src/nubbin/registry";
import { fixtureRoutes } from "./fixtureRoutes";

describe("fixtures", () => {
  test.each(Object.keys(fixtureRoutes))("%s compiles, deterministically", (route) => {
    const version = fixtureRoutes[route];
    if (!version) {
      throw new Error(route);
    }
    const artifact = compile(version, catalog, registry, route);
    expect(artifact.route).toBe(route);
    expect(compile(version, catalog, registry, route).hash).toBe(artifact.hash);
  });

  test("live fields compile to holes, not frozen props", () => {
    const version = fixtureRoutes["/live/pulse"];
    if (!version) {
      throw new Error("missing fixture");
    }
    const artifact = compile(version, catalog, registry, "/live/pulse");
    const sections = artifact.tree[0]?.slots?.sections ?? [];
    const statBand = sections.find((node) => node.block === "StatBand");
    const faq = sections.find((node) => node.block === "FaqAccordion");
    expect(statBand?.holes).toEqual({ stats: "request" });
    expect(statBand?.props).not.toHaveProperty("stats");
    expect(faq?.holes).toEqual({ items: { revalidate: 5 } });
  });

  test("marketing fixtures carry no holes at all — their pages must stay fully static", () => {
    for (const route of ["/promotions/summer", "/promotions/winter", "/promotions/flash"]) {
      const version = fixtureRoutes[route];
      if (!version) {
        throw new Error(route);
      }
      const artifact = compile(version, catalog, registry, route);
      const nodes = [artifact.tree[0], ...(artifact.tree[0]?.slots?.sections ?? [])];
      expect(nodes.every((node) => node?.holes === undefined)).toBe(true);
    }
  });
});
