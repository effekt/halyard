import { prefixedRoute } from "../../../nubbin/prefixedRoute";
import { publishDraft } from "../../../nubbin/publishDraft";
import { studioStore } from "../../../nubbin/studioStore";

const SEE_OTHER = 303;
const BAD_REQUEST = 400;

/**
 * Unauthenticated on purpose: the studio deploys behind the consumer's own gate — a VPN, a
 * reverse proxy, existing auth — which is a supported deployment
 * ([#85](https://github.com/effekt/nubbin/issues/85)). Form-encoded so the preview page can
 * publish with no client JavaScript.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const route = String(form.get("route") ?? "");
  const hash = await publishDraft(studioStore, route);
  if (hash === undefined) {
    return new Response(`no draft for ${route}`, { status: BAD_REQUEST });
  }
  const back = new URL(`${prefixedRoute("/preview", route)}?published=${hash}`, request.url);
  return Response.redirect(back, SEE_OTHER);
}
