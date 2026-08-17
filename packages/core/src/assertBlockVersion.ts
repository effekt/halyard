/** A block version below 1 has no artifact that could record it. */
export function assertBlockVersion(name: string, version: number): void {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`${name}: version must be an integer of 1 or more`);
  }
}
