import { expect, test } from "vitest";
import { previewNowPayload } from "./previewNowPayload";

test("each call counts one more resolution and stamps a current time", () => {
  const before = Date.now();
  const first = previewNowPayload();
  const second = previewNowPayload();
  expect(second.served).toBe(first.served + 1);
  expect(first.now).toBeGreaterThanOrEqual(before);
});
