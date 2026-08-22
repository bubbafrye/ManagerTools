import type { AgendaEntryData } from "../types/document";
import { AgendaEntry } from "./AgendaEntry";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SortableList } from "./ui/SortableList";
import styles from "./Agenda.module.css";

type AgendaProps = {
  entries: AgendaEntryData[];
  icName: string;
  managerName: string;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<AgendaEntryData>) => void;
  onReorder: (itemId: string, beforeId: string | null) => void;
  onDelete: (itemId: string) => void;
};

export function Agenda({
  entries,
  icName,
  managerName,
  onAdd,
  onUpdate,
  onReorder,
  onDelete,
}: AgendaProps) {
  return (
    <section className={styles.container} aria-label="Agenda">
      <div
        className={styles.panel}
        data-layout="agenda-panel"
        data-sortable-container="agenda"
      >
        <SectionHeader title="Notes" />
        <AddItem onClick={onAdd} />
        <SortableList
          kind="agenda"
          listId="agendaEntries"
          items={entries}
          onMove={(move) => onReorder(move.itemId, move.beforeId)}
          onDelete={(itemId) => onDelete(itemId)}
          renderItem={(entry) => (
            <AgendaEntry
              entry={entry}
              icName={icName}
              managerName={managerName}
              onUpdate={(patch) => onUpdate(entry.id, patch)}
            />
          )}
        />
      </div>
    </section>
  );
}
