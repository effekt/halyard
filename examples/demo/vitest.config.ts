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
 *
 * Two projects, because they answer about different things. `unit` reads only files in this
 * package and is what `pnpm test` runs. `guardrail` reads the committed artifact store — state
 * whose contents no task hash has any reason to see — so it is invoked directly by
 * `pnpm guardrail` at the workspace root and is registered as no turbo task, exactly as the
 * `release` project is at the root for the same reason.
 */
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "happy-dom",
          globals: true,
          include: ["src/**/*.test.{ts,tsx}", "fixtures/**/*.test.ts", "scripts/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "guardrail",
          environment: "node",
          include: ["guardrail/*.test.ts"],
        },
      },
    ],
  },
});
