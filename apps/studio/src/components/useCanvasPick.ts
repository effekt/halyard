import { type RefObject, useEffect } from "react";

/**
 * Selection by pointing at the page itself: a capture-phase listener reads the
 * `data-nubbin-node` the renderer stamps on every block's root. Every canvas click is
 * swallowed — an author selecting a CTA must not navigate to it.
 */
export function useCanvasPick(
  ref: RefObject<HTMLElement | null>,
  onSelect: (id: string) => void,
): void {
  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return undefined;
    }
    const pick = (event: MouseEvent) => {
      event.preventDefault();
      const target = event.target instanceof Element ? event.target : null;
      const id = target?.closest("[data-nubbin-node]")?.getAttribute("data-nubbin-node");
      if (id != null) {
        onSelect(id);
      }
    };
    canvas.addEventListener("click", pick, true);
    return () => canvas.removeEventListener("click", pick, true);
  }, [ref, onSelect]);
}
