import type { Artifact } from "./artifact.types";
import { fnv1a } from "./fnv1a";

/**
 * Serializes with sorted keys before hashing — object key order reflects insertion order,
 * which is a compilation accident, not content. Same content, same address, always.
 */
export function hashArtifact(artifact: Omit<Artifact, "hash">): string {
  const sortKeys = (_key: string, value: unknown): unknown => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
    const entries = Object.entries(value).sort(([left], [right]) => (left < right ? -1 : 1));
    return Object.fromEntries(entries);
  };
  return fnv1a(JSON.stringify(artifact, sortKeys));
}
