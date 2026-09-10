import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageHash, pageUrl, parseHash } from "../src/sync/route.ts";

describe("parseHash", () => {
  it("treats empty and root hashes as the local room", () => {
    assert.deepEqual(parseHash(""), { kind: "local" });
    assert.deepEqual(parseHash("#"), { kind: "local" });
    assert.deepEqual(parseHash("#/"), { kind: "local" });
  });

  it("reads a page id from #/p/:pageId", () => {
    assert.deepEqual(parseHash("#/p/abc-123"), {
      kind: "page",
      pageId: "abc-123",
    });
  });
});

describe("page links", () => {
  it("builds a hash and absolute URL", () => {
    assert.equal(pageHash("room-1"), "#/p/room-1");
    assert.equal(
      pageUrl("room-1", {
        origin: "http://localhost:5173",
        pathname: "/",
        search: "",
      } as Location),
      "http://localhost:5173/#/p/room-1",
    );
  });
});
