import type { ReactNode } from "react";
import type { InspectorField } from "../nubbin/inspector.types";

interface FieldRowProps {
  field: InspectorField;
  rejection: string | undefined;
  /** The control's id, so the path label names it for assistive tech too. */
  htmlFor: string;
  children: ReactNode;
}

/** The shared shell of every control: the field's path as its label, the control itself, and
 * the compiler's rejection when the last commit failed. */
export function FieldRow({ field, rejection, htmlFor, children }: FieldRowProps) {
  return (
    <div className="mt-3">
      <label htmlFor={htmlFor} className="block">
        <code className="text-marine/70 text-xs">{field.path}</code>
        {children}
      </label>
      {rejection === undefined ? null : (
        <p role="alert" className="mt-1 text-orange-deep text-xs">
          {rejection}
        </p>
      )}
    </div>
  );
}
