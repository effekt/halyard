import type { Artifact, ArtifactStore, RoutePointer } from "@nubbin/core";
import { artifactPath } from "./artifactPath";
import { fsManifest } from "./fsManifest";
import { fsPublish } from "./fsPublish";
import { fsUnpublish } from "./fsUnpublish";
import { fsWriteArtifact } from "./fsWriteArtifact";
import { pointerPath } from "./pointerPath";
import { readJsonOrNull } from "./readJsonOrNull";

/**
 * One pointer file per route, one file per artifact, and nothing else. No aggregate document
 * exists, so two publishes to different routes cannot lose each other's write.
 */
export function createFsArtifactStore(root: string): ArtifactStore {
  return {
    read: (hash) => readJsonOrNull<Artifact>(artifactPath(root, hash)),
    write: (artifact) => fsWriteArtifact(root, artifact),
    pointer: (route) => readJsonOrNull<RoutePointer>(pointerPath(root, route)),
    manifest: () => fsManifest(root),
    publish: (route, hash) => fsPublish(root, route, hash),
    unpublish: (route) => fsUnpublish(root, route),
  };
}
