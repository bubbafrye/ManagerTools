import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import {
  ButtonGroup,
  buttonGroupVariantForText,
  headerTextHex,
} from "./ButtonGroup";
import { Modal } from "./Modal";
import styles from "./ConfirmDelete.module.css";

type ConfirmChromeProps = {
  kind: string;
  message: string;
  onDismiss: () => void;
  focusRef: Ref<HTMLButtonElement>;
  children: ReactNode;
};

function ConfirmChrome({
  kind,
  message,
  onDismiss,
  focusRef,
  children,
}: ConfirmChromeProps) {
  const titleId = useId();

  useEffect(() => {
    if (focusRef && typeof focusRef !== "function") {
      focusRef.current?.focus();
    }
  }, [focusRef]);

  return (
    <Modal
      className={styles.dialog}
      data-confirm-kind={kind}
      aria-labelledby={titleId}
      style={{
        background: "var(--containers-panel-surface)",
        borderColor: "var(--containers-panel-stroke-color)",
      }}
      onClose={onDismiss}
    >
      <div className={styles.prompt}>
        <p className={styles.message} id={titleId}>
          {message}
        </p>
      </div>
      {children}
    </Modal>
  );
}

type ConfirmDeleteProps = {
  kind: string;
  onYes: () => void;
  onNo: () => void;
};

export function ConfirmDelete({ kind, onYes, onNo }: ConfirmDeleteProps) {
  const noRef = useRef<HTMLButtonElement>(null);
  const [variant] = useState(() => buttonGroupVariantForText(headerTextHex()));

  return (
    <ConfirmChrome
      kind={kind}
      message="Are you sure you want to permanently remove this item?"
      onDismiss={onNo}
      focusRef={noRef}
    >
      <ButtonGroup variant={variant} noRef={noRef} onYes={onYes} onNo={onNo} />
    </ConfirmChrome>
  );
}

type FeedbackDialogProps = {
  kind: string;
  message: string;
  onOk: () => void;
};

export function FeedbackDialog({ kind, message, onOk }: FeedbackDialogProps) {
  const okRef = useRef<HTMLButtonElement>(null);
  const [variant] = useState(() => buttonGroupVariantForText(headerTextHex()));

  return (
    <ConfirmChrome kind={kind} message={message} onDismiss={onOk} focusRef={okRef}>
      <ButtonGroup variant={variant} okRef={okRef} onOk={onOk} />
    </ConfirmChrome>
  );
}
