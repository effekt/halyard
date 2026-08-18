import { CompileError } from "@nubbin/core";
import { commitDraftEdit } from "../../../nubbin/commitDraftEdit";
import { parseDraftEdit } from "../../../nubbin/parseDraftEdit";

const BAD_REQUEST = 400;
const UNPROCESSABLE = 422;

/**
 * One field commit. Rejections are plain text so the inspector can put the compiler's own
 * words beside the field. Unauthenticated like the publish route: the studio deploys behind
 * the consumer's own gate ([#85](https://github.com/effekt/nubbin/issues/85)).
 *
 * An unknown node is 400 like an unknown route — the same client fault, an edit naming
 * something the drafts do not hold — leaving 422 to mean the one thing it means here: the
 * compiler judged the value and said no.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => undefined);
  const edit = parseDraftEdit(body);
  if (edit === undefined) {
    return new Response("malformed edit", { status: BAD_REQUEST });
  }
  try {
    const outcome = commitDraftEdit(edit.route, edit.nodeId, edit.path, edit.value);
    if ("missing" in outcome) {
      const text =
        outcome.missing === "draft"
          ? `no draft for ${edit.route}`
          : `no node "${edit.nodeId}" in the draft for ${edit.route}`;
      return new Response(text, { status: BAD_REQUEST });
    }
    return Response.json({ hash: outcome.hash });
  } catch (error) {
    if (error instanceof CompileError) {
      return new Response(error.message, { status: UNPROCESSABLE });
    }
    throw error;
  }
}
