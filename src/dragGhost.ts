import type { DragEvent as ReactDragEvent } from "react";
import { isCardDeletable } from "./reorder";
import styles from "./dragGhost.module.css";

export type DragGhostSession = {
  ghost: HTMLElement;
  offsetX: number;
  offsetY: number;
  container: Element | null;
  outside: boolean;
};

type CreateOptions = {
  /** Clone the source node itself (default: first element child, else source). */
  clone?: "self" | "child";
  container?: Element | null;
};

/**
 * Inline + !important so card CSS (e.g. position: relative) cannot override
 * viewport positioning of the drag preview.
 */
function applyGhostViewportStyles(ghost: HTMLElement) {
  ghost.style.setProperty("position", "fixed", "important");
  ghost.style.setProperty("z-index", "9", "important");
  ghost.style.pointerEvents = "none";
  ghost.style.margin = "0";
}

export function hideNativeDragImage(
  event: DragEvent | ReactDragEvent<Element>,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  canvas.style.position = "fixed";
  canvas.style.left = "-100px";
  canvas.style.top = "-100px";
  document.body.appendChild(canvas);
  event.dataTransfer?.setDragImage(canvas, 0, 0);
  requestAnimationFrame(() => canvas.remove());
}

export function createDragGhost(
  source: HTMLElement,
  clientX: number,
  clientY: number,
  options: CreateOptions = {},
): DragGhostSession {
  const visual =
    options.clone === "self"
      ? source
      : ((source.firstElementChild as HTMLElement | null) ?? source);
  const rect = visual.getBoundingClientRect();
  const ghost = visual.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("data-sortable-id");
  ghost.removeAttribute("data-theme-id");
  ghost.setAttribute("aria-hidden", "true");
  ghost.tabIndex = -1;
  if (ghost instanceof HTMLButtonElement) ghost.disabled = true;
  ghost.classList.add(styles.ghost);
  applyGhostViewportStyles(ghost);
  ghost.style.width = `${rect.width}px`;
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  document.body.appendChild(ghost);
  return {
    ghost,
    offsetX: clientX - rect.left,
    offsetY: clientY - rect.top,
    container: options.container ?? null,
    outside: false,
  };
}

export function moveDragGhost(
  session: DragGhostSession,
  clientX: number,
  clientY: number,
) {
  session.ghost.style.left = `${clientX - session.offsetX}px`;
  session.ghost.style.top = `${clientY - session.offsetY}px`;
  if (session.container) {
    session.outside = isCardDeletable(
      session.ghost.getBoundingClientRect(),
      session.container.getBoundingClientRect(),
    );
  }
  session.ghost.classList.toggle(styles.ghostDeletable, session.outside);
}

export function removeDragGhost(session: DragGhostSession | null) {
  session?.ghost.remove();
}
