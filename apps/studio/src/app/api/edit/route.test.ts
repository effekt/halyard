import { afterEach, expect, test } from "vitest";
import { editedDrafts } from "../../../nubbin/editedDrafts";
import { POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://studio.test/api/edit", { method: "POST", body: JSON.stringify(body) }),
  );
}

afterEach(() => {
  editedDrafts.clear();
});

test("a valid edit answers 200 with the new hash", async () => {
  const response = await post({ route: "/about", nodeId: "hero", path: "headline", value: "New" });
  expect(response.status).toBe(200);
  const payload = (await response.json()) as { hash: string };
  expect(payload.hash).toMatch(/^[0-9a-f]+$/);
});

test("an unknown node is the client's fault, not the server's", async () => {
  const response = await post({ route: "/about", nodeId: "nope", path: "headline", value: "x" });
  expect(response.status).toBe(400);
  expect(await response.text()).toBe('no node "nope" in the draft for /about');
});

test("an unknown route answers 400", async () => {
  const response = await post({ route: "/nope", nodeId: "hero", path: "headline", value: "x" });
  expect(response.status).toBe(400);
  expect(await response.text()).toBe("no draft for /nope");
});

test("a route naming an Object.prototype member answers 400, not 500", async () => {
  const response = await post({
    route: "constructor",
    nodeId: "hero",
    path: "headline",
    value: "x",
  });
  expect(response.status).toBe(400);
  expect(await response.text()).toBe("no draft for constructor");
});

test.each(["", "cta..label", "paragraphs[].0"])(
  "the unaddressable path %j is a malformed edit",
  async (path) => {
    const response = await post({ route: "/about", nodeId: "hero", path, value: "x" });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("malformed edit");
  },
);

test("a value the compiler rejects answers 422 with the compiler's words", async () => {
  const response = await post({ route: "/about", nodeId: "hero", path: "headline", value: 42 });
  expect(response.status).toBe(422);
  expect(await response.text()).toContain("invalid-props");
});
