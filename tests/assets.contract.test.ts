import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

const srcFiles = walk(join(root, "src"));

describe("public asset URL contract", () => {
  it("does not put relative or site-root /assets/ urls in CSS (masks resolve against the stylesheet)", () => {
    const cssFiles = srcFiles.filter((file) => extname(file) === ".css");
    assert.ok(cssFiles.length > 0);

    for (const file of cssFiles) {
      const css = readFileSync(file, "utf8");
      assert.doesNotMatch(
        css,
        /url\(\s*['"]?\.\//,
        `${file} uses a relative url(); CSS masks would 404 on GitHub Pages`,
      );
      assert.doesNotMatch(
        css,
        /url\(\s*['"]?\/assets\//,
        `${file} uses /assets/ which resolves off github.io, not /ManagerTools/`,
      );
    }
  });

  it("loads public files through publicUrl, not hardcoded /assets/ in TSX", () => {
    const tsxFiles = srcFiles.filter((file) => extname(file) === ".tsx");
    for (const file of tsxFiles) {
      const source = readFileSync(file, "utf8");
      assert.doesNotMatch(
        source,
        /src=["']\/assets\//,
        `${file} hardcodes /assets/ on an img src`,
      );
      assert.doesNotMatch(
        source,
        /url\(["']\/assets\//,
        `${file} hardcodes /assets/ in a CSS url()`,
      );
      assert.doesNotMatch(
        source,
        /url\(["']\.\//,
        `${file} uses a relative CSS url()`,
      );
    }
  });

  it("builds GitHub Pages assets from /ManagerTools/, not ./", () => {
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    assert.match(vite, /command === ["']build["']\s*\?\s*["']\/ManagerTools\/["']/);
    assert.doesNotMatch(vite, /base:\s*["']\.\/["']/);
  });
});
