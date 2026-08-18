import { expect, test } from "vitest";
import { withFieldValue } from "./withFieldValue";

test("pairs the field with the draft's value at its path", () => {
  const field = { path: "cta.label", kind: "string" as const, optional: false };
  expect(withFieldValue(field, { cta: { label: "Go" } })).toEqual({ ...field, value: "Go" });
});

test("keeps enum members alongside the value", () => {
  const field = {
    path: "tone",
    kind: "enum" as const,
    optional: false,
    members: ["light", "dark"],
  };
  expect(withFieldValue(field, { tone: "dark" }).members).toEqual(["light", "dark"]);
});
