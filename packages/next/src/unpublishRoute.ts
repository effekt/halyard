import type { ArtifactStore } from "@nubbin/core";
import { revalidatePath } from "next/cache";

/** Pointer removed, then that one route invalidated — the next request renders a real 404. */
export async function unpublishRoute(store: ArtifactStore, route: string): Promise<void> {
  await store.unpublish(route);
  revalidatePath(route);
}
