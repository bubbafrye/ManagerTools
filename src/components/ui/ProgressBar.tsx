import { PROGRESS_SEGMENTS } from "../../types/document";
import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  progress: number;
  completed: boolean;
  onIncrement: () => void;
  onToggleComplete: () => void;
  label: string;
};

export function ProgressBar({
  progress,
  completed,
  onIncrement,
  onToggleComplete,
  label,
}: ProgressBarProps) {
  const widthPercent = (progress / PROGRESS_SEGMENTS) * 100;
  const full = progress >= PROGRESS_SEGMENTS;

  return (
    <div className={styles.wrap}>
      <div className={styles.progress}>
        <button
          type="button"
          className={styles.track}
          onClick={onIncrement}
          disabled={completed}
          aria-label={label}
        >
          <div
            className={styles.bar}
            style={{ width: `${widthPercent}%` }}
            aria-hidden
          />
        </button>
        {full ? (
          <button
            type="button"
            className={`${styles.complete} ${completed ? styles.completePressed : ""}`}
            aria-pressed={completed}
            aria-label={completed ? "Mark goal incomplete" : "Mark goal complete"}
            onClick={onToggleComplete}
          >
            COMPLETE
            {completed ? (
              <img
                src="/assets/complete-check.svg"
                alt=""
                width={8}
                height={8}
              />
            ) : null}
          </button>
        ) : null}
      </div>
      {full && !completed ? (
        <p className={styles.hint}>Press ‘complete’ to close the task.</p>
      ) : null}
    </div>
  );
}
