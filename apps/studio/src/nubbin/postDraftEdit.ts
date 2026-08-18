/**
 * The client half of a commit: one field edit posted to the studio's edit endpoint.
 * Resolves to `undefined` when the commit landed, or to the rejection text when it did not,
 * so a control can put the compiler's own message beside the field.
 */
export async function postDraftEdit(
  route: string,
  nodeId: string,
  path: string,
  value: unknown,
): Promise<string | undefined> {
  const response = await fetch("/api/edit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ route, nodeId, path, value }),
  });
  if (response.ok) {
    return undefined;
  }
  const text = await response.text();
  return text === "" ? `edit rejected (${response.status})` : text;
}
