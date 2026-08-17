import { describe, expect, test } from "vitest";
import { parseMatchKind } from "./parseMatchKind";

describe("parseMatchKind", () => {
  test("a literal path is exact", () => {
    expect(parseMatchKind("/about")).toBe("exact");
    expect(parseMatchKind("/")).toBe("exact");
  });

  test("a bracketed segment is param", () => {
    expect(parseMatchKind("/guides/[city]")).toBe("param");
  });

  test("a trailing /* is prefix", () => {
    expect(parseMatchKind("/collections/*")).toBe("prefix");
  });
});
