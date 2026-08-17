import type { ArtifactNode } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import type { HoleContext } from "./holes.types";
import { resolveNodeHoles } from "./resolveNodeHoles";

const staticNode: ArtifactNode = { id: "n1", block: "Hero", props: { title: "T" } };

const liveNode: ArtifactNode = {
  id: "n2",
  block: "StatBand",
  props: { tone: "dark" },
  holes: { stats: "request", note: { revalidate: 60 } },
};

describe("resolveNodeHoles", () => {
  test("a node without holes returns its props untouched and never calls the resolver", async () => {
    let calls = 0;
    const props = await resolveNodeHoles(staticNode, "/x", async () => {
      calls += 1;
      return null;
    });
    expect(props).toBe(staticNode.props);
    expect(calls).toBe(0);
  });

  test("every hole is filled at its own path", async () => {
    const props = await resolveNodeHoles(liveNode, "/x", async ({ path }) => `filled:${path}`);
    expect(props).toEqual({ tone: "dark", stats: "filled:stats", note: "filled:note" });
  });

  test("hands the resolver the full context, spec included", async () => {
    const seen: HoleContext[] = [];
    await resolveNodeHoles(liveNode, "/live/pulse", async (context) => {
      seen.push(context);
      return null;
    });
    expect(seen).toContainEqual({
      route: "/live/pulse",
      nodeId: "n2",
      block: "StatBand",
      path: "stats",
      spec: "request",
    });
    expect(seen).toContainEqual({
      route: "/live/pulse",
      nodeId: "n2",
      block: "StatBand",
      path: "note",
      spec: { revalidate: 60 },
    });
  });

  test("a node with holes and no resolver fails naming the node, not silently rendering placeholders", async () => {
    await expect(resolveNodeHoles(liveNode, "/x", undefined)).rejects.toThrow(/n2.*StatBand/s);
  });
});
