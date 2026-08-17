import type { UnknownProps } from "./block.types";

const FIRST_MIGRATABLE_VERSION = 2;

/** A migrate key must name a version this block actually reaches: 2 up to its current version. */
export function assertMigrateKeys(
  name: string,
  version: number,
  migrate: Record<number, (props: UnknownProps) => UnknownProps> | undefined,
): void {
  for (const key of Object.keys(migrate ?? {})) {
    const target = Number(key);
    if (target < FIRST_MIGRATABLE_VERSION || target > version) {
      throw new Error(`${name}: migrate key ${key} is outside the reachable range 2..${version}`);
    }
  }
}
