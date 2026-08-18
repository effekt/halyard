import { statBandSchema } from "demo/src/blocks/StatBand.schema";
import { expect, test } from "vitest";
import { resolveStudioHole } from "./resolveStudioHole";

test("a StatBand stats hole resolves to a value the block's real schema accepts", async () => {
  const stats = await resolveStudioHole({
    route: "/",
    nodeId: "stats",
    block: "StatBand",
    path: "stats",
    spec: "request",
  });
  const parsed = statBandSchema.safeParse({ tone: "light", stats });
  expect(parsed.success).toBe(true);
});

test("a hole no resolver covers is a loud failure, not a silent blank", async () => {
  await expect(
    resolveStudioHole({
      route: "/",
      nodeId: "x",
      block: "Hero",
      path: "headline",
      spec: "request",
    }),
  ).rejects.toThrow("no demo resolver");
});
