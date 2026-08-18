import { readFileSync } from "node:fs";
import type { DocumentVersion } from "@nubbin/core";

/** ENOENT is a value — a route nothing ever edited reads as `undefined`, so it falls back
 * to its committed fixture. Sync because `readDraft` sits on synchronous call paths. */
export function readDraftFile(filePath: string): DocumentVersion | undefined {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as DocumentVersion;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
