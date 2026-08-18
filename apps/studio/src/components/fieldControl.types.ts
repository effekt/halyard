import type { InspectorField } from "../nubbin/inspector.types";

/** What every editable control receives: its field, the last rejection, and the commit. */
export interface EditableFieldProps {
  field: InspectorField;
  rejection: string | undefined;
  onCommit: (value: unknown) => Promise<void>;
}
