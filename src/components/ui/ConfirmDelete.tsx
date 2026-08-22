import { useEffect, useId, useRef, useState } from "react";
import {
  ButtonGroup,
  buttonGroupVariantForText,
  headerTextHex,
} from "./ButtonGroup";
import styles from "./ConfirmDelete.module.css";

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
      data-confirm-kind={kind}
      aria-labelledby={titleId}
      style={{
        background: "var(--containers-panel-surface)",
        borderColor: "var(--containers-panel-stroke-color)",
      }}
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
