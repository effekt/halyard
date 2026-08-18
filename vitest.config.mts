import { defineConfig } from "vitest/config";

// The repository's own invariants, as tests. Package suites are per-package configs run by
// turbo; these two projects cover `tests/` and `scripts/`, which belong to no package.
//
// Two projects rather than one, because they cost three orders of magnitude apart. `repo` reads
// files and runs in milliseconds, so pre-commit can afford the whole of it. `release` packs every
// package and installs it from the registry, which takes seconds and needs the network — and
// crucially, its verdict depends on the registry, which no cache key can see. It is invoked
// directly and never registered as a turbo task, so nothing can replay a green run of it.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "repo",
          environment: "node",
          include: ["tests/*.test.mjs", "scripts/**/*.test.mjs"],
        },
      },
      {
        test: {
          name: "release",
          environment: "node",
          include: ["tests/release/*.test.mjs"],
          // A tarball install measured ~5s against vitest's 5s default, so the default turns a
          // slow network into a failure that names the timeout rather than the cause.
          testTimeout: 180_000,
          hookTimeout: 180_000,
        },
      },
    ],
  },
});
