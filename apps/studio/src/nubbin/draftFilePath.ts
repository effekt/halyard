import { join } from "node:path";
import { draftsDir } from "./draftsDir";

/** One draft file per route. Percent-encoding keeps `/` out of the filename — the same
 * property the store's route pointers rely on — so routes cannot nest or collide. */
export function draftFilePath(route: string): string {
  return join(draftsDir(), `${encodeURIComponent(route)}.json`);
}
