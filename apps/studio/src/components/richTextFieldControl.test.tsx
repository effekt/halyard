import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FieldControl } from "./FieldControl";

const commit = async () => undefined;

const body = [{ kind: "paragraph", spans: [{ text: "linked", href: "/security" }] }];

/** The rich-text editor is a later phase. Until it exists the inspector has to degrade rather
 * than break: an `array` field with no single control renders read-only, showing the value. */
test("a rich-text field renders read-only rather than crashing the inspector", () => {
  render(
    <FieldControl
      field={{ path: "body", kind: "array", optional: false, value: body }}
      commit={commit}
    />,
  );

  expect(screen.getByText("array — read-only")).toBeTruthy();
  expect(screen.getByText(/linked/)).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
});

test("a span field inside the document has no single control either", () => {
  render(
    <FieldControl
      field={{ path: "body[].spans[].text", kind: "string", optional: false, value: undefined }}
      commit={commit}
    />,
  );

  expect(screen.getByText("string — read-only")).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
});
