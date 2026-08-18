import { isAddressablePath } from "./isAddressablePath";

/** The edit endpoint's body, once its shape has been checked. */
export interface DraftEdit {
  route: string;
  nodeId: string;
  path: string;
  value: unknown;
}

/** Checks an untrusted request body against the edit shape — `undefined` over a throw, so
 * the endpoint answers a malformed body with its own status. A path `setNodeProp` cannot
 * address is malformed the same way a non-string one is. */
export function parseDraftEdit(body: unknown): DraftEdit | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  const { route, nodeId, path } = record;
  if (typeof route !== "string" || typeof nodeId !== "string" || typeof path !== "string") {
    return undefined;
  }
  if (!isAddressablePath(path)) {
    return undefined;
  }
  return { route, nodeId, path, value: record.value };
}
