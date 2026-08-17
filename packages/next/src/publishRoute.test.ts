import { revalidatePath } from "next/cache.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { publishRoute } from "./publishRoute";
import { stubStore } from "./testing/stubStore";

vi.mock("next/cache.js", () => ({ revalidatePath: vi.fn() }));

describe("publishRoute", () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear());

  test("publishes through the store, then revalidates exactly that route", async () => {
    const published: string[] = [];
    const store = {
      ...stubStore({}, {}),
      publish: async (route: string, hash: string) => {
        published.push(`${route}=${hash}`);
      },
    };
    await publishRoute(store, "/promotions/summer", "a1");
    expect(published).toEqual(["/promotions/summer=a1"]);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/promotions/summer");
  });

  test("a store rejection propagates and nothing is revalidated", async () => {
    const store = {
      ...stubStore({}, {}),
      publish: async () => {
        throw new Error("artifact ghost is not in the store");
      },
    };
    await expect(publishRoute(store, "/x", "ghost")).rejects.toThrow(/ghost/);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
