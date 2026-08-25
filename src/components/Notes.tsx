import { useRef, type Ref } from "react";
import { DateField } from "./ui/DateField";
import { ListField } from "./ui/ListField";
import styles from "./Notes.module.css";

type NotesTextProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  layoutId?: string;
  fieldRef?: Ref<HTMLDivElement>;
};

export function NotesText({
  value,
  onChange,
  placeholder,
  ariaLabel,
  layoutId,
  fieldRef,
}: NotesTextProps) {
  return (
    <ListField
      ref={fieldRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      layoutId={layoutId}
    />
  );
}

type NotesProps = {
  notesDate: string;
  notesText: string;
  onDateChange: (value: string) => void;
  onTextChange: (value: string) => void;
};

export function Notes({
  notesDate,
  notesText,
  onDateChange,
  onTextChange,
}: NotesProps) {
  const notesTextRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.notes}>
      <DateField
        value={notesDate}
        onChange={onDateChange}
        variant="date"
        ariaLabel="Notes date"
        onEnter={() => notesTextRef.current?.focus()}
      />
      <NotesText
        fieldRef={notesTextRef}
        value={notesText}
        onChange={onTextChange}
        placeholder="Meeting notes"
        ariaLabel="Meeting notes"
        layoutId="notes-text"
      />
    </div>
  );
}
