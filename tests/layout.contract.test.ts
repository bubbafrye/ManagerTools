import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("layout CSS contract", () => {
  it("maps page gutters to --document-margins-* tokens, not magic numbers", () => {
    const css = readFileSync(
      join(root, "src/pages/OneOnOnePage.module.css"),
      "utf8",
    );

    assert.match(css, /padding-top:\s*var\(--document-margins-top\)/);
    assert.match(css, /padding-right:\s*var\(--document-margins-sides\)/);
    assert.match(css, /padding-bottom:\s*var\(--document-margins-bottom\)/);
    assert.match(css, /padding-left:\s*var\(--document-margins-sides\)/);
    assert.doesNotMatch(css, /padding:\s*20px/);
  });

  it("uses a flex 1:1 section with a 480px left side at wide breakpoints", () => {
    const css = readFileSync(
      join(root, "src/pages/OneOnOnePage.module.css"),
      "utf8",
    );

    assert.match(css, /\.oneOnOne[\s\S]*display:\s*flex/);
    assert.match(css, /\.leftSide[\s\S]*width:\s*480px/);
    assert.match(css, /\.agendaSide[\s\S]*flex:\s*1 1 0/);
    assert.match(css, /\.agendaSide[\s\S]*min-width:\s*0/);
    assert.match(
      css,
      /@media \(max-width:\s*1159px\) and \(min-width:\s*960px\)[\s\S]*width:\s*320px/,
    );
    assert.match(
      css,
      /@media \(max-width:\s*959px\)[\s\S]*flex-direction:\s*column/,
    );
    assert.match(
      css,
      /@media \(max-width:\s*959px\)[\s\S]*\.agendaSide[\s\S]*order:\s*-1/,
    );
  });

  it("splits IC and Manager agenda panels 50/50 inside leftover width", () => {
    const entryCss = readFileSync(
      join(root, "src/components/AgendaEntry.module.css"),
      "utf8",
    );
    const panelCss = readFileSync(
      join(root, "src/components/AgendaPanel.module.css"),
      "utf8",
    );

    assert.match(entryCss, /\.sides[\s\S]*display:\s*flex/);
    assert.match(panelCss, /\.panel[\s\S]*flex:\s*1/);
    assert.match(panelCss, /\.panel[\s\S]*min-width:\s*0/);
  });

  it("maps Notes to card2 and IC/Manager agenda panels to card1 (Figma)", () => {
    const notesCss = readFileSync(
      join(root, "src/components/Notes.module.css"),
      "utf8",
    );
    const panelCss = readFileSync(
      join(root, "src/components/AgendaPanel.module.css"),
      "utf8",
    );

    assert.match(notesCss, /background:\s*var\(--containers-card2-surface-color\)/);
    assert.match(
      notesCss,
      /border:[\s\S]*var\(--containers-card2-stroke-color\)/,
    );
    assert.match(
      panelCss,
      /background:\s*var\(--containers-card1-surface-color\)/,
    );
    assert.match(
      panelCss,
      /border:[\s\S]*var\(--containers-card1-stroke-color\)/,
    );
    assert.doesNotMatch(
      panelCss,
      /--containers-card2-surface-color|--containers-card2-stroke-color/,
    );
  });

  it("loads tokens and base document styles without stripping resets", () => {
    const global = readFileSync(join(root, "src/styles/global.css"), "utf8");
    assert.match(global, /@import\s+["']\.\/tokens\.css["']/);
    assert.match(global, /font-family:\s*var\(--document-text-body-font-face\)/);
    assert.match(global, /background:\s*var\(--document-body-color\)/);
    assert.doesNotMatch(global, /linear-gradient/);
  });

  it("defines the gutter tokens used by the page", () => {
    const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
    assert.match(tokens, /--document-margins-top:/);
    assert.match(tokens, /--document-margins-sides:\s*50px/);
    assert.match(tokens, /--document-margins-bottom:/);
    assert.match(tokens, /--document-body-color:\s*#d1e7d0/);
    assert.match(tokens, /--document-text-size-offset:\s*0\.75/);
    assert.match(tokens, /--document-text-header-font-size-base:\s*30px/);
    assert.match(tokens, /--document-text-subheader-font-size-base:\s*18px/);
    assert.match(tokens, /--document-text-body-font-size-base:\s*16px/);
    assert.match(tokens, /--document-text-label-font-size-base:\s*14px/);
    assert.match(tokens, /--document-body-text-color:\s*#224521/);
    assert.doesNotMatch(tokens, /--document-text-color:/);
    assert.doesNotMatch(tokens, /--document-margins-sides:\s*150px/);
    assert.match(tokens, /--containers-panel-surface:/);
    assert.match(tokens, /--containers-card1-surface-color:/);
    assert.match(tokens, /--containers-card2-surface-color:/);
    assert.match(tokens, /--framework-hue-1:\s*#cc9905/);
    assert.match(tokens, /--framework-hue-6:\s*#ba28ad/);
    assert.match(tokens, /--framework-stop1:\s*#ffffffb2/);
    assert.match(tokens, /--framework-base-dark:\s*#5b6300/);
    assert.match(tokens, /--framework-base-light:\s*#96a400/);
    assert.doesNotMatch(tokens, /--actions-actions-/);
    assert.doesNotMatch(tokens, /--container-container-/);
    assert.doesNotMatch(tokens, /--document-panel-/);
  });

  it("uses Figma framework breakpoint padding and skill columns", () => {
    const page = readFileSync(
      join(root, "src/pages/OneOnOnePage.module.css"),
      "utf8",
    );
    const growth = readFileSync(
      join(root, "src/components/GrowthFramework.module.css"),
      "utf8",
    );

    assert.match(page, /@media \(max-width:\s*1279px\) and \(min-width:\s*1160px\)/);
    assert.match(page, /--document-margins-sides:\s*25px/);
    assert.match(page, /--document-margins-sides:\s*15px/);
    assert.match(page, /--document-margins-sides:\s*10px/);
    assert.match(growth, /@media \(min-width:\s*1160px\)/);
    assert.match(growth, /@media \(min-width:\s*1280px\)/);
    assert.match(growth, /grid-template-columns:\s*1fr 1fr 1fr/);
  });
});
