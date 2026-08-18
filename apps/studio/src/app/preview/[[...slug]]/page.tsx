import { routeFromSlug } from "@nubbin/next";
import { Renderer } from "@nubbin/react";
import { blockRegistry } from "demo/src/nubbin/blockRegistry";
import { notFound } from "next/navigation";
import { PreviewToolbar } from "../../../components/PreviewToolbar";
import { compileDraft } from "../../../nubbin/compileDraft";
import { resolveStudioHole } from "../../../nubbin/resolveStudioHole";
import { studioStore } from "../../../nubbin/studioStore";

/**
 * The demo's own render path — `compile` into `Renderer` with the demo's block registry —
 * given a draft instead of a stored artifact. Awaiting `searchParams` keeps the page dynamic,
 * so every request recompiles and re-reads the pointer.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ published?: string }>;
}) {
  const { slug } = await params;
  const { published } = await searchParams;
  const route = routeFromSlug(slug);
  const artifact = compileDraft(route);
  if (artifact === undefined) {
    notFound();
  }
  const pointer = await studioStore.pointer(route);
  return (
    <>
      <PreviewToolbar artifact={artifact} publishedHash={pointer?.hash} justPublished={published} />
      <main>
        <Renderer artifact={artifact} registry={blockRegistry} resolveHole={resolveStudioHole} />
      </main>
    </>
  );
}
