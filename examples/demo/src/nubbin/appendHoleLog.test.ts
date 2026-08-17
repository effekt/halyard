import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { appendHoleLog } from "./appendHoleLog";

describe("appendHoleLog", () => {
  // Catches a `writeFile` in place of `appendFile` — the second call would erase the first, and
  // the "a static prop triggers no fetch" evidence would be a one-line file that proves nothing.
  test("keeps every line, in order", async () => {
    const file = join(await mkdtemp(join(tmpdir(), "nubbin-hole-log-")), "hole-log.txt");
    await appendHoleLog(file, "/live/pulse stats stats");
    await appendHoleLog(file, "/live/pulse faq items");
    const lines = (await readFile(file, "utf8")).split("\n").filter((line) => line.length > 0);
    expect(lines).toEqual(["/live/pulse stats stats", "/live/pulse faq items"]);
  });

  // Catches a missing `mkdir`: the first resolve of a clean tree writes into a directory that
  // does not exist yet, and an ENOENT there fails the render rather than the log.
  test("creates the directory it writes into", async () => {
    const file = join(await mkdtemp(join(tmpdir(), "nubbin-hole-log-")), "absent", "hole-log.txt");
    await appendHoleLog(file, "/live/pulse stats stats");
    expect(await readFile(file, "utf8")).toBe("/live/pulse stats stats\n");
  });
});
