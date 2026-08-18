import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

/** Numbers commit on blur, as parsed numbers — an empty or unchanged input commits nothing. */
export function NumberField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const value = typeof field.value === "number" ? String(field.value) : "";
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <input
        type="number"
        id={id}
        step="any"
        key={value}
        defaultValue={value}
        onBlur={(event) => {
          if (event.target.value !== "" && event.target.value !== value) {
            onCommit(Number(event.target.value));
          }
        }}
        className="mt-1 w-full rounded-sm border border-marine/25 bg-white px-2 py-1"
      />
    </FieldRow>
  );
}
