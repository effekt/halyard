import { defineConfig } from "vitest/config";

/**
 * `jsx` is the load-bearing line. Next requires `"jsx": "preserve"` in `tsconfig.json`, and Vite
 * reads and honours it — without this, the block components reach the module graph with their JSX
 * untransformed and every suite that imports one fails to parse.
 *
 * `include` states the surface rather than inheriting it. Vitest's default already matches both
 * `fixtures/` and `src/`, so this changes nothing today; it is here so that what the suite scans
 * is read from this file rather than from a tool's default.
 */
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: { include: ["**/*.test.ts"] },
});
