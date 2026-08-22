import { useState, type DragEvent, type ReactNode } from "react";
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
              }`}
              draggable
              data-sortable-id={item.id}
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
