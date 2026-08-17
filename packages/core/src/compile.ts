import type { Artifact } from "./artifact.types";
import { CompileError } from "./CompileError";
import type { Catalog } from "./catalog.types";
import { denormalize } from "./denormalize";
import type { DocumentVersion } from "./document.types";
import { hashArtifact } from "./hashArtifact";
import type { Registry } from "./registry.types";
import { resolveAllProps } from "./resolveAllProps";
import { usedBlockVersions } from "./usedBlockVersions";
import { validateStructure } from "./validateStructure";
import { NUBBIN_VERSION } from "./version.constants";

/**
 * Orchestration only. Structure first, and stop there if it failed — prop validation on a
 * document with dangling references produces cascading noise that buries the real cause.
 */
export function compile(
  version: DocumentVersion,
  catalog: Catalog,
  registry: Registry,
  route: string,
): Artifact {
  const structural = validateStructure(version, registry);
  if (structural.length > 0) throw new CompileError(structural);

  const { resolved, issues } = resolveAllProps(version, catalog);
  if (issues.length > 0) throw new CompileError(issues);

  // Every element resolved or an issue was thrown above; the fallback is unreachable.
  const tree = denormalize(version, (node) => resolved.get(node.id) ?? { props: {}, holes: {} });

  const content: Omit<Artifact, "hash"> = {
    route,
    documentId: version.documentId,
    documentVersion: version.version,
    registryFingerprint: registry.fingerprint(),
    blockVersions: usedBlockVersions(version, registry),
    tree,
    meta: version.meta,
    compiledWith: NUBBIN_VERSION,
  };
  return { ...content, hash: hashArtifact(content) };
}
