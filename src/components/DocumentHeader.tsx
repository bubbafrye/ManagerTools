import { AdjustIcon, EditIcon } from "./ui/Icons";
import { EditableText } from "./ui/EditableText";
import styles from "./DocumentHeader.module.css";

type DocumentHeaderProps = {
  icName: string;
  managerName: string;
  periodLabel: string;
  editMode: boolean;
  onIcNameChange: (value: string) => void;
  onManagerNameChange: (value: string) => void;
  onToggleEditMode: () => void;
};

export function DocumentHeader({
  icName,
  managerName,
  periodLabel,
  editMode,
  onIcNameChange,
  onManagerNameChange,
  onToggleEditMode,
}: DocumentHeaderProps) {
  return (
    <header
      className={styles.header}
      data-layout="document-header"
    >
      <button
        type="button"
        className={styles.settingsButton}
        onClick={onToggleEditMode}
        aria-label="Document settings"
        aria-pressed={editMode}
      >
        <AdjustIcon />
      </button>
      <div className={styles.names} data-layout="ic-manager">
        <span className={`${styles.nameSlot} ${styles.nameSlotHidden}`} aria-hidden>
          <EditIcon />
        </span>
        <EditableText
          value={icName}
          onChange={onIcNameChange}
          variant="inline"
          placeholder="IC"
          multiline={false}
          ariaLabel="IC name"
          muted={
            editMode && (icName.trim() === "" || icName.trim() === "IC")
          }
          editable={editMode}
        />
        <span>:</span>
        <EditableText
          value={managerName}
          onChange={onManagerNameChange}
          variant="inline"
          placeholder="Manager"
          multiline={false}
          ariaLabel="Manager name"
          muted={
            editMode &&
            (managerName.trim() === "" || managerName.trim() === "Manager")
          }
          editable={editMode}
        />
        <span
          className={`${styles.nameSlot} ${editMode ? "" : styles.nameSlotHidden}`}
          aria-hidden
        >
          <EditIcon />
        </span>
      </div>
      <div className={styles.period} data-layout="period">
        {periodLabel}
      </div>
    </header>
  );
}
