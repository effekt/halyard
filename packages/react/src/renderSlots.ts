import type { ArtifactNode } from "@nubbin/core";
import type { ReactElement } from "react";

/**
 * Slot children reach the block as props: `slots.sections` becomes `props.sections`, an array
 * the block places itself. The renderer invents no wrapper around them.
 *
 * The child renderer arrives as an argument rather than an import because slots render nodes
 * and nodes render slots — injecting the recursion keeps that cycle out of the module graph.
 */
export async function renderSlots(
  slots: Record<string, ArtifactNode[]> | undefined,
  renderChild: (node: ArtifactNode) => Promise<ReactElement>,
): Promise<Record<string, ReactElement[]>> {
  const rendered = await Promise.all(
    Object.entries(slots ?? {}).map(
      async ([slot, children]) =>
        [slot, await Promise.all(children.map((child) => renderChild(child)))] as const,
    ),
  );
  return Object.fromEntries(rendered);
}
