import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { DocumentVersion } from "@nubbin/core";

/**
 * Overwrite in place — the slot holds one draft per route and no history. Temp-write then
 * rename, the property `writeJsonAtomic` gives route pointers: a concurrent reader sees
 * the old draft or the new one, never half of either.
 */
export function writeDraftFile(filePath: string, version: DocumentVersion): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(version, null, 2));
  renameSync(temp, filePath);
}
