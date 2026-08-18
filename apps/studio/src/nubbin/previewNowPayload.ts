import type { NowPayload } from "demo/src/nubbin/nowPayload.types";

let resolved = 0;

/**
 * In-process source for what the demo's `/api/now` serves over HTTP, so a preview needs no
 * demo server running. `served` counts holes this process has resolved — repeated previews
 * move it the way repeated requests move the demo's counter.
 */
export function previewNowPayload(): NowPayload {
  resolved += 1;
  return { now: Date.now(), served: resolved };
}
