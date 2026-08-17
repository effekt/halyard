import { join } from "node:path";
import type { HoleResolver } from "@nubbin/react";
import { appendHoleLog } from "./appendHoleLog";
import { demoHoleValue } from "./demoHoleValue";
import { fetchNowPayload } from "./fetchNowPayload";

/** Beside the store, so one `rm -rf .nubbin` clears both the pointers and the evidence. */
const HOLE_LOG_FILE = join(process.cwd(), ".nubbin", "hole-log.txt");

/**
 * Logged, fetched, shaped. The log is written before the fetch so a line exists even when the
 * fetch fails — a route that resolved nothing and a route whose resolution broke are different
 * findings, and the file has to tell them apart.
 */
export const resolveDemoHole: HoleResolver = async ({ route, nodeId, block, path, spec }) => {
  await appendHoleLog(HOLE_LOG_FILE, `${route} ${nodeId} ${path}`);
  return demoHoleValue(block, path, await fetchNowPayload(spec));
};
