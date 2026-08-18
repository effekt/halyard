import { render } from "@testing-library/react";
import { SectionStack } from "demo/src/blocks/SectionStack";
import { describe, expect, test, vi } from "vitest";
import { PreviewEditor } from "./PreviewEditor";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => undefined }) }));

describe("PreviewEditor", () => {
  test("leaves the rendered page its single main landmark", () => {
    const { container } = render(
      <PreviewEditor route="/" nodes={{}}>
        <SectionStack sections={<p>body</p>} />
      </PreviewEditor>,
    );
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  test("gives the canvas a ref'd wrapper, so selection still has something to listen on", () => {
    const { container } = render(
      <PreviewEditor route="/" nodes={{}}>
        <p data-nubbin-node="n1">body</p>
      </PreviewEditor>,
    );
    expect(container.querySelector("[data-nubbin-node]")).not.toBeNull();
  });
});
