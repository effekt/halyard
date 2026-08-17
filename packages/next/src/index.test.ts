import { expect, test } from "vitest";

test("the published surface exports exactly the documented API", async () => {
  const surface = Object.keys(await import("./index")).sort();
  expect(surface).toEqual([
    "holeFetchOptions",
    "publishRoute",
    "resolveArtifact",
    "routeFromSlug",
    "staticRouteParams",
    "unpublishRoute",
  ]);
});
