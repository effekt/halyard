import type { StandardSchemaV1 } from "@standard-schema/spec";

/** Joins a Standard Schema issue path into the dotted form hints and field nodes use. */
export function formatIssuePath(path: StandardSchemaV1.Issue["path"]): string {
  if (path === undefined) return "";
  return path
    .map((segment) =>
      typeof segment === "object" && segment !== null ? String(segment.key) : String(segment),
    )
    .join(".");
}
