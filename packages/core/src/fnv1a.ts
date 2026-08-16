const OFFSET_BASIS = 2166136261;
const PRIME = 16777619;
const HEX_RADIX = 16;
const HEX_WIDTH = 8;

/**
 * FNV-1a, 32-bit. Used where a value only has to change when its input changes — fingerprints
 * and content addresses. It is not a security primitive and must not be used as one. core
 * cannot reach node:crypto, and crypto.subtle is async where these call sites are not.
 */
export function fnv1a(input: string): string {
  let hash = OFFSET_BASIS;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, PRIME);
  }
  return (hash >>> 0).toString(HEX_RADIX).padStart(HEX_WIDTH, "0");
}
