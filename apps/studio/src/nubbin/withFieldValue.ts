import type { FieldNode, UnknownProps } from "@nubbin/core";
import type { InspectorField } from "./inspector.types";
import { valueAtPath } from "./valueAtPath";

/** Pairs one described field with the value the draft currently holds at its path. */
export function withFieldValue(field: FieldNode, props: UnknownProps): InspectorField {
  return { ...field, value: valueAtPath(props, field.path) };
}
