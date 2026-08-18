import { defineConfig } from "vitest/config";

/** tsconfig carries Next's `"jsx": "preserve"`, so block components imported through the
 * demo's registry reach vitest untransformed without this line.
 *
 * `include` names both extensions. A component test is written in `.tsx`, and a pattern that
 * ends at `.ts` collects none of them — the suite reports success having scanned nothing.
 *
 * `environment` is a DOM for every file, not only the component ones: the alternative is a
 * per-file directive, which is the same silent-omission shape as the glob above.
 *
 * `globals` is what registers Testing Library's `afterEach(cleanup)`. Without it a second
 * `render` in one file leaves the first tree mounted and every `getByRole` finds two. */
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "happy-dom", globals: true, include: ["**/*.test.{ts,tsx}"] },
});
