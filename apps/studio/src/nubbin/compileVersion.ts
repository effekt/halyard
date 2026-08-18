import type { Artifact, DocumentVersion } from "@nubbin/core";
import { compile } from "@nubbin/core";
import { catalog } from "demo/src/nubbin/catalog";
import { registry } from "demo/src/nubbin/registry";

/** One compile seam for stored drafts and candidate edits alike: the demo's catalog and
 * registry are what this studio deployment edits against. */
export function compileVersion(version: DocumentVersion, route: string): Artifact {
  return compile(version, catalog, registry, route);
}
