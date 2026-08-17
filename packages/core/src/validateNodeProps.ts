import type { UnknownProps } from "./block.types";
import type { CompileIssue } from "./compileError.types";
import type { Node } from "./document.types";
import { formatIssuePath } from "./formatIssuePath";
import { isUnknownProps } from "./isUnknownProps";
import { standardValidate } from "./standardValidate";

/**
 * Validates one node's draft props against the real schema and returns the value `validate()`
 * parsed — never the input object. A draft can hold a value for a union branch no longer
 * selected; the parsed value is where that stale field has already been dropped.
 */
export function validateNodeProps(
  node: Node,
  schema: unknown,
): { value?: UnknownProps; issues: CompileIssue[] } {
  const result = standardValidate(schema, node.props);
  if (result.issues !== undefined) {
    const issues = result.issues.map((issue) => ({
      nodeId: node.id,
      path: formatIssuePath(issue.path),
      code: "invalid-props" as const,
      message: issue.message,
    }));
    return { issues };
  }
  if (!isUnknownProps(result.value)) {
    return {
      issues: [
        {
          nodeId: node.id,
          path: "",
          code: "invalid-props",
          message: "block props must parse to an object",
        },
      ],
    };
  }
  return { value: result.value, issues: [] };
}
