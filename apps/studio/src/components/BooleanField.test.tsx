import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BooleanField } from "./BooleanField";

const field = { path: "featured", kind: "boolean", optional: false, value: false } as const;

async function noop() {}

describe("BooleanField", () => {
  test("keeps focus when the committed value comes back from the server", () => {
    const { rerender } = render(
      <BooleanField field={field} rejection={undefined} onCommit={noop} />,
    );
    const box = screen.getByRole("checkbox");
    box.focus();
    fireEvent.click(box);
    rerender(
      <BooleanField field={{ ...field, value: true }} rejection={undefined} onCommit={noop} />,
    );
    expect(document.activeElement).toBe(screen.getByRole("checkbox"));
  });

  test("shows the value it was given", () => {
    render(
      <BooleanField field={{ ...field, value: true }} rejection={undefined} onCommit={noop} />,
    );
    expect(screen.getByRole<HTMLInputElement>("checkbox").checked).toBe(true);
  });
});
