import { readFile } from "node:fs/promises";

/** ENOENT is a value here — an unknown hash or unpublished route reads as null, not a throw. */
export async function readJsonOrNull<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
