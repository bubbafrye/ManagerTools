import { useRef } from "react";
import { fromIsoDate, toIsoDate } from "../../types/document";
import styles from "./DateField.module.css";

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  variant?: "date" | "due";
  placeholder?: string;
  onEnter?: () => void;
};

export function DateField({
  value,
  onChange,
  ariaLabel,
  variant = "due",
  placeholder = "mm-dd-yy",
  onEnter,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const iso = toIsoDate(value);
  const empty = value.trim() === "";

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <div
      className={`${styles.field} ${variant === "date" ? styles.date : styles.due}`}
    >
      <span
        className={`${styles.display} ${empty ? styles.placeholder : ""}`}
        aria-hidden
      >
        {empty ? placeholder : value}
      </span>
      <input
        ref={inputRef}
        type="date"
        className={styles.input}
        value={iso}
        aria-label={ariaLabel}
        onClick={openPicker}
        onChange={(event) => {
          onChange(event.target.value ? fromIsoDate(event.target.value) : "");
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !onEnter) return;
          event.preventDefault();
          onEnter();
        }}
      />
    </div>
  );
}
