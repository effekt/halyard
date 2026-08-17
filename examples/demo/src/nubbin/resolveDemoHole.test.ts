import { beforeEach, describe, expect, test, vi } from "vitest";
import { appendHoleLog } from "./appendHoleLog";
import { fetchNowPayload } from "./fetchNowPayload";
import { resolveDemoHole } from "./resolveDemoHole";

// The two IO collaborators stand in as adapters: one writes a file, one opens a socket. Neither
// can run inside a suite without either corrupting the demo's real `.nubbin/` — which #55 reads
// as evidence — or needing a server. `demoHoleValue` is deliberately left real, because the shape
// it returns is the part worth exercising against the schemas it has to satisfy.
vi.mock("./appendHoleLog", () => ({ appendHoleLog: vi.fn(async () => {}) }));
vi.mock("./fetchNowPayload", () => ({
  fetchNowPayload: vi.fn(async () => ({ now: Date.parse("2026-08-01T00:00:00Z"), served: 7 })),
}));

const context = {
  route: "/live/pulse",
  nodeId: "stats",
  block: "StatBand",
  path: "stats",
  spec: "request",
} as const;

beforeEach(() => {
  vi.mocked(appendHoleLog).mockClear();
  vi.mocked(fetchNowPayload).mockClear();
});

describe("resolveDemoHole", () => {
  // Field order and log location have no other guard: #55 greps this file by shape, and a
  // silently reordered line would read as a resolver that never ran.
  test("logs `route nodeId path` beside the store, before fetching", async () => {
    await resolveDemoHole(context);
    const [file, line] = vi.mocked(appendHoleLog).mock.calls[0] ?? [];
    expect(file).toMatch(/[/\\]\.nubbin[/\\]hole-log\.txt$/);
    expect(line).toBe("/live/pulse stats stats");
    expect(vi.mocked(appendHoleLog).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(fetchNowPayload).mock.invocationCallOrder[0] ?? 0,
    );
  });

  test("hands the declared spec to the fetch rather than choosing a lifecycle itself", async () => {
    await resolveDemoHole(context);
    expect(vi.mocked(fetchNowPayload)).toHaveBeenCalledWith("request");
  });

  test("shapes the payload for the field it was asked about", async () => {
    expect(await resolveDemoHole(context)).toEqual([
      { value: "7", label: "times /api/now has answered" },
      { value: "2026-08-01T00:00:00.000Z", label: "resolved for this request" },
    ]);
  });

  test("a line is written even when the fetch fails, so the two failures stay distinguishable", async () => {
    vi.mocked(fetchNowPayload).mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(resolveDemoHole(context)).rejects.toThrow("ECONNREFUSED");
    expect(vi.mocked(appendHoleLog)).toHaveBeenCalledTimes(1);
  });
});
