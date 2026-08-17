import type { CompileIssue } from "./compileError.types";

/** Carries every issue found in one pass, so an author fixing six problems sees six. */
export class CompileError extends Error {
  readonly issues: readonly CompileIssue[];

  constructor(issues: readonly CompileIssue[]) {
    const summary = issues
      .map((issue) => `${issue.nodeId} ${issue.path} [${issue.code}]: ${issue.message}`)
      .join("\n");
    super(`Compile failed with ${issues.length} issue(s):\n${summary}`);
    this.name = "CompileError";
    this.issues = issues;
  }
}
