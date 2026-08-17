import type { FieldHintData } from "@nubbin/core";

/**
 * Maps a hole's declared lifecycle onto Next's fetch cache, so the mapping is owned by the
 * binding rather than re-decided in every consumer's resolver. `no-store` also makes a page
 * carrying a request hole dynamic — per-request resolution is exactly what it declared.
 *
 * Takes core's `FieldHintData` directly. An earlier plan derived a local `HoleSpec` from
 * `ArtifactNode["holes"]` so two packages would not import each other; core exports the type
 * by name, so both import it from core and neither derivation is needed.
 */
export function holeFetchOptions(
  spec: FieldHintData,
): RequestInit & { next?: { revalidate: number } } {
  if (spec === "request") {
    return { cache: "no-store" };
  }
  return { next: { revalidate: spec.revalidate } };
}
