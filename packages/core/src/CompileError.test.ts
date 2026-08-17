import { describe, expect, test } from "vitest";
import { CompileError } from "./CompileError";
import type { CompileIssue } from "./compileError.types";

const issue = (over: Partial<CompileIssue> = {}): CompileIssue => ({
  nodeId: "hero",
  path: "props.title",
  code: "invalid-props",
  message: "expected string",
  ...over,
});

describe("CompileError", () => {
  test("is catchable as an Error", () => {
    const error = new CompileError([issue()]);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CompileError);
  });

  // A consumer branching on `err.name` is the reason this is set explicitly: subclassing Error
  // leaves `name` as "Error" unless assigned.
  test("names itself, so a caught error is identifiable without instanceof", () => {
    expect(new CompileError([issue()]).name).toBe("CompileError");
  });

  test("keeps every issue it was given, in order", () => {
    const issues = [issue({ nodeId: "a" }), issue({ nodeId: "b" }), issue({ nodeId: "c" })];
    expect(new CompileError(issues).issues.map((found) => found.nodeId)).toEqual(["a", "b", "c"]);
  });

  // The whole point of the class: an author fixing six problems sees six, not the first.
  test("summarises one line per issue, with the count", () => {
    const error = new CompileError([
      issue({
        nodeId: "hero",
        path: "props.title",
        code: "invalid-props",
        message: "expected string",
      }),
      issue({ nodeId: "grid", path: "slots.items", code: "slot-min", message: "needs at least 1" }),
    ]);
    expect(error.message).toBe(
      [
        "Compile failed with 2 issue(s):",
        "hero props.title [invalid-props]: expected string",
        "grid slots.items [slot-min]: needs at least 1",
      ].join("\n"),
    );
  });

  test("reports the count for a single issue too", () => {
    expect(new CompileError([issue()]).message).toContain("1 issue(s)");
  });

  // `compile` only constructs this when it has at least one issue, so an empty array cannot arise
  // from the library. Recorded because nothing prevents a caller from doing it, and the resulting
  // message claims a failure with nothing to fix.
  test("an empty issue list yields a summary with no issues under it", () => {
    const error = new CompileError([]);
    expect(error.issues).toEqual([]);
    expect(error.message).toBe("Compile failed with 0 issue(s):\n");
  });
});
