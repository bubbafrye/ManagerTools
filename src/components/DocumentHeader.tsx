import { ShareBar } from "./ShareBar";
import { DateRangePicker } from "./DateRangePicker";
import { DefaultBtn } from "./ui/DefaultBtn";
import { AdjustIcon, EditIcon } from "./ui/Icons";
import { EditableText } from "./ui/EditableText";
import type { SyncStatus } from "../sync/connect";
import enterShift from "../styles/enterShift.module.css";
import styles from "./DocumentHeader.module.css";

type DocumentHeaderProps = {
  icName: string;
  managerName: string;
  periodLabel: string;
  editMode: boolean;
  onIcNameChange: (value: string) => void;
  onManagerNameChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onToggleEditMode: () => void;
  peerCount: number;
  syncStatus: SyncStatus;
  copied: boolean;
  onNewPage: () => void;
  onCopyLink: () => void;
};

export function DocumentHeader({
  icName,
  managerName,
  periodLabel,
  editMode,
  onIcNameChange,
  onManagerNameChange,
  onPeriodChange,
  onToggleEditMode,
  peerCount,
  syncStatus,
  copied,
  onNewPage,
  onCopyLink,
}: DocumentHeaderProps) {
  return (
    <div className={styles.stack}>
      {editMode ? (
        <DefaultBtn
          className={`${styles.newPage} ${enterShift.enter}`}
          onClick={onNewPage}
        >
          Create new page
        </DefaultBtn>
      ) : null}
      <header
        className={styles.header}
        data-layout="document-header"
        data-settings-shift="header"
      >
        <div className={styles.settings} data-layout="settings">
          <button
            type="button"
            className={styles.settingsButton}
            onClick={onToggleEditMode}
            aria-label="Document settings"
            aria-pressed={editMode}
          >
            <AdjustIcon />
          </button>
        </div>
        <ShareBar
          peerCount={peerCount}
          syncStatus={syncStatus}
          copied={copied}
          onCopyLink={onCopyLink}
        />
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
          clearDefaultOnFocus
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
          clearDefaultOnFocus
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
        <DateRangePicker
          periodLabel={periodLabel}
          onPeriodChange={onPeriodChange}
        />
      </header>
    </div>
  );
}
