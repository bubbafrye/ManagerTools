export const MAX_LIST_DEPTH = 3;

export type ListBlock = {
  type: "p" | "li";
  text: string;
  depth: number;
};

const BULLET = /^((?:  )*)- (.*)$/;

function cleanText(value: string): string {
  return value.replace(/\u200B/g, "").replace(/\n+$/g, "");
}

export function isBlankListValue(
  value: string,
  options?: { alwaysList?: boolean },
): boolean {
  const blocks = parseListText(value, options);
  return blocks.length === 1 && blocks[0].text.trim() === "";
}

export function parseListText(
  value: string,
  options?: { alwaysList?: boolean },
): ListBlock[] {
  if (value === "") {
    return options?.alwaysList
      ? [{ type: "li", text: "", depth: 0 }]
      : [{ type: "p", text: "", depth: 0 }];
  }
  return value.split("\n").map((line) => {
    const match = line.match(BULLET);
    if (!match) return { type: "p", text: line, depth: 0 };
    return {
      type: "li",
      text: match[2],
      depth: Math.min(match[1].length / 2, MAX_LIST_DEPTH),
    };
  });
}

export function serializeListText(
  blocks: ListBlock[],
  options?: { alwaysList?: boolean },
): string {
  if (blocks.length === 1 && blocks[0].text === "") {
    if (blocks[0].type === "p") return "";
    if (
      options?.alwaysList &&
      blocks[0].type === "li" &&
      blocks[0].depth === 0
    ) {
      return "";
    }
  }
  return blocks
    .map((block) =>
      block.type === "li"
        ? `${"  ".repeat(block.depth)}- ${block.text}`
        : block.text,
    )
    .join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function blocksToHtml(blocks: ListBlock[]): string {
  if (blocks.length === 1 && blocks[0].type === "p" && blocks[0].text === "") {
    return "";
  }
  let html = "";
  let openList = false;
  for (const block of blocks) {
    if (block.type === "li") {
      if (!openList) {
        html += "<ul>";
        openList = true;
      }
      const body = block.text === "" ? "<br>" : escapeHtml(block.text);
      html += `<li data-depth="${block.depth}">${body}</li>`;
    } else {
      if (openList) {
        html += "</ul>";
        openList = false;
      }
      html += `<div>${block.text === "" ? "<br>" : escapeHtml(block.text)}</div>`;
    }
  }
  if (openList) html += "</ul>";
  return html;
}

function elementText(el: HTMLElement): string {
  return cleanText(el.innerText || "");
}

export function htmlRootToBlocks(root: HTMLElement): ListBlock[] {
  const blocks: ListBlock[] = [];
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = cleanText(node.textContent ?? "");
      if (text) blocks.push({ type: "p", text, depth: 0 });
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    if (node.tagName === "BR") {
      blocks.push({ type: "p", text: "", depth: 0 });
      continue;
    }
    if (node.tagName === "UL") {
      for (const item of node.querySelectorAll(":scope > li")) {
        if (!(item instanceof HTMLElement)) continue;
        const depth = Math.min(
          Number(item.getAttribute("data-depth") || "0") || 0,
          MAX_LIST_DEPTH,
        );
        blocks.push({ type: "li", text: elementText(item), depth });
      }
      continue;
    }
    if (node.tagName === "DIV" || node.tagName === "P") {
      blocks.push({ type: "p", text: elementText(node), depth: 0 });
    }
  }
  return blocks.length > 0 ? blocks : [{ type: "p", text: "", depth: 0 }];
}

export function serializeRoot(
  root: HTMLElement,
  options?: { alwaysList?: boolean },
): string {
  return serializeListText(htmlRootToBlocks(root), options);
}
