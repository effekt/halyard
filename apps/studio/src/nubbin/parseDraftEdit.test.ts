import { expect, test } from "vitest";
import { parseDraftEdit } from "./parseDraftEdit";

test("accepts a complete edit and carries the value through untyped", () => {
  const body = { route: "/about", nodeId: "hero", path: "headline", value: 7 };
  expect(parseDraftEdit(body)).toEqual(body);
});

test.each([null, "text", 7, [], { route: "/about" }, { route: 1, nodeId: "n", path: "p" }])(
  "rejects %j",
  (body) => {
    expect(parseDraftEdit(body)).toBeUndefined();
  },
);

test.each(["", "cta..label", ".label", "label.", "paragraphs[].0"])(
  "rejects the unaddressable path %j",
  (path) => {
    expect(parseDraftEdit({ route: "/about", nodeId: "hero", path, value: "x" })).toBeUndefined();
  },
);
