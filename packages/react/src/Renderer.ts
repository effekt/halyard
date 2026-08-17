import type { ReactElement } from "react";
import { createElement, Fragment } from "react";
import { loadBlocks } from "./loadBlocks";
import type { RenderContext, RendererProps } from "./renderer.types";
import { renderNode } from "./renderNode";

/**
 * An async server component. It reads an already-validated artifact — no schema is parsed
 * here, and nothing the artifact carries is evaluated. `blockVersions` is the whole list of
 * blocks the artifact names, so a registry of any size costs this route only those imports.
 */
export async function Renderer({
  artifact,
  registry,
  resolveHole,
}: RendererProps): Promise<ReactElement> {
  const blocks = await loadBlocks(registry, Object.keys(artifact.blockVersions));
  const context: RenderContext = { route: artifact.route, blocks, resolveHole };
  const children = await Promise.all(artifact.tree.map((node) => renderNode(node, context)));
  return createElement(Fragment, null, children);
}
