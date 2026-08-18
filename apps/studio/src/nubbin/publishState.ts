/** One toolbar line: how the store's pointer relates to this draft's compile. */
export function publishState(draftHash: string, publishedHash: string | undefined): string {
  if (publishedHash === undefined) {
    return "not published";
  }
  if (publishedHash === draftHash) {
    return "published — the live pointer matches this draft";
  }
  return `published at ${publishedHash} — this draft differs`;
}
