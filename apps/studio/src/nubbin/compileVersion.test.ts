import { CompileError, setNodeProp } from "@nubbin/core";
import { about } from "demo/fixtures/about";
import { expect, test } from "vitest";
import { compileVersion } from "./compileVersion";

test("compiles a fixture document to an artifact at the given route", () => {
  const artifact = compileVersion(about, "/about");
  expect(artifact.route).toBe("/about");
  expect(artifact.documentId).toBe("about");
});

test("a candidate that fails validation throws CompileError naming the path", () => {
  const broken = setNodeProp(about, "hero", "cta.href", 7);
  try {
    compileVersion(broken, "/about");
    expect.unreachable("an invalid draft must not compile");
  } catch (error) {
    if (!(error instanceof CompileError)) {
      throw error;
    }
    expect(error.issues.some((issue) => issue.nodeId === "hero")).toBe(true);
  }
});
