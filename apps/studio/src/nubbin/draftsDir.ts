import { join } from "node:path";

/**
 * Where the studio's drafts survive a restart: a gitignored directory beside the app, one
 * file per route, overwritten in place. This is the autosave slot — the one write
 * [#11](https://github.com/effekt/nubbin/issues/11) calls "the awkward one", the only
 * mutable, high-frequency write in an otherwise append-only design — and deliberately not
 * the authoring store: no history, no version append, no locks, no interface anyone else
 * implements. What that store's contract looks like is still the open design question #11
 * tracks, and this slot must not preempt it.
 *
 * The environment override exists because tests run in parallel files that must not share
 * one directory; the studio itself never sets it.
 */
export function draftsDir(): string {
  return process.env.NUBBIN_STUDIO_DRAFTS ?? join(process.cwd(), ".drafts");
}
