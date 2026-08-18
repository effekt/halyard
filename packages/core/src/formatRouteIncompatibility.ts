import type { RouteIncompatibility } from "./compatibility.types";
import { formatBlockDrift } from "./formatBlockDrift";

/**
 * The route, the artifact it points at, and every reason it would fail — indented under one
 * heading so a log reader can attribute each block to the page it breaks. The hash is on the
 * heading because it is what identifies the artifact in a store.
 */
export function formatRouteIncompatibility(incompatibility: RouteIncompatibility): string {
  const heading = `  ${incompatibility.route}  (artifact ${incompatibility.hash})`;
  const reasons =
    incompatibility.reason === "unreadable-artifact"
      ? ["the store holds no artifact at this hash"]
      : incompatibility.drifted.map(formatBlockDrift);
  return [heading, ...reasons.map((reason) => `    ${reason}`)].join("\n");
}
