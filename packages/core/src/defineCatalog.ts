import { resolveHintPaths } from "./adapters/resolveHintPaths";
import { assertValidDefaults } from "./assertValidDefaults";
import type { Catalog, CatalogEntry } from "./catalog.types";

/**
 * The serializable half of the catalog/registry split: schema, ui, defaults, docs — no
 * components. Everything checkable at registration is checked here, because a bad hint or
 * bad defaults are silent at every later point.
 */
export function defineCatalog(entries: Record<string, CatalogEntry>): Catalog {
  for (const [blockName, entry] of Object.entries(entries)) {
    if (entry.ui?.fields !== undefined) {
      resolveHintPaths(blockName, entry.schema, entry.ui.fields);
    }
    if (entry.defaults !== undefined) {
      assertValidDefaults(blockName, entry.schema, entry.defaults);
    }
  }
  return entries;
}
