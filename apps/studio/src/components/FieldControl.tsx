import { useState } from "react";
import type { InspectorField } from "../nubbin/inspector.types";
import { isEditableField } from "../nubbin/isEditableField";
import { BooleanField } from "./BooleanField";
import { EnumField } from "./EnumField";
import { NumberField } from "./NumberField";
import { ReadOnlyField } from "./ReadOnlyField";
import { StringField } from "./StringField";

interface FieldControlProps {
  field: InspectorField;
  commit: (path: string, value: unknown) => Promise<string | undefined>;
}

/** One field row: the control for the field's kind, holding the last rejection the compiler
 * returned for it. */
export function FieldControl({ field, commit }: FieldControlProps) {
  const [rejection, setRejection] = useState<string | undefined>(undefined);
  const onCommit = async (value: unknown) => {
    setRejection(await commit(field.path, value));
  };
  if (!isEditableField(field)) {
    return <ReadOnlyField field={field} />;
  }
  if (field.kind === "boolean") {
    return <BooleanField field={field} rejection={rejection} onCommit={onCommit} />;
  }
  if (field.kind === "enum") {
    return <EnumField field={field} rejection={rejection} onCommit={onCommit} />;
  }
  if (field.kind === "number") {
    return <NumberField field={field} rejection={rejection} onCommit={onCommit} />;
  }
  return <StringField field={field} rejection={rejection} onCommit={onCommit} />;
}
