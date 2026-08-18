import { expect, test } from "vitest";
import { isAddressablePath } from "./isAddressablePath";

test.each(["headline", "cta.label", "image.alt"])("accepts %j", (path) => {
  expect(isAddressablePath(path)).toBe(true);
});

test.each(["", ".", "cta..label", ".label", "label.", "items[]", "items[].label"])(
  "rejects %j",
  (path) => {
    expect(isAddressablePath(path)).toBe(false);
  },
);
