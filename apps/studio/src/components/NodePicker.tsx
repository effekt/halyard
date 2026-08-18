import type { InspectorNode } from "../nubbin/inspector.types";

interface NodePickerProps {
  nodes: Record<string, InspectorNode>;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

/** Every node in the draft as a real button — the keyboard's path to selection, beside the
 * canvas's click-to-select. */
export function NodePicker({ nodes, selectedId, onSelect }: NodePickerProps) {
  return (
    <nav aria-label="Blocks in this draft">
      <ul className="flex flex-col gap-1">
        {Object.values(nodes).map((node) => (
          <li key={node.id}>
            <button
              type="button"
              aria-pressed={node.id === selectedId}
              onClick={() => onSelect(node.id)}
              className={`w-full rounded-sm px-2 py-1 text-left ${
                node.id === selectedId ? "bg-teal text-white" : "hover:bg-canvas"
              }`}
            >
              {node.block} <code className="opacity-70">{node.id}</code>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
