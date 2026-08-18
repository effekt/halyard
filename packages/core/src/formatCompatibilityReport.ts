import type { CompatibilityReport } from "./compatibility.types";
import { formatRouteIncompatibility } from "./formatRouteIncompatibility";

/**
 * The report as a CI log reads it. `checked` leads every line, including the passing one: a run
 * that found no pointers and a run that cleared eight are the same word otherwise, and the first
 * of those is a gate certifying nothing.
 */
export function formatCompatibilityReport(report: CompatibilityReport): string {
  if (report.compatible) {
    return `${report.checked} live route pointer(s) checked; every one is compatible with this registry.`;
  }
  const summary = `${report.incompatible.length} of ${report.checked} live route pointer(s) are incompatible with this registry:`;
  return [summary, ...report.incompatible.map(formatRouteIncompatibility)].join("\n");
}
