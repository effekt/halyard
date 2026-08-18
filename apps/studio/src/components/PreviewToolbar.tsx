import type { Artifact } from "@nubbin/core";
import { prefixedRoute } from "../nubbin/prefixedRoute";
import { publishState } from "../nubbin/publishState";

interface PreviewToolbarProps {
  artifact: Artifact;
  publishedHash: string | undefined;
  justPublished: string | undefined;
}

/** Chrome above the rendered draft: where it points, what publishing it would do, and both
 * publish paths — the store and the download. */
export function PreviewToolbar({ artifact, publishedHash, justPublished }: PreviewToolbarProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-marine/20 border-b bg-white px-6 py-3 text-marine text-sm">
      <a className="font-semibold text-teal underline underline-offset-4" href="/">
        Studio
      </a>
      <p>
        Draft of <strong>{artifact.route}</strong> — compiles to <code>{artifact.hash}</code>,{" "}
        {publishState(artifact.hash, publishedHash)}
      </p>
      {justPublished === undefined ? null : (
        <p role="status" className="font-semibold">
          Published as <code>{justPublished}</code>
        </p>
      )}
      <form method="post" action="/api/publish">
        <input type="hidden" name="route" value={artifact.route} />
        <button
          type="submit"
          className="rounded-md border border-orange-deep bg-orange-deep px-4 py-1.5 font-semibold text-white"
        >
          Publish
        </button>
      </form>
      <a
        className="text-teal underline underline-offset-4"
        href={prefixedRoute("/api/artifact", artifact.route)}
      >
        Download artifact
      </a>
    </header>
  );
}
