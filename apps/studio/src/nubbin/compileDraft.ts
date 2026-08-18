import type { Artifact } from "@nubbin/core";
import { compile } from "@nubbin/core";
import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { catalog } from "demo/src/nubbin/catalog";
import { registry } from "demo/src/nubbin/registry";

/**
 * The studio's compile seam: drafts are the demo's committed fixtures ([#11] is the
 * authoring store), against the demo's own catalog and registry. `undefined` rather than a
 * throw for an unknown route, so each caller answers with its own status.
 *
 * [#11]: https://github.com/effekt/nubbin/issues/11
 */
export function compileDraft(route: string): Artifact | undefined {
  const version = fixtureRoutes[route];
  if (version === undefined) {
    return undefined;
  }
  return compile(version, catalog, registry, route);
}
