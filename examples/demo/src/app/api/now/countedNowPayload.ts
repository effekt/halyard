import type { NowPayload } from "@/nubbin/nowPayload.types";

/**
 * Per process, and deliberately part of the body rather than a header: the count has to survive
 * into the rendered HTML, so a repeated number identifies a cached response instead of a fresh
 * call.
 */
let served = 0;

export function countedNowPayload(): NowPayload {
  served += 1;
  return { now: Date.now(), served };
}
