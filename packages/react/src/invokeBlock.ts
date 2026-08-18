import type { ArtifactNode } from "@nubbin/core";
import type { ReactElement } from "react";
import { cloneElement, isValidElement } from "react";
import type { BlockComponent } from "./registry.types";

/**
 * Invokes the block and stamps its root. Invocation — not element creation — is what puts the
 * root element in hand to clone, which is why a block must be a server component returning
 * exactly one root element. A wrapper element would stamp reliably and change the consumer's
 * layout, so the renderer refuses instead of introducing one.
 *
 * The root must be a *host* element — `typeof type === "string"`. Cloning a composite root
 * such as `<Card>` succeeds and sets `data-nubbin-node` as a prop the component never spreads,
 * so the block renders correctly and is unselectable. A `string` type is the only one React
 * turns into an attribute, and it excludes Fragment, portals and every component form at once.
 *
 * `isValidElement<Record<string, unknown>>` narrows to an element whose props accept a
 * `data-` key; the unparameterised form narrows to props of `unknown`, which `cloneElement`
 * would then reject the attribute against.
 */
export async function invokeBlock(
  component: BlockComponent,
  props: Record<string, unknown>,
  node: ArtifactNode,
): Promise<ReactElement> {
  const rendered = await component(props);
  if (!isValidElement<Record<string, unknown>>(rendered) || typeof rendered.type !== "string") {
    throw new Error(
      `block "${node.block}" (node ${node.id}) must render exactly one root HTML element`,
    );
  }
  return cloneElement(rendered, { "data-nubbin-node": node.id, key: node.id });
}
