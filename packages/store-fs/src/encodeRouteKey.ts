/**
 * One pointer file per route needs a filename that cannot collide or nest. Percent-encoding
 * keeps `/` out of the name while staying reversible, so `manifest()` can list the directory.
 */
export function encodeRouteKey(route: string): string {
  return encodeURIComponent(route);
}
