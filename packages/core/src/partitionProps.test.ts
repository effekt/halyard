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
});
