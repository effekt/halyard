import { describe, expect, test } from "vitest";
import { holeFetchOptions } from "./holeFetchOptions";

describe("holeFetchOptions", () => {
  test("a request hole opts out of the data cache entirely", () => {
    expect(holeFetchOptions("request")).toEqual({ cache: "no-store" });
  });

  test("a revalidate hole carries its interval into Next's data cache", () => {
    expect(holeFetchOptions({ revalidate: 60 })).toEqual({ next: { revalidate: 60 } });
  });
});
