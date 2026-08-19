import { describe, expect, test } from "vitest";
import { partitionProps } from "./partitionProps";

describe("partitionProps", () => {
  test("every field lands in exactly one of props or holes", () => {
    const { props, holes } = partitionProps(
      { title: "T", price: 10, stock: 3 },
      { fields: { price: { data: "request" }, stock: { data: { revalidate: 60 } } } },
    );
    expect(props).toEqual({ title: "T" });
    expect(holes).toEqual({ price: "request", stock: { revalidate: 60 } });
    const everyKey = [...Object.keys(props), ...Object.keys(holes)].sort();
    expect(everyKey).toEqual(["price", "stock", "title"]);
  });

  test("a field with no data hint is static, which is the default", () => {
    const { props, holes } = partitionProps({ title: "T" }, undefined);
    expect(props).toEqual({ title: "T" });
    expect(holes).toEqual({});
  });

  test("a data hint on a nested path takes that leaf and leaves the rest of its parent frozen", () => {
    const { props, holes } = partitionProps(
      { title: "T", cta: { label: "Go", href: "/x" } },
      { fields: { "cta.label": { data: "request" } } },
    );
    expect(props).toEqual({ title: "T", cta: { href: "/x" } });
    expect(holes).toEqual({ "cta.label": "request" });
  });

  test("a data hint naming a path the value does not carry records no hole", () => {
    const { props, holes } = partitionProps(
      { title: "T" },
      { fields: { "cta.label": { data: "request" } } },
    );
    expect(props).toEqual({ title: "T" });
    expect(holes).toEqual({});
  });

  test("label and control hints alone leave the value whole", () => {
    const { props, holes } = partitionProps(
      { cta: { label: "Go" } },
      { fields: { "cta.label": { label: "Call to action", control: "text" } } },
    );
    expect(props).toEqual({ cta: { label: "Go" } });
    expect(holes).toEqual({});
  });
});
