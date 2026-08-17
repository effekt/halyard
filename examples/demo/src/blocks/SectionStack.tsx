import type { ReactNode } from "react";

/**
 * The root a page of stacked sections needs, because an artifact tree has a single root node.
 * Slot children arrive already rendered, so this places them and adds nothing of its own.
 */
export function SectionStack({ sections }: { sections?: ReactNode }) {
  return <main data-nubbin-block="SectionStack">{sections}</main>;
}
