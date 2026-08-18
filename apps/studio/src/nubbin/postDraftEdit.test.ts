import { afterEach, expect, test, vi } from "vitest";
import { postDraftEdit } from "./postDraftEdit";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("posts the edit as JSON and resolves undefined on success", async () => {
  const calls: [string, RequestInit | undefined][] = [];
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
    calls.push([url, init]);
    return Promise.resolve(new Response("ok", { status: 200 }));
  });
  await expect(postDraftEdit("/about", "hero", "headline", "New")).resolves.toBeUndefined();
  const [url, init] = calls[0] ?? [];
  expect(url).toBe("/api/edit");
  expect(JSON.parse(String(init?.body))).toEqual({
    route: "/about",
    nodeId: "hero",
    path: "headline",
    value: "New",
  });
});

test("resolves to the rejection text on failure", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("bad value", { status: 422 })));
  await expect(postDraftEdit("/about", "hero", "headline", 7)).resolves.toBe("bad value");
});

test("an empty rejection body still yields a message", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("", { status: 500 })));
  await expect(postDraftEdit("/about", "hero", "headline", "x")).resolves.toBe(
    "edit rejected (500)",
  );
});
