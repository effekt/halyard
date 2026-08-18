import { defineConfig } from "vitest/config";

/** tsconfig carries Next's `"jsx": "preserve"`, so block components imported through the
 * demo's registry reach vitest untransformed without this line. */
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: { include: ["**/*.test.ts"] },
});
