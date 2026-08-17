import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Appends, and creates the directory first: a hole can resolve before anything has published
 * into `.nubbin/`. Appending rather than rewriting is the point — the evidence that a static
 * prop resolved nothing is a file with no line for it.
 */
export async function appendHoleLog(file: string, line: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, `${line}\n`, "utf8");
}
