import { describe, expect, test } from "vitest";
import { z } from "zod";
import { validateNodeProps } from "./validateNodeProps";

describe("validateNodeProps", () => {
  test("returns the parsed value, so a stale union branch is dropped rather than carried", () => {
    const schema = z.object({
      body: z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("text"), value: z.string() }),
        z.object({ kind: z.literal("image"), url: z.string() }),
      ]),
    });
    const node = {
      id: "n1",
      block: "B",
      props: { body: { kind: "text", value: "hi", url: "/stale.png" } },
    };
    const { value, issues } = validateNodeProps(node, schema);
    expect(issues).toEqual([]);
    expect(value?.body).toEqual({ kind: "text", value: "hi" });
    expect(value?.body).not.toHaveProperty("url");
  });

  test("maps each schema issue to a CompileIssue carrying the node id and a dotted path", () => {
    const schema = z.object({ title: z.string(), cta: z.object({ label: z.string() }) });
    const node = { id: "n9", block: "B", props: { title: 5, cta: {} } };
    const { value, issues } = validateNodeProps(node, schema);
    expect(value).toBeUndefined();
    expect(issues.map((issue) => `${issue.code}:${issue.nodeId}:${issue.path}`)).toEqual([
      "invalid-props:n9:title",
      "invalid-props:n9:cta.label",
    ]);
  });
});
