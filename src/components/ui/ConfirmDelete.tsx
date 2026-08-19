import { useEffect, useId, useRef, useState } from "react";
import {
  ButtonGroup,
  buttonGroupVariantForText,
  headerTextHex,
} from "./ButtonGroup";
import styles from "./ConfirmDelete.module.css";

const CONTAINER_LOOK: Record<string, { surface: string; stroke: string }> = {
  "action-item": {
    surface: "var(--actions-actions-container-surface)",
    stroke: "var(--actions-actions-container-stroke)",
  },
  goal: {
    surface: "var(--goals-goals-container-surface)",
    stroke: "var(--goals-goals-containter-stroke)",
  },
  agenda: {
    surface: "var(--agenda-agenda-container-surface)",
    stroke: "var(--agenda-agenda-container-stroke)",
  },
};

type ConfirmDeleteProps = {
  kind: string;
  onYes: () => void;
  onNo: () => void;
};

export function ConfirmDelete({ kind, onYes, onNo }: ConfirmDeleteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const onNoRef = useRef(onNo);
  const titleId = useId();
  const look = CONTAINER_LOOK[kind] ?? CONTAINER_LOOK["action-item"];
  const [variant] = useState(() => buttonGroupVariantForText(headerTextHex()));

  onNoRef.current = onNo;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (!node.open) node.showModal();
    noRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onNoRef.current();
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      onNoRef.current();
    };

    window.addEventListener("keydown", onKeyDown, true);
    node.addEventListener("cancel", onCancel);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      node.removeEventListener("cancel", onCancel);
      if (node.open) node.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      style={{ background: look.surface, borderColor: look.stroke }}
    >
      <div className={styles.prompt}>
        <p className={styles.message} id={titleId}>
          Are you sure you want to permanently remove this item?
        </p>
      </div>
      <ButtonGroup
        variant={variant}
        noRef={noRef}
        onYes={onYes}
        onNo={onNo}
      />
    </dialog>
  );
}
