import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { EnumField } from "./EnumField";

const field = {
  path: "tone",
  kind: "enum",
  optional: false,
  members: ["light", "dark"],
  value: "light",
} as const;

async function noop() {}

describe("EnumField", () => {
  test("keeps focus when the committed value comes back from the server", () => {
    const { rerender } = render(<EnumField field={field} rejection={undefined} onCommit={noop} />);
    const select = screen.getByRole("combobox");
    select.focus();
    fireEvent.change(select, { target: { value: "dark" } });
    rerender(
      <EnumField field={{ ...field, value: "dark" }} rejection={undefined} onCommit={noop} />,
    );
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });

  test("shows the value it was given", () => {
    render(<EnumField field={{ ...field, value: "dark" }} rejection={undefined} onCommit={noop} />);
    expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe("dark");
  });
});
