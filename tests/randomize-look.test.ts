import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FONT_OPTIONS, cardRadiiFromPanel } from "../src/appearance.ts";
import {
  SURFACE_TOKENS,
  TEXT_TOKENS,
  contrastRatio,
  randomizeLook,
} from "../src/randomizeLook.ts";

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("randomizeLook", () => {
  it("keeps card radius at 0.6 of panel radius, rounded up, and strokes in 0-20", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const look = randomizeLook(mulberry32(seed));
      assert.equal(
        look.appearance.cardRadius,
        cardRadiiFromPanel(look.appearance.panelRadius),
      );
      assert.ok(look.appearance.panelRadius >= 0);
      assert.ok(look.appearance.panelRadius <= 50);
      assert.ok(look.appearance.panelBorder >= 0);
      assert.ok(look.appearance.panelBorder <= 20);
      assert.ok(look.appearance.cardBorder >= 0);
      assert.ok(look.appearance.cardBorder <= 20);
      for (const weight of Object.values(look.strokeWeights)) {
        const px = Number.parseFloat(weight);
        assert.ok(px >= 0);
        assert.ok(px <= 20);
      }
    }
  });

  it("keeps 3:1 contrast between text and panel/container surfaces", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const look = randomizeLook(mulberry32(seed));
      for (const textToken of TEXT_TOKENS) {
        for (const surfaceToken of SURFACE_TOKENS) {
          const ratio = contrastRatio(
            look.colors[textToken],
            look.colors[surfaceToken],
          );
          assert.ok(
            ratio >= 3,
            `seed ${seed} ${textToken} vs ${surfaceToken}: ${ratio}`,
          );
        }
      }
    }
  });

  it("does not include margin tokens in colors and picks existing fonts", () => {
    const names = new Set(FONT_OPTIONS.map((font) => font.name));
    for (let seed = 1; seed <= 40; seed += 1) {
      const look = randomizeLook(mulberry32(seed));
      const keys = Object.keys(look.colors).join(" ");
      assert.equal(keys.includes("margin"), false);
      assert.ok(names.has(look.appearance.headerFont));
      assert.ok(names.has(look.appearance.bodyFont));
    }
  });
});
