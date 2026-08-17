import { rm } from "node:fs/promises";
import { pointerPath } from "./pointerPath";

/** `force` because unpublishing an already-unpublished route is a no-op, not an error. */
export async function fsUnpublish(root: string, route: string): Promise<void> {
  await rm(pointerPath(root, route), { force: true });
}
