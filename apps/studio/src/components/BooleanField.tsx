import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

/** A checkbox commits the moment it changes — there is no typing to wait out.
 *
 * No `key`: keying on the value remounts the input while the author is still on it, and the
 * server re-render that follows every commit takes focus with it. The inspector remounts this
 * whole section when the selected node changes, which is the only time the value moves under it. */
export function BooleanField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const isOn = field.value === true;
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        defaultChecked={isOn}
        onChange={(event) => onCommit(event.target.checked)}
        className="mt-1 block size-4"
      />
    </FieldRow>
  );
}
