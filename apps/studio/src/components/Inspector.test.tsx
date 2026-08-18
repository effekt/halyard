import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { InspectorNode } from "../nubbin/inspector.types";
import { Inspector } from "./Inspector";

function node(id: string, tone: string): InspectorNode {
  return {
    id,
    block: "StatBand",
    fields: [
      { path: "tone", kind: "enum", optional: false, members: ["light", "dark"], value: tone },
    ],
  };
}

const nodes = { a: node("a", "light"), b: node("b", "dark") };

async function commit() {
  return undefined;
}

describe("Inspector", () => {
  test("re-reads every control when the selected node changes", () => {
    const { rerender } = render(
      <Inspector nodes={nodes} selected={nodes.a} onSelect={() => {}} commit={commit} />,
    );
    expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe("light");
    rerender(<Inspector nodes={nodes} selected={nodes.b} onSelect={() => {}} commit={commit} />);
    expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe("dark");
  });
});
