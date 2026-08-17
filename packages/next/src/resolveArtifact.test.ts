import { describe, expect, test } from "vitest";
import { resolveArtifact } from "./resolveArtifact";
import { SUMMER } from "./testing/artifactFixture.constants";
import { stubStore } from "./testing/stubStore";

describe("resolveArtifact", () => {
  test("resolves through one pointer read to the artifact it names", async () => {
    const store = stubStore({ a1: SUMMER }, { "/promotions/summer": "a1" });
    expect(await resolveArtifact(store, ["promotions", "summer"])).toEqual(SUMMER);
  });

  test("a route with no pointer resolves to null — the caller's notFound()", async () => {
    const store = stubStore({ a1: SUMMER }, {});
    expect(await resolveArtifact(store, ["promotions", "summer"])).toBeNull();
  });

  test("a dangling pointer resolves to null rather than throwing into the request", async () => {
    const store = stubStore({}, { "/promotions/summer": "gone" });
    expect(await resolveArtifact(store, ["promotions", "summer"])).toBeNull();
  });
});
