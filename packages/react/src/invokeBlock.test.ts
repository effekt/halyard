import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { invokeBlock } from "./invokeBlock";

const node = { id: "n1", block: "Hero", props: {} };

describe("invokeBlock", () => {
  test("stamps data-nubbin-node on the block's root element", async () => {
    const Hero = (props: Record<string, unknown>) =>
      createElement("section", null, String(props.title));
    const element = await invokeBlock(Hero, { title: "T" }, node);
    expect(renderToStaticMarkup(element)).toBe('<section data-nubbin-node="n1">T</section>');
  });

  test("awaits an async server component before stamping", async () => {
    const Hero = async () => createElement("section", null, "async");
    const element = await invokeBlock(Hero, {}, node);
    expect(renderToStaticMarkup(element)).toContain('data-nubbin-node="n1"');
  });

  test("introduces no wrapper — the block's own root is what carries the attribute", async () => {
    const Hero = () => createElement("section", { className: "given-by-the-consumer" }, "body");
    const element = await invokeBlock(Hero, {}, node);
    expect(renderToStaticMarkup(element)).toBe(
      '<section class="given-by-the-consumer" data-nubbin-node="n1">body</section>',
    );
  });

  test("rejects a Fragment root, naming the block — there is nothing to stamp", async () => {
    const Bad = () => createElement(Fragment, null, createElement("h1"), createElement("p"));
    await expect(invokeBlock(Bad, {}, node)).rejects.toThrow(/Hero/);
  });

  test("rejects a composite root — a cloned prop is dropped, and the stamp with it", async () => {
    const Card = ({ children }: { children?: ReactNode }) =>
      createElement("article", null, children);
    const Bad = () => createElement(Card, null, "body");
    await expect(invokeBlock(Bad, {}, node)).rejects.toThrow(/Hero/);
  });

  test("rejects a non-element return for the same reason", async () => {
    const Bad = () => "just text";
    await expect(invokeBlock(Bad, {}, node)).rejects.toThrow(/Hero/);
  });

  test("lets a block's own failure through — invoking is where a client block fails", async () => {
    const ClientCard = () => {
      throw new Error("Attempted to call ClientCard() from the server");
    };
    await expect(invokeBlock(ClientCard, {}, node)).rejects.toThrow(/from the server/);
  });
});
