import { routeFromSlug } from "@nubbin/next";
import { compileDraft } from "../../../../nubbin/compileDraft";

const NOT_FOUND = 404;
const JSON_INDENT = 2;

/** The slice's other publish path: the compiled artifact itself, as a file the caller can
 * carry to any store. */
export async function GET(_request: Request, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params;
  const route = routeFromSlug(slug);
  const artifact = compileDraft(route);
  if (artifact === undefined) {
    return new Response(`no draft for ${route}`, { status: NOT_FOUND });
  }
  return new Response(JSON.stringify(artifact, null, JSON_INDENT), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${artifact.documentId}-${artifact.hash}.json"`,
    },
  });
}
