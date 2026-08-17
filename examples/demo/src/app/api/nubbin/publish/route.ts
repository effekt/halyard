import { publishRoute } from "@nubbin/next";
import { demoStore } from "@/nubbin/demoStore";

/**
 * Demo-local, and unauthenticated on purpose: `revalidatePath` only invalidates the cache of the
 * process that runs it, so a publish from outside the server has to arrive as a request. The demo
 * binds to localhost and is never deployed.
 */
export async function POST(request: Request) {
  const { route, hash } = (await request.json()) as { route: string; hash: string };
  await publishRoute(demoStore, route, hash);
  return Response.json({ ok: true, route, hash });
}
