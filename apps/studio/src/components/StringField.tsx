import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

const ROWS = 2;

/** Strings commit on blur, not per keystroke — the preview refreshes on commit
 * ([docs/studio.md](../../../../docs/studio.md)), so typing stays local. */
export function StringField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const value = typeof field.value === "string" ? field.value : "";
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <textarea
        id={id}
        key={value}
        defaultValue={value}
        rows={ROWS}
        onBlur={(event) => {
          if (event.target.value !== value) {
            onCommit(event.target.value);
          }
        }}
        className="mt-1 w-full rounded-sm border border-marine/25 bg-white px-2 py-1"
      />
    </FieldRow>
  );
}
