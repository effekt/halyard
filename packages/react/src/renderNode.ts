import type { ArtifactNode } from "@nubbin/core";
import type { ReactElement } from "react";
import { invokeBlock } from "./invokeBlock";
import type { RenderContext } from "./renderer.types";
import { renderSlots } from "./renderSlots";
import { resolveNodeHoles } from "./resolveNodeHoles";

/**
 * One node, then its slots, then the block. Holes are filled before invocation because the
 * block reads them as ordinary props — a value arriving after the call would render as
 * `undefined` with nothing to notice it.
 */
export async function renderNode(
  node: ArtifactNode,
  context: RenderContext,
): Promise<ReactElement> {
  const component = context.blocks[node.block];
  if (component === undefined) {
    throw new Error(`artifact for ${context.route} names "${node.block}" but it was not loaded`);
  }
  const props = await resolveNodeHoles(node, context.route, context.resolveHole);
  const slotProps = await renderSlots(node.slots, (child) => renderNode(child, context));
  return invokeBlock(component, { ...props, ...slotProps }, node);
}
