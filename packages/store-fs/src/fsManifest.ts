import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Manifest, RoutePointer } from "@nubbin/core";
import { readJsonOrNull } from "./readJsonOrNull";

/**
 * An advisory read over the pointer files, never a stored document. Nothing depends on it
 * being current, so there is no aggregate to keep in step and no write to lose.
 */
export async function fsManifest(root: string): Promise<Manifest> {
  const directory = join(root, "routes");
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    entries = [];
  }
  const read = entries.map((entry) => readJsonOrNull<RoutePointer>(join(directory, entry)));
  const routes = (await Promise.all(read)).filter((pointer) => pointer !== null);
  return { routes, generatedAt: new Date().toISOString() };
}
