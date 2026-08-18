import { defineConfig } from "vitest/config";

/**
 * `jsx` is the load-bearing line. Next requires `"jsx": "preserve"` in `tsconfig.json`, and Vite
 * reads and honours it — without this, the block components reach the module graph with their JSX
 * untransformed and every suite that imports one fails to parse.
 *
 * `include` states the surface rather than inheriting it, and names both extensions. A block's
 * render test is written in `.tsx`, and a pattern that ends at `.ts` collects none of them — the
 * suite reports success having scanned nothing.
 *
 * `environment` is a DOM for every file, not only the render ones: the alternative is a per-file
 * directive, which is the same silent-omission shape as the glob above.
 *
 * `globals` is what registers Testing Library's `afterEach(cleanup)`. Without it a second
 * `render` in one file leaves the first tree mounted and every `getByRole` finds two.
 */
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "happy-dom", globals: true, include: ["**/*.test.{ts,tsx}"] },
});
