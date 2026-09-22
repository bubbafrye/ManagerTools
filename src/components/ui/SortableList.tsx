import {
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  createDragGhost,
  hideNativeDragImage,
  moveDragGhost,
  removeDragGhost,
  type DragGhostSession,
} from "../../dragGhost";
import { ConfirmDelete } from "./ConfirmDelete";
import styles from "./SortableList.module.css";

export type SortableMove = {
  fromList: string;
  toList: string;
  itemId: string;
  beforeId: string | null;
};

type Item = { id: string };

type SortableListProps<T extends Item> = {
  kind: string;
  listId: string;
  items: T[];
  onMove: (move: SortableMove) => void;
  onDelete: (itemId: string, listId: string) => void;
  renderItem: (item: T) => ReactNode;
};

type DragPayload = {
  kind: string;
  listId: string;
  itemId: string;
};

type ActiveDrag = DragPayload & {
  dropped: boolean;
  session: DragGhostSession;
};

type Over = { id: string; edge: "before" | "after" } | "list" | null;

const INTERACTIVE =
  'button, input, textarea, select, [contenteditable="true"], [role="textbox"], [role="checkbox"]';

let activeDrag: ActiveDrag | null = null;

function keepDropAlive(event: Event) {
  if (!activeDrag?.session.outside) return;
  event.preventDefault();
  const transfer = (event as { dataTransfer?: DataTransfer }).dataTransfer;
  if (transfer) transfer.dropEffect = "move";
}

function readPayload(event: DragEvent): DragPayload | null {
  const raw =
    event.dataTransfer.getData("text/plain") ||
    (activeDrag ? JSON.stringify(activeDrag) : "");
  if (!raw) return activeDrag;
  try {
    const data = JSON.parse(raw) as DragPayload;
    if (!data.kind || !data.listId || !data.itemId) return activeDrag;
    return data;
  } catch {
    return activeDrag;
  }
}

function dropBeforeId<T extends Item>(
  items: T[],
  itemId: string,
  edge: "before" | "after",
): string | null {
  if (edge === "before") return itemId;
  const index = items.findIndex((item) => item.id === itemId);
  return items[index + 1]?.id ?? null;
}

function measureItemTops(root: HTMLElement | null) {
  const tops = new Map<string, number>();
  if (!root) return tops;
  const origin = root.getBoundingClientRect().top;
  for (const el of root.querySelectorAll<HTMLElement>("[data-sortable-id]")) {
    const id = el.dataset.sortableId;
    if (id) tops.set(id, el.getBoundingClientRect().top - origin);
  }
  return tops;
}

function slideExistingDown(
  root: HTMLElement,
  fresh: ReadonlySet<string>,
  prevTops: Map<string, number>,
  nextTops: Map<string, number>,
) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const el of root.querySelectorAll<HTMLElement>("[data-sortable-id]")) {
    const id = el.dataset.sortableId;
    if (!id || fresh.has(id)) continue;
    const prevTop = prevTops.get(id);
    const nextTop = nextTops.get(id);
    if (prevTop == null || nextTop == null) continue;
    const dy = prevTop - nextTop;
    // Inserts push existing rows down. A positive invert means the
    // stored tops are stale (scroll/layout), which plays as jump-down + slide-up.
    if (dy >= 0) continue;
    el.classList.remove(styles.shift);
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    void el.offsetWidth;
    el.style.transition = "";
    el.classList.add(styles.shift);
    el.style.transform = "";
    const done = (event: TransitionEvent) => {
      if (event.target !== el || event.propertyName !== "transform") return;
      el.classList.remove(styles.shift);
      el.removeEventListener("transitionend", done);
    };
    el.addEventListener("transitionend", done);
  }
}

