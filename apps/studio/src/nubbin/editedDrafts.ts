import type { DocumentVersion } from "@nubbin/core";

const KEY = Symbol.for("nubbin.studio.editedDrafts");

interface DraftHolder {
  [KEY]?: Map<string, DocumentVersion>;
}

/**
 * Edits held in process memory and nothing more — not storage, and deliberately not designed
 * into any. A restart, a rebuild or a second process returns every draft to its committed
 * fixture, and two editors in separate processes never see each other's edits. The durable
 * home for drafts is the authoring store, an open design question
 * ([#11](https://github.com/effekt/nubbin/issues/11)) this map must not preempt.
 *
 * Anchored on `globalThis` because Next bundles pages and route handlers as separate module
 * graphs: a module-scope map would give the edit endpoint and the preview page two different
 * maps, and a committed edit would never render.
 */
const holder = globalThis as DraftHolder;
const held = holder[KEY] ?? new Map<string, DocumentVersion>();
holder[KEY] = held;

export const editedDrafts: Map<string, DocumentVersion> = held;
