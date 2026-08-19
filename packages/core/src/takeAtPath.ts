import { splitPath } from "./splitPath";

/**
 * Copy-on-write removal down one dotted path — the inverse of `setAtPath`, and addressing the
 * same vocabulary. An absent path takes nothing and returns the input untouched, so a caller
 * can tell "removed the leaf" from "there was no leaf" without probing the shape itself.
 */
export function takeAtPath(
  target: Record<string, unknown>,
  path: string,
): { rest: Record<string, unknown>; taken: boolean } {
  const { head, tail } = splitPath(path);
  if (!Object.hasOwn(target, head)) return { rest: target, taken: false };
  if (tail.length === 0) {
    const remaining = { ...target };
    delete remaining[head];
    return { rest: remaining, taken: true };
  }
  const child = target[head];
  if (typeof child !== "object" || child === null || Array.isArray(child)) {
    return { rest: target, taken: false };
  }
  const inner = takeAtPath(child as Record<string, unknown>, tail.join("."));
  if (!inner.taken) return { rest: target, taken: false };
  return { rest: { ...target, [head]: inner.rest }, taken: true };
}
