import type { InspectorNode } from "../nubbin/inspector.types";
import { FieldControl } from "./FieldControl";
import { NodePicker } from "./NodePicker";

interface InspectorProps {
  nodes: Record<string, InspectorNode>;
  selected: InspectorNode | undefined;
  onSelect: (id: string) => void;
  commit: (nodeId: string, path: string, value: unknown) => Promise<string | undefined>;
}

/** The panel beside the canvas: pick a node, then edit its fields.
 *
 * The fields section is keyed by the selected node. Every control below reads its value once,
 * at mount, so switching nodes has to remount them or a control keeps the previous node's
 * value. Keying here rather than on each control's own value is what lets a control that
 * commits on change survive its own commit with focus intact. */
export function Inspector({ nodes, selected, onSelect, commit }: InspectorProps) {
  return (
    <aside
      aria-label="Inspector"
      className="sticky top-0 flex max-h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto border-marine/20 border-l bg-white p-4 text-marine text-sm"
    >
      <NodePicker nodes={nodes} selectedId={selected?.id} onSelect={onSelect} />
      {selected === undefined ? (
        <p>Select a block — in the list above, or by clicking it in the preview.</p>
      ) : (
        <section key={selected.id} aria-label={`${selected.block} fields`}>
          <h2 className="font-semibold">{selected.block}</h2>
          {selected.fields.map((field) => (
            <FieldControl
              key={field.path}
              field={field}
              commit={(path, value) => commit(selected.id, path, value)}
            />
          ))}
        </section>
      )}
    </aside>
  );
}
