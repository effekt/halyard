import type { Artifact } from "@nubbin/core";
import { artifactPath } from "./artifactPath";
import { readJsonOrNull } from "./readJsonOrNull";
import { writeJsonAtomic } from "./writeJsonAtomic";

/**
 * An existing hash holds the same bytes by construction, so re-writing is skipped rather than
 * rejected — a publish retried after a timeout must not fail on its second attempt.
 */
export async function fsWriteArtifact(root: string, artifact: Artifact): Promise<void> {
  const path = artifactPath(root, artifact.hash);
  if (await readJsonOrNull(path)) {
    return;
  }
  await writeJsonAtomic(path, artifact);
}
