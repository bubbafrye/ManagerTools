import type { AgendaEntryData } from "../types/document";
import { AgendaEntry } from "./AgendaEntry";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SwatchRow } from "./ui/Swatch";
import styles from "./Agenda.module.css";

type AgendaProps = {
  entries: AgendaEntryData[];
  icName: string;
  managerName: string;
  editMode: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<AgendaEntryData>) => void;
};

export function Agenda({
  entries,
  icName,
  managerName,
  editMode,
  onAdd,
  onUpdate,
}: AgendaProps) {
  return (
    <section className={styles.container} aria-label="Agenda">
      <div className={styles.panel} data-layout="agenda-panel">
        <SectionHeader
          title="Agenda:"
          trailing={
            editMode ? (
              <SwatchRow
                colors={[
                  {
                    color: "var(--agenda-agenda-container-surface)",
                    label: "Agenda container surface",
                  },
                  {
                    color: "var(--agenda-agenda-container-stroke)",
                    label: "Agenda container stroke",
                  },
                  {
                    color: "var(--notes-notes-panel-surface)",
                    label: "Notes surface",
                  },
                  {
                    color: "var(--notes-notes-panel-stroke)",
                    label: "Notes stroke",
                  },
                  {
                    color: "var(--agenda-agenda-panel-surface)",
                    label: "Agenda card surface",
                  },
                  {
                    color: "var(--agenda-agenda-panel-stroke)",
                    label: "Agenda card stroke",
                  },
                ]}
              />
            ) : null
          }
        />
        <AddItem onClick={onAdd} />
        <div className={styles.list}>
          {entries.map((entry) => (
            <AgendaEntry
              key={entry.id}
              entry={entry}
              icName={icName}
              managerName={managerName}
              onUpdate={(patch) => onUpdate(entry.id, patch)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
