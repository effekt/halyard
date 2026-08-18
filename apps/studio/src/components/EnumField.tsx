import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

/** Enum members come from the schema itself, so the select cannot offer a value the
 * validator would refuse. Commits on change.
 *
 * No `key`: keying on the value remounts the select while the author is still on it, and the
 * server re-render that follows every commit takes focus with it. The inspector remounts this
 * whole section when the selected node changes, which is the only time the value moves under it. */
export function EnumField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const value = typeof field.value === "string" ? field.value : "";
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <select
        id={id}
        defaultValue={value}
        onChange={(event) => onCommit(event.target.value)}
        className="mt-1 w-full rounded-sm border border-marine/25 bg-white px-2 py-1"
      >
        {value === "" ? (
          <option value="" disabled>
            unset
          </option>
        ) : null}
        {(field.members ?? []).map((member) => (
          <option key={member} value={member}>
            {member}
          </option>
        ))}
      </select>
    </FieldRow>
  );
}
