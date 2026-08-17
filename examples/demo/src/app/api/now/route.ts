import { countedNowPayload } from "./countedNowPayload";

/**
 * The only data source a hole resolves from. `force-dynamic` because the counter is meaningless
 * if a cached response can answer — every request has to reach the handler for the number to
 * mean what the rendered page claims it means.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(countedNowPayload());
}
