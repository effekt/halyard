import { describe, expect, test } from "vitest";
import { countedNowPayload } from "./countedNowPayload";

describe("countedNowPayload", () => {
  // The counter living inside the function rather than the module is the failure that matters:
  // every response would then read `served: 1`, and two GETs of a request hole would be
  // indistinguishable with nothing in the demo able to notice.
  test("counts every call in this process", () => {
    expect(countedNowPayload().served).toBe(1);
    expect(countedNowPayload().served).toBe(2);
  });

  test("stamps the current time", () => {
    const before = Date.now();
    expect(countedNowPayload().now).toBeGreaterThanOrEqual(before);
  });
});
