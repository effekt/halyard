import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

/** A checkbox commits the moment it changes — there is no typing to wait out. */
export function BooleanField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const isOn = field.value === true;
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        key={String(isOn)}
        defaultChecked={isOn}
        onChange={(event) => onCommit(event.target.checked)}
        className="mt-1 block size-4"
      />
    </FieldRow>
  );
}
