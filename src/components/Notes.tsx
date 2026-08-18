import { useRef } from "react";
import { DateField } from "./ui/DateField";
import { ListField } from "./ui/ListField";
import styles from "./Notes.module.css";

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
      <ListField
        ref={notesTextRef}
        value={notesText}
        onChange={onTextChange}
        placeholder="Meeting notes"
        ariaLabel="Meeting notes"
        layoutId="notes-text"
      />
    </div>
  );
}
