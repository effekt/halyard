import type { InspectorField } from "../nubbin/inspector.types";

const JSON_INDENT = 1;

/** The kinds without a single control — `array`, `object`, `union`, `unknown`, and any
 * `items[]` path — shown as data rather than hidden, so the author still sees what is there. */
export function ReadOnlyField({ field }: { field: InspectorField }) {
  return (
    <div className="mt-3">
      <code className="text-marine/70 text-xs">{field.path}</code>
      <p className="mt-0.5 text-marine/70 text-xs">{field.kind} — read-only</p>
      {field.value === undefined ? null : (
        <pre className="mt-1 max-h-24 overflow-auto rounded-sm bg-canvas p-2 text-xs">
          {JSON.stringify(field.value, null, JSON_INDENT)}
        </pre>
      )}
    </div>
  );
}
