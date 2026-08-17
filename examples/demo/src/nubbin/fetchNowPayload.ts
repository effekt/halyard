import type { FieldHintData } from "@nubbin/core";
import { holeFetchOptions } from "@nubbin/next";
import type { NowPayload } from "./nowPayload.types";

/**
 * The spec — not this function — decides the fetch's cache behaviour, so what makes a value live
 * or cached is the artifact's declared lifecycle. `127.0.0.1` rather than `localhost`, which
 * resolves to `::1` first on some machines while the dev server binds IPv4.
 */
export async function fetchNowPayload(spec: FieldHintData): Promise<NowPayload> {
  const origin = `http://127.0.0.1:${process.env.PORT ?? "3000"}`;
  const response = await fetch(`${origin}/api/now`, holeFetchOptions(spec));
  if (!response.ok) {
    throw new Error(`/api/now answered ${response.status}`);
  }
  return (await response.json()) as NowPayload;
}
