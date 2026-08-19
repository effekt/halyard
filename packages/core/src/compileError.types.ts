export type CompileIssueCode =
  | "no-roots"
  | "unknown-block"
  | "dangling-child"
  | "cycle"
  | "unreachable"
  | "slot-not-allowed"
  | "slot-min"
  | "slot-max"
  | "invalid-props";

export interface CompileIssue {
  nodeId: string;
  /** Where in the node the problem sits: `block`, `slots.items`, or a dotted prop path. */
  path: string;
  code: CompileIssueCode;
  message: string;
}
