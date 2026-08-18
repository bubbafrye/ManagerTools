import { ListField } from "./ui/ListField";
import styles from "./AgendaPanel.module.css";

type AgendaPanelProps = {
  name: string;
  text: string;
  onChange: (text: string) => void;
  layoutId?: string;
};

export function AgendaPanel({ name, text, onChange, layoutId }: AgendaPanelProps) {
  return (
    <div className={styles.panel} data-layout={layoutId}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span> Agenda</span>
      </div>
      <ListField
        value={text}
        onChange={onChange}
        placeholder="Agenda item"
        ariaLabel={`${name} agenda`}
        alwaysList
      />
    </div>
  );
}
