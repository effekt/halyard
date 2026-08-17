import type { NowPayload } from "./nowPayload.types";

/**
 * Shapes one payload into what the field's schema describes. Nothing validates a hole's value at
 * render — `resolveNodeHoles` sets it and the block reads it — so this shape is owed here, and
 * the sibling test against the real schemas is the only thing that checks it is paid.
 */
export function demoHoleValue(block: string, path: string, payload: NowPayload): unknown {
  if (block === "StatBand" && path === "stats") {
    return [
      { value: String(payload.served), label: "times /api/now has answered" },
      { value: new Date(payload.now).toISOString(), label: "resolved for this request" },
    ];
  }
  if (block === "FaqAccordion" && path === "items") {
    return [
      { question: "When was this answer cached?", answer: new Date(payload.now).toISOString() },
    ];
  }
  throw new Error(`no demo resolver for ${block}.${path}`);
}
