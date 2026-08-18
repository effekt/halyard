import { useId } from "react";
import { FieldRow } from "./FieldRow";
import type { EditableFieldProps } from "./fieldControl.types";

/** Enum members come from the schema itself, so the select cannot offer a value the
 * validator would refuse. Commits on change. */
export function EnumField({ field, rejection, onCommit }: EditableFieldProps) {
  const id = useId();
  const value = typeof field.value === "string" ? field.value : "";
  return (
    <FieldRow field={field} rejection={rejection} htmlFor={id}>
      <select
        id={id}
        key={value}
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
