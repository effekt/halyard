// `NUBBIN_VERSION` is compiled into `dist/` and stamped into every artifact as `compiledWith`, so
// an artifact records what produced it. A stale value misreports that, and the field is then worse
// than absent — it looks like an answer. `0.1.0-rc.0` shipped stamping `0.0.0`.
//
// This runs on the release path as well as in the suite: `pnpm publishable` invokes it ahead of the
// build, because the release workflow does not run `pnpm verify`.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { coreVersionConstant } from "../scripts/coreVersionConstant.mjs";

describe("the version stamp", () => {
  it("matches packages/core/package.json", async () => {
    const { version, text, file } = await coreVersionConstant();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
    expect(await readFile(file, "utf8")).toBe(text);
  });
});
