import { resolveArtifact, staticRouteParams } from "@nubbin/next";
import { Renderer } from "@nubbin/react";
import { notFound } from "next/navigation";
import { blockRegistry } from "@/nubbin/blockRegistry";
import { demoStore } from "@/nubbin/demoStore";
import { resolveDemoHole } from "@/nubbin/resolveDemoHole";

/**
 * `[...slug]`, not `[[...slug]]`: the optional form also claims `/`, which the hand-written home
 * page owns, and Next rejects two owners of one path. `@nubbin/next` is built for the optional
 * form — `routeFromSlug` maps an absent slug to `/` — so a consumer with no coded home page
 * doubles the brackets and the same page serves `/` as well.
 *
 * A route published after this build is absent from `generateStaticParams` and still resolves
 * here rather than 404ing, because `dynamicParams` defaults to true and nothing turns it off.
 * That default is the whole publish-without-deploy claim, and #55 measures it.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return staticRouteParams(demoStore);
}

// `blockRegistry`, the render-side map — never `registry`, which is what compile validates
// against. `notFound()` returns `never`, so `artifact` narrows with no non-null assertion.
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const artifact = await resolveArtifact(demoStore, slug);
  if (!artifact) {
    notFound();
  }
  return <Renderer artifact={artifact} registry={blockRegistry} resolveHole={resolveDemoHole} />;
}
