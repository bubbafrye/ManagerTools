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

  it("keeps the left column at 480px and lets the agenda column flex", () => {
    const css = readFileSync(
      join(root, "src/pages/OneOnOnePage.module.css"),
      "utf8",
    );

    assert.match(
      css,
      /grid-template-columns:\s*480px minmax\(0,\s*1fr\)/,
    );
    assert.match(css, /\.chrome[\s\S]*grid-column:\s*1 \/ -1/);
    assert.match(css, /\.rightColumn[\s\S]*min-width:\s*0/);
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
    assert.match(tokens, /--document-body-color:\s*#808080/);
    assert.doesNotMatch(tokens, /--document-margins-sides:\s*150px/);
  });
});
