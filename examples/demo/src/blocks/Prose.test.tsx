import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Prose } from "./Prose";
import { proseDefaults } from "./proseDefaults";

describe("Prose", () => {
  test("renders a link inside a sentence rather than splitting the sentence", () => {
    const { container } = render(<Prose {...proseDefaults} />);
    const link = screen.getByRole("link", { name: "security page" });

    expect(link.getAttribute("href")).toBe("/security");
    expect(link.closest("p")?.textContent).toContain("written up on our security page.");
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  test("renders each mark as its own semantic element, and only those", () => {
    render(
      <Prose
        heading="Marks"
        tone="light"
        body={[
          {
            kind: "paragraph",
            spans: [
              { text: "loud", marks: ["strong"] },
              { text: "quiet", marks: ["em"] },
              { text: "typed", marks: ["code"] },
              { text: "both", marks: ["strong", "em"] },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("loud").tagName).toBe("STRONG");
    expect(screen.getByText("quiet").tagName).toBe("EM");
    expect(screen.getByText("typed").tagName).toBe("CODE");
    const both = screen.getByText("both");
    expect(both.tagName).toBe("STRONG");
    expect(both.closest("em")).not.toBeNull();
  });

  test("renders nothing an author typed as markup — the text is text", () => {
    render(
      <Prose
        heading="Inert"
        tone="light"
        body={[{ kind: "paragraph", spans: [{ text: "<script>alert(1)</script>" }] }]}
      />,
    );

    expect(screen.getByText("<script>alert(1)</script>").tagName).toBe("P");
    expect(document.querySelector("script")).toBeNull();
  });

  test("groups consecutive list items into one list", () => {
    const { container } = render(
      <Prose
        heading="List"
        tone="light"
        body={[
          { kind: "paragraph", spans: [{ text: "Before." }] },
          { kind: "listItem", spans: [{ text: "One" }] },
          { kind: "listItem", spans: [{ text: "Two" }] },
          { kind: "paragraph", spans: [{ text: "After." }] },
        ]}
      />,
    );

    expect(container.querySelectorAll("ul")).toHaveLength(1);
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });
});
