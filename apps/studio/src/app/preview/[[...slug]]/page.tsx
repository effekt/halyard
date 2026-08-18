import { routeFromSlug } from "@nubbin/next";
import { Renderer } from "@nubbin/react";
import { blockRegistry } from "demo/src/nubbin/blockRegistry";
import { catalog } from "demo/src/nubbin/catalog";
import { notFound } from "next/navigation";
import { PreviewEditor } from "../../../components/PreviewEditor";
import { PreviewToolbar } from "../../../components/PreviewToolbar";
import { compileVersion } from "../../../nubbin/compileVersion";
import { readDraft } from "../../../nubbin/readDraft";
import { resolveStudioHole } from "../../../nubbin/resolveStudioHole";
import { studioStore } from "../../../nubbin/studioStore";
import { toInspectorNodes } from "../../../nubbin/toInspectorNodes";

/**
 * The demo's own render path — `compile` into `Renderer` with the demo's block registry —
 * given the current draft instead of a stored artifact, wrapped in the editing shell.
 * Awaiting `searchParams` keeps the page dynamic, so every request recompiles and re-reads
 * the pointer — which is what makes a committed edit appear on refresh.
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
  const draft = readDraft(route);
  if (draft === undefined) {
    notFound();
  }
  const artifact = compileVersion(draft, route);
  const pointer = await studioStore.pointer(route);
  return (
    <>
      <PreviewToolbar artifact={artifact} publishedHash={pointer?.hash} justPublished={published} />
      <PreviewEditor route={route} nodes={toInspectorNodes(draft, catalog)}>
        <Renderer artifact={artifact} registry={blockRegistry} resolveHole={resolveStudioHole} />
      </PreviewEditor>
    </>
  );
}
