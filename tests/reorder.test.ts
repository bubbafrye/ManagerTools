import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCardDeletable, moveBetween, moveById } from "../src/reorder.ts";

describe("moveById", () => {
  const list = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("moves an item before another", () => {
    assert.deepEqual(
      moveById(list, "c", "a").map((item) => item.id),
      ["c", "a", "b"],
    );
  });

  it("appends when beforeId is null", () => {
    assert.deepEqual(
      moveById(list, "a", null).map((item) => item.id),
      ["b", "c", "a"],
    );
  });

  it("is a no-op when dropped on itself", () => {
    assert.equal(moveById(list, "b", "b"), list);
  });
});

describe("moveBetween", () => {
  it("moves an item to another list before a target", () => {
    const from = [{ id: "a" }, { id: "b" }];
    const to = [{ id: "c" }];
    const next = moveBetween(from, to, "a", "c");
    assert.deepEqual(
      next.from.map((item) => item.id),
      ["b"],
    );
    assert.deepEqual(
      next.to.map((item) => item.id),
      ["a", "c"],
    );
  });

  it("appends to an empty list", () => {
    const next = moveBetween([{ id: "a" }], [], "a", null);
    assert.deepEqual(
      next.from.map((item) => item.id),
      [],
    );
    assert.deepEqual(
      next.to.map((item) => item.id),
      ["a"],
    );
  });
});

describe("isCardDeletable", () => {
  const frame = { left: 0, top: 0, width: 100, height: 100 };

  it("stays false when less than 30% of the card is outside", () => {
    assert.equal(
      isCardDeletable({ left: -20, top: 0, width: 100, height: 100 }, frame),
      false,
    );
  });

  it("is true when at least 30% of the card is outside", () => {
    assert.equal(
      isCardDeletable({ left: -30, top: 0, width: 100, height: 100 }, frame),
      true,
    );
  });
});
