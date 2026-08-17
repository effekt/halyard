import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchNowPayload } from "./fetchNowPayload";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

/** Stubbing `fetch` stubs the network, not a schema — the request itself is the thing under test. */
const recordFetch = () => {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(Response.json({ now: 1, served: 2 }));
  });
  return calls;
};

describe("fetchNowPayload", () => {
  // The load-bearing assertion. Replace `holeFetchOptions(spec)` with a fixed option object and
  // every hole takes one lifecycle: `/live/pulse` prerenders, and nothing local says why.
  test("a request hole fetches with no store, which is what keeps its page dynamic", async () => {
    const calls = recordFetch();
    vi.stubEnv("PORT", "4100");
    await fetchNowPayload("request");
    expect(calls[0]?.url).toBe("http://127.0.0.1:4100/api/now");
    expect(calls[0]?.init).toEqual({ cache: "no-store" });
  });

  test("an interval hole carries the declared revalidate", async () => {
    const calls = recordFetch();
    await fetchNowPayload({ revalidate: 5 });
    expect(calls[0]?.init).toEqual({ next: { revalidate: 5 } });
  });

  test("returns the body", async () => {
    recordFetch();
    expect(await fetchNowPayload("request")).toEqual({ now: 1, served: 2 });
  });

  test("a failed response throws naming the status rather than shaping undefined", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("no", { status: 503 })));
    await expect(fetchNowPayload("request")).rejects.toThrow("/api/now answered 503");
  });
});
