import type { AgendaEntryData } from "../types/document";
import { AgendaPanel } from "./AgendaPanel";
import { Notes } from "./Notes";
import styles from "./AgendaEntry.module.css";

type AgendaEntryProps = {
  entry: AgendaEntryData;
  icName: string;
  managerName: string;
  onUpdate: (patch: Partial<AgendaEntryData>) => void;
};

export function AgendaEntry({
  entry,
  icName,
  managerName,
  onUpdate,
}: AgendaEntryProps) {
  return (
    <article className={styles.entry}>
      <Notes
        notesDate={entry.notesDate}
        notesText={entry.notesText}
        onDateChange={(notesDate) => onUpdate({ notesDate })}
        onTextChange={(notesText) => onUpdate({ notesText })}
      />
      <div className={styles.sides}>
        <AgendaPanel
          name={icName}
          text={entry.icAgenda.text}
          onChange={(text) =>
            onUpdate({ icAgenda: { ...entry.icAgenda, text } })
          }
          layoutId="agenda-ic"
        />
        <AgendaPanel
          name={managerName}
          text={entry.managerAgenda.text}
          onChange={(text) =>
            onUpdate({ managerAgenda: { ...entry.managerAgenda, text } })
          }
          layoutId="agenda-manager"
        />
      </div>
    </article>
  );
}
