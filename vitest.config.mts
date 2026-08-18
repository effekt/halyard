import { defineConfig } from "vitest/config";

// The repository's own tooling. Package suites are per-package configs run by turbo; this
// one covers `scripts/`, which belongs to no package and so had no suite at all.
export default defineConfig({
  test: { environment: "node", include: ["scripts/**/*.test.mjs"] },
});
