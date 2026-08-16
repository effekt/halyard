import { expect, test } from "vitest";
import { NUBBIN_VERSION } from "./version.constants";

test("exposes a version string that compile stamps into every artifact", () => {
  expect(NUBBIN_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
});
