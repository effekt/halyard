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

  test("accepts a data hint on a nested path — one object field has one target", () => {
    expect(() =>
      assertDataHintAddressable("Hero", { "cta.label": { data: "request" } }),
    ).not.toThrow();
  });

  test("rejects a data hint on an ancestor of another data hint, naming both paths", () => {
    expect(() =>
      assertDataHintAddressable("Hero", {
        cta: { data: "request" },
        "cta.label": { data: "request" },
      }),
    ).toThrow(/Hero.*"cta".*"cta\.label"/s);
  });

  test("rejects the overlap in either declaration order", () => {
    expect(() =>
      assertDataHintAddressable("Hero", {
        "cta.label": { data: { revalidate: 5 } },
        cta: { data: "request" },
      }),
    ).toThrow(/overlap/i);
  });

  test("accepts sibling data hints that share a prefix but nest in neither direction", () => {
    expect(() =>
      assertDataHintAddressable("Hero", {
        "cta.label": { data: "request" },
        "cta.href": { data: "request" },
        ctaLabel: { data: "request" },
      }),
    ).not.toThrow();
  });

  test("ignores a non-data hint on an ancestor of a data hint", () => {
    expect(() =>
      assertDataHintAddressable("Hero", {
        cta: { label: "Call to action" },
        "cta.label": { data: "request" },
      }),
    ).not.toThrow();
  });
});
