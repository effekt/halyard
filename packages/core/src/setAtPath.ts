import { splitPath } from "./splitPath";

/** Copy-on-write down one dotted path. Paths address object fields only; `[]` has no single target. */
export function setAtPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const { head, tail } = splitPath(path);
  if (tail.length === 0) {
    return { ...target, [head]: value };
  }
  const child = target[head];
  const base =
    typeof child === "object" && child !== null ? (child as Record<string, unknown>) : {};
  return { ...target, [head]: setAtPath(base, tail.join("."), value) };
}
