import type { ArtifactNode, UnknownProps } from "@nubbin/core";
import { setAtPath } from "@nubbin/core";
import type { HoleResolver } from "./holes.types";

/**
 * The static path is the fast path: no holes means the frozen props object is returned as-is,
 * with no clone and no resolver call — that absence is asserted, not assumed.
 *
 * A node declaring holes with no resolver throws naming the node. Rendering a placeholder
 * would put a compile-time artefact in front of a visitor with nothing to notice it.
 */
export async function resolveNodeHoles(
  node: ArtifactNode,
  route: string,
  resolveHole: HoleResolver | undefined,
): Promise<UnknownProps> {
  const holes = Object.entries(node.holes ?? {});
  if (holes.length === 0) {
    return node.props;
  }
  if (!resolveHole) {
    throw new Error(`node ${node.id} (${node.block}) declares holes but no resolveHole was given`);
  }
  let props: Record<string, unknown> = { ...node.props };
  for (const [path, spec] of holes) {
    const value = await resolveHole({ route, nodeId: node.id, block: node.block, path, spec });
    props = setAtPath(props, path, value);
  }
  return props;
}
