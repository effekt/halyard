import type { RoutePointer } from "./artifact.types";

/**
 * matchKind is parsed from the route at publish, never caller-supplied. It lives in core so
 * every adapter derives it from one implementation — a second parser is free to disagree.
 */
export function parseMatchKind(route: string): RoutePointer["matchKind"] {
  if (route.endsWith("/*")) {
    return "prefix";
  }
  if (/\[[^/]+\]/.test(route)) {
    return "param";
  }
  return "exact";
}
