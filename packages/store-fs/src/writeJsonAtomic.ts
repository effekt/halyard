import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Temp-write then rename: the rename is the single-key write. A concurrent reader sees the
 * old file or the new one, never half of either — the property route pointers depend on.
 */
export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2));
  await rename(temp, filePath);
}
