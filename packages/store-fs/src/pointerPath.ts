import { join } from "node:path";
import { encodeRouteKey } from "./encodeRouteKey";

/** One file per route. The encoded key keeps `/` out of the name so routes cannot nest. */
export function pointerPath(root: string, route: string): string {
  return join(root, "routes", `${encodeRouteKey(route)}.json`);
}
