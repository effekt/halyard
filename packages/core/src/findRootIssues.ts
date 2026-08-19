import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";

/**
 * The entry points, checked before the graph they open. A document with no roots compiles to
 * an empty tree, and a root naming no element loses its whole subtree — both silently.
 */
export function findRootIssues(version: DocumentVersion): CompileIssue[] {
  if (version.roots.length === 0) {
    return [
      {
        nodeId: "",
        path: "roots",
        code: "no-roots",
        message: "a document needs at least one root, and this one names none",
      },
    ];
  }
  return version.roots.flatMap((root) =>
    version.elements[root] === undefined
      ? [
          {
            nodeId: root,
            path: "roots",
            code: "dangling-child" as const,
            message: `root "${root}" has no matching element`,
          },
        ]
      : [],
  );
}
