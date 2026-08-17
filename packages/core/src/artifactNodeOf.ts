import type { ArtifactNode, ResolveNode } from "./artifact.types";
import type { Node } from "./document.types";

/**
 * Builds one resolved node, slots wired later. Empty holes are omitted entirely — an empty
 * `holes: {}` on every node would change the hash of every artifact for no semantic reason.
 */
export function artifactNodeOf(node: Node, resolve: ResolveNode): ArtifactNode {
  const { props, holes } = resolve(node);
  const artifactNode: ArtifactNode = { id: node.id, block: node.block, props };
  if (Object.keys(holes).length > 0) {
    artifactNode.holes = holes;
  }
  return artifactNode;
}
