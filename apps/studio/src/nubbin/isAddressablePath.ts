/**
 * Whether a client-supplied path names something `setNodeProp` can address: every dotted
 * segment a non-empty field name, none an `[]`. These are the shapes core's `setAtPath`
 * throws on — rightly, for a caller that composed the path in code — but over the wire they
 * are a malformed edit, and the boundary refuses them as a value instead.
 */
export function isAddressablePath(path: string): boolean {
  return path.split(".").every((segment) => segment !== "" && !segment.includes("[]"));
}