function useEnteringIds(
  items: readonly Item[],
  listRef: RefObject<HTMLElement | null>,
) {
  const seenRef = useRef<Set<string> | null>(null);
  const topsRef = useRef<Map<string, number>>(new Map());
  const [enteringIds, setEnteringIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useLayoutEffect(() => {
    const root = listRef.current;
    const nextTops = measureItemTops(root);
    if (seenRef.current === null) {
      seenRef.current = new Set(items.map((item) => item.id));
      topsRef.current = nextTops;
      return;
    }
    const seen = seenRef.current;
    const wasEmpty = seen.size === 0;
    const fresh = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      fresh.add(item.id);
    }
    // A batch of rows after an empty list is document hydrate, not a user add.
    if (fresh.size > 0 && !(wasEmpty && fresh.size > 1)) {
      setEnteringIds((prev) => {
        const next = new Set(prev);
        for (const id of fresh) next.add(id);
        return next;
      });
      if (root) slideExistingDown(root, fresh, topsRef.current, nextTops);
    }
    topsRef.current = nextTops;
  }, [items, listRef]);

  const clearEntering = (id: string) => {
    setEnteringIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return { enteringIds, clearEntering };
}

export function SortableList<T extends Item>({
  kind,
  listId,
  items,
  onMove,
  onDelete,
  renderItem,
}: SortableListProps<T>) {
  const [over, setOver] = useState<Over>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { enteringIds, clearEntering } = useEnteringIds(items, listRef);

  const allow = (event: DragEvent) => {
    if (activeDrag && activeDrag.kind !== kind) return false;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    return true;
  };

  const commit = (event: DragEvent, beforeId: string | null) => {
    event.preventDefault();
    const data = readPayload(event);
    if (!data || data.kind !== kind) return;
    onMove({
      fromList: data.listId,
      toList: listId,
      itemId: data.itemId,
      beforeId,
    });
    if (activeDrag) activeDrag.dropped = true;
    setOver(null);
  };

  return (
    <>
      <div
        ref={listRef}
        className={styles.list}
        data-sortable-list={listId}
        onDragOver={(event) => {
          if (!allow(event)) return;
          setOver("list");
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOver(null);
          }
        }}
        onDrop={(event) => commit(event, null)}
      >
        {items.map((item) => {
          const indicator =
            over && over !== "list" && over.id === item.id ? over.edge : null;
          return (
            <div
              key={item.id}
              className={`${styles.item}${
                indicator === "before" ? ` ${styles.dropBefore}` : ""
              }${indicator === "after" ? ` ${styles.dropAfter}` : ""}${
                pendingDelete === item.id ? ` ${styles.pendingRemove}` : ""
              }${enteringIds.has(item.id) ? ` ${styles.enter}` : ""}`}
              draggable
              data-sortable-id={item.id}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                clearEntering(item.id);
              }}
              onPointerDown={(event) => {
                const target = event.target as HTMLElement;
                event.currentTarget.draggable = !target.closest(INTERACTIVE);
              }}
              onDragStart={(event) => {
                if (!event.currentTarget.draggable) {
                  event.preventDefault();
                  return;
                }
                const payload: DragPayload = { kind, listId, itemId: item.id };
                const session = createDragGhost(
                  event.currentTarget,
                  event.clientX,
                  event.clientY,
                  {
                    clone: "child",
                    container: event.currentTarget.closest(
                      "[data-sortable-container]",
                    ),
                  },
                );
                activeDrag = {
                  ...payload,
                  dropped: false,
                  session,
                };
                event.dataTransfer.setData("text/plain", JSON.stringify(payload));
                event.dataTransfer.effectAllowed = "move";
                hideNativeDragImage(event);
                event.currentTarget.classList.add(styles.dragging);
                document.addEventListener("dragover", keepDropAlive);
              }}
              onDrag={(event) => {
                if (!activeDrag) return;
                if (event.clientX === 0 && event.clientY === 0) return;
                moveDragGhost(activeDrag.session, event.clientX, event.clientY);
              }}
              onDragEnd={(event) => {
                document.removeEventListener("dragover", keepDropAlive);
                event.currentTarget.classList.remove(styles.dragging);
                event.currentTarget.draggable = true;
                const drag = activeDrag;
                removeDragGhost(drag?.session ?? null);
                activeDrag = null;
                setOver(null);
                if (!drag || drag.dropped || drag.itemId !== item.id) return;
                if (drag.session.outside) setPendingDelete(drag.itemId);
              }}
              onDragOver={(event) => {
                if (!allow(event)) return;
                event.stopPropagation();
                const rect = event.currentTarget.getBoundingClientRect();
                const edge =
                  event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                setOver({ id: item.id, edge });
              }}
              onDrop={(event) => {
                event.stopPropagation();
                const rect = event.currentTarget.getBoundingClientRect();
                const edge =
                  event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                commit(event, dropBeforeId(items, item.id, edge));
              }}
            >
              {renderItem(item)}
            </div>
          );
        })}
      </div>
      {pendingDelete ? (
        <ConfirmDelete
          kind={kind}
          onYes={() => {
            onDelete(pendingDelete, listId);
            setPendingDelete(null);
          }}
          onNo={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  );
}
