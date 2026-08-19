/**
 * Splits one dotted path into its first segment and the segments below it, refusing what no
 * path can address: an empty segment, and `[]`, which names every member of an array rather
 * than one target. `setAtPath` and `takeAtPath` walk in opposite directions and share this
 * rule, so it is stated once.
 */
export function splitPath(path: string): { head: string; tail: string[] } {
  const [head, ...tail] = path.split(".");
  if (head === undefined || head === "" || head.includes("[]")) {
    throw new Error(`path "${path}" is not addressable`);
  }
  return { head, tail };
}
