import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import {
  MAX_LIST_DEPTH,
  blocksToHtml,
  isBlankListValue,
  parseListText,
  serializeRoot,
} from "./listTextModel";
import styles from "./ListField.module.css";

type ListFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  layoutId?: string;
  alwaysList?: boolean;
  ref?: Ref<HTMLDivElement>;
};

function closestBlock(node: Node, root: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  if (current === root) return root;
  if (current.nodeType === Node.TEXT_NODE) current = current.parentElement;
  while (current instanceof HTMLElement && current !== root) {
    if (
      current.tagName === "LI" ||
      current.tagName === "DIV" ||
      current.tagName === "P"
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return current === root ? root : null;
}

function isEmptyBlock(block: HTMLElement): boolean {
  return (block.innerText || "").replace(/\u200B/g, "").trim() === "";
}

function placeCaret(block: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function convertParagraphToItem(block: HTMLElement, root: HTMLElement) {
  const li = document.createElement("li");
  li.dataset.depth = "0";
  li.innerHTML = "<br>";
  if (block === root) {
    const ul = document.createElement("ul");
    ul.append(li);
    root.replaceChildren(ul);
    placeCaret(li);
    return;
  }
  const prev = block.previousElementSibling;
  if (prev?.tagName === "UL") {
    prev.append(li);
    block.remove();
  } else {
    const ul = document.createElement("ul");
    ul.append(li);
    block.replaceWith(ul);
  }
  placeCaret(li);
}

function previousItem(li: HTMLLIElement): HTMLLIElement | null {
  const prev = li.previousElementSibling;
  return prev instanceof HTMLLIElement ? prev : null;
}

function indentItem(li: HTMLLIElement) {
  const prev = previousItem(li);
  if (!prev) return;
  const current = Number(li.dataset.depth || "0");
  const maxDepth = Math.min(
    Number(prev.dataset.depth || "0") + 1,
    MAX_LIST_DEPTH,
  );
  const next = Math.min(current + 1, maxDepth);
  if (next !== current) li.dataset.depth = String(next);
}

function itemToParagraph(li: HTMLLIElement) {
  const ul = li.parentElement;
  if (!ul) return;
  const div = document.createElement("div");
  div.innerHTML = isEmptyBlock(li) ? "<br>" : li.innerHTML;
  const following: Element[] = [];
  let sibling = li.nextElementSibling;
  while (sibling) {
    const next = sibling.nextElementSibling;
    following.push(sibling);
    sibling = next;
  }
  li.remove();
  ul.after(div);
  if (following.length > 0) {
    const nextList = document.createElement("ul");
    following.forEach((item) => nextList.append(item));
    div.after(nextList);
  }
  if (ul.childElementCount === 0) ul.remove();
  placeCaret(div);
}

function outdentItem(li: HTMLLIElement) {
  const current = Number(li.dataset.depth || "0");
  if (current > 0) {
    li.dataset.depth = String(current - 1);
    return;
  }
  itemToParagraph(li);
}

function insertLineBreakAtCaret() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const br = document.createElement("br");
  const marker = document.createTextNode("\u200B");
  range.insertNode(marker);
  marker.parentNode?.insertBefore(br, marker);
  range.setStart(marker, 1);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertItemAfter(li: HTMLLIElement) {
  const next = document.createElement("li");
  next.dataset.depth = li.dataset.depth || "0";
  next.innerHTML = "<br>";
  li.after(next);
  placeCaret(next);
}

export function ListField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  layoutId,
  alwaysList = false,
  ref,
}: ListFieldProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const [focused, setFocused] = useState(false);
  const blank = isBlankListValue(value, { alwaysList });
  const showPlaceholder = Boolean(placeholder) && blank && !focused;
  const besideBullet =
    blank && parseListText(value, { alwaysList })[0]?.type === "li";

  const sync = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const next = serializeRoot(el, { alwaysList });
    if (next !== value) onChange(next);
  }, [alwaysList, onChange, value]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || document.activeElement === el) return;
    const html = blocksToHtml(parseListText(value, { alwaysList }));
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [alwaysList, value]);

  return (
    <div className={styles.wrap}>
      <div
        ref={setRefs}
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline
        contentEditable
        suppressContentEditableWarning
        data-layout={layoutId}
        className={styles.field}
        onInput={sync}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          sync();
        }}
        onKeyDown={(event) => {
          const el = innerRef.current;
          if (!el) return;

          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            insertLineBreakAtCaret();
            sync();
            return;
          }

          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const block = closestBlock(selection.anchorNode ?? el, el);
          if (!block) return;

          if (event.key === " " && block.tagName !== "LI") {
            const text = (block.innerText || "").replace(/\u200B/g, "").trim();
            if (text === "-") {
              event.preventDefault();
              convertParagraphToItem(block, el);
              sync();
            }
            return;
          }

          if (event.key === "Tab" && block.tagName === "LI") {
            event.preventDefault();
            if (event.shiftKey) outdentItem(block as HTMLLIElement);
            else indentItem(block as HTMLLIElement);
            sync();
            return;
          }

          if (event.key === "Enter" && !event.shiftKey && block.tagName === "LI") {
            event.preventDefault();
            if (isEmptyBlock(block)) itemToParagraph(block as HTMLLIElement);
            else insertItemAfter(block as HTMLLIElement);
            sync();
          }
        }}
      />
      {showPlaceholder ? (
        <span
          className={`${styles.hint} ${besideBullet ? styles.hintBesideBullet : ""}`}
          data-list-placeholder=""
          aria-hidden
        >
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}
