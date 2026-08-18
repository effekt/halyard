import { describe, expect, test } from "vitest";
import { assertDataHintAddressable } from "./assertDataHintAddressable";

describe("assertDataHintAddressable", () => {
  test("rejects a data hint on an array-member path, naming the block and the path", () => {
    expect(() =>
      assertDataHintAddressable("Hero", { "items[].heading": { data: "request" } }),
    ).toThrow(/Hero.*items\[\]\.heading/s);
  });

  test("rejects a revalidate data hint the same way — the kind of data hint is irrelevant", () => {
    expect(() =>
      assertDataHintAddressable("Hero", { "items[].heading": { data: { revalidate: 5 } } }),
    ).toThrow(/items\[\]\.heading/);
  });

  test("accepts label and control hints on an array-member path", () => {
    expect(() =>
      assertDataHintAddressable("Hero", {
        "items[].heading": { label: "Heading", control: "text" },
      }),
    ).not.toThrow();
  });

  test("accepts a data hint on a path without an array member", () => {
    expect(() => assertDataHintAddressable("Hero", { items: { data: "request" } })).not.toThrow();
  });
});
