import { revalidatePath } from "next/cache.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { stubStore } from "./testing/stubStore";
import { unpublishRoute } from "./unpublishRoute";

vi.mock("next/cache.js", () => ({ revalidatePath: vi.fn() }));

describe("unpublishRoute", () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear());

  test("unpublishes through the store, then revalidates exactly that route", async () => {
    const unpublished: string[] = [];
    const store = {
      ...stubStore({}, {}),
      unpublish: async (route: string) => {
        unpublished.push(route);
      },
    };
    await unpublishRoute(store, "/promotions/summer");
    expect(unpublished).toEqual(["/promotions/summer"]);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/promotions/summer");
  });

  test("a store rejection propagates and nothing is revalidated", async () => {
    const store = {
      ...stubStore({}, {}),
      unpublish: async () => {
        throw new Error("routes directory is read-only");
      },
    };
    await expect(unpublishRoute(store, "/x")).rejects.toThrow(/read-only/);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
