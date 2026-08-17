import { unpublishRoute } from "@nubbin/next";
import { demoStore } from "@/nubbin/demoStore";

/** The pointer is removed and that one route invalidated, so the next request renders a real 404. */
export async function POST(request: Request) {
  const { route } = (await request.json()) as { route: string };
  await unpublishRoute(demoStore, route);
  return Response.json({ ok: true, route });
}
