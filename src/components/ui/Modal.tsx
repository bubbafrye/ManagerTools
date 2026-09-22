import {
  useEffect,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
  className?: string;
} & Omit<DialogHTMLAttributes<HTMLDialogElement>, "className">;

export function Modal({ onClose, children, className, ...props }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (!node.open) node.showModal();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onCloseRef.current();
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
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
      {...props}
      ref={dialogRef}
      className={className ? `${styles.modal} ${className}` : styles.modal}
    >
      {children}
    </dialog>
  );
}
