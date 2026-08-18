"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef, useState } from "react";
import type { InspectorNode } from "../nubbin/inspector.types";
import { postDraftEdit } from "../nubbin/postDraftEdit";
import { Inspector } from "./Inspector";
import { useCanvasPick } from "./useCanvasPick";
import { useSelectionMark } from "./useSelectionMark";

interface PreviewEditorProps {
  route: string;
  nodes: Record<string, InspectorNode>;
  children: ReactNode;
}

/** The editing shell around the rendered draft: canvas left, inspector right, selection
 * shared between them, and a server re-render after every committed edit.
 *
 * The canvas is a `div`, not a `main`. The draft rendered inside it brings its own landmarks —
 * every fixture roots at a block that is itself a `main` — and a second one nests two main
 * landmarks in one document. The chrome yields because the page is the content, not the shell. */
export function PreviewEditor({ route, nodes, children }: PreviewEditorProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  useCanvasPick(canvasRef, setSelectedId);
  useSelectionMark(canvasRef, selectedId, nodes);
  const commit = useCallback(
    async (nodeId: string, path: string, value: unknown) => {
      const rejection = await postDraftEdit(route, nodeId, path, value);
      if (rejection === undefined) {
        router.refresh();
      }
      return rejection;
    },
    [route, router],
  );
  const selected = selectedId === undefined ? undefined : nodes[selectedId];
  return (
    <div className="flex items-start">
      <div ref={canvasRef} className="min-w-0 flex-1">
        {children}
      </div>
      <Inspector nodes={nodes} selected={selected} onSelect={setSelectedId} commit={commit} />
    </div>
  );
}
