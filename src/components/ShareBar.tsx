import type { SyncStatus } from "../sync/connect";
import styles from "./ShareBar.module.css";

type ShareBarProps = {
  peerCount: number;
  syncStatus: SyncStatus;
  copied: boolean;
  onNewPage: () => void;
  onCopyLink: () => void;
};

const statusLabel: Record<SyncStatus, string> = {
  live: "Live",
  connecting: "Connecting",
  offline: "Offline",
};

export function ShareBar({
  peerCount,
  syncStatus,
  copied,
  onNewPage,
  onCopyLink,
}: ShareBarProps) {
  return (
    <div className={styles.bar} data-layout="share-bar">
      <button type="button" className={styles.action} onClick={onNewPage}>
        New 1:1
      </button>
      <button type="button" className={styles.action} onClick={onCopyLink}>
        Copy link
      </button>
      <span className={styles.status}>{statusLabel[syncStatus]}</span>
      {copied ? <span className={styles.status}>Copied</span> : null}
      {peerCount > 1 ? (
        <span className={styles.status}>{peerCount} here</span>
      ) : null}
    </div>
  );
}
