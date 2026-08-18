import { useCallback, useEffect, useRef } from "react";
import styles from "./EditableText.module.css";

type EditableTextProps = {
  value: string;
  onChange: (value: string) => void;
  variant?: "body" | "header" | "subheader" | "date" | "bulletList" | "inline";
  placeholder?: string;
  multiline?: boolean;
  ariaLabel?: string;
  autoFocus?: boolean;
  onEnter?: (committed: string) => void;
  muted?: boolean;
  editable?: boolean;
};

export function EditableText({
  value,
  onChange,
  variant = "body",
  placeholder,
  multiline = true,
  ariaLabel,
  autoFocus = false,
  onEnter,
  muted = false,
  editable = true,
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  const variantClass =
    variant === "header"
      ? styles.editableHeader
      : variant === "subheader"
        ? styles.editableSubheader
        : variant === "date"
          ? styles.editableDate
          : variant === "bulletList"
            ? styles.editableBulletList
            : variant === "inline"
              ? styles.editableInline
              : "";

  const syncFromDom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    let next = el.innerText.replace(/\u200B/g, "");
    if (!multiline) next = next.replace(/\n/g, "");
    if (next !== value) onChange(next);
  }, [multiline, onChange, value]);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.innerText.replace(/\u200B/g, "") !== value) {
      el.innerText = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (!autoFocus) return;
    ref.current?.focus();
  }, [autoFocus]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline={multiline}
      contentEditable={editable}
      aria-readonly={editable ? undefined : true}
      suppressContentEditableWarning
      className={`${styles.editable} ${variantClass} ${styles.placeholder}${muted ? ` ${styles.muted}` : ""}`}
      data-placeholder={placeholder}
      onInput={editable ? syncFromDom : undefined}
      onBlur={editable ? syncFromDom : undefined}
      onKeyDown={
        editable
          ? (event) => {
        if (event.key !== "Enter") return;
        if (onEnter && !event.shiftKey) {
          event.preventDefault();
          syncFromDom();
          const el = ref.current;
          let committed = (el?.innerText ?? "").replace(/\u200B/g, "");
          if (!multiline) committed = committed.replace(/\n/g, "");
          onEnter(committed);
          return;
        }
        if (!multiline) event.preventDefault();
      }
          : undefined
      }
    />
  );
}
