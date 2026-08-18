import { checkRollback } from "./checkRollback";
import type { CompatibilityReport, LiveRoute, RouteIncompatibility } from "./compatibility.types";
import { describeDrift } from "./describeDrift";
import type { Registry } from "./registry.types";

/**
 * The guardrail's whole question: would this registry fail to render an artifact a live route
 * pointer currently references? `checkRollback` decides each route — one artifact against the
 * registry is the same comparison whether a pointer is moving or a registry is — and this walks
 * every pointer the caller read, so publishing and merging are held to one rule.
 *
 * Pure, and synchronous: the caller reads the store and hands over what it found, so this runs
 * in CI, in a worker, or in a browser studio unchanged.
 */
export function checkCompatibility(
  live: readonly LiveRoute[],
  registry: Registry,
): CompatibilityReport {
  const incompatible = live.flatMap<RouteIncompatibility>(({ pointer, artifact }) => {
    const { route, hash } = pointer;
    if (artifact === null) {
      return [{ route, hash, reason: "unreadable-artifact" }];
    }
    const check = checkRollback(artifact, registry);
    return check.compatible
      ? []
      : [
          {
            route,
            hash,
            reason: "block-drift",
            drifted: describeDrift(artifact, registry, check.drifted),
          },
        ];
  });
  return { checked: live.length, compatible: incompatible.length === 0, incompatible };
}
