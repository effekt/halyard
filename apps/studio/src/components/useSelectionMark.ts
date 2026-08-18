import { type RefObject, useEffect } from "react";
import type { InspectorNode } from "../nubbin/inspector.types";

/**
 * Marks the selected block in the canvas so the stylesheet can outline it. Re-runs when
 * `nodes` changes identity — every server re-render — because the refreshed markup arrives
 * unmarked.
 */
export function useSelectionMark(
  ref: RefObject<HTMLElement | null>,
  selectedId: string | undefined,
  nodes: Record<string, InspectorNode>,
): void {
  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    for (const marked of canvas.querySelectorAll("[data-nubbin-selected]")) {
      marked.removeAttribute("data-nubbin-selected");
    }
    if (selectedId === undefined || nodes[selectedId] === undefined) {
      return;
    }
    canvas
      .querySelector(`[data-nubbin-node="${CSS.escape(selectedId)}"]`)
      ?.setAttribute("data-nubbin-selected", "");
  }, [ref, selectedId, nodes]);
}
