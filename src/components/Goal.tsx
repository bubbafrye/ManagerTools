import type { GoalData } from "../types/document";
import { ListField } from "./ui/ListField";
import { ProgressBar } from "./ui/ProgressBar";
import styles from "./Goal.module.css";

type GoalProps = {
  goal: GoalData;
  showCompleted: boolean;
  onUpdate: (patch: Partial<GoalData>) => void;
  onIncrementProgress: () => void;
};

export function Goal({
  goal,
  showCompleted,
  onUpdate,
  onIncrementProgress,
}: GoalProps) {
  if (!showCompleted && goal.completed) {
    return null;
  }

  return (
    <article className={styles.goal}>
      <div className={styles.content}>
        <ListField
          value={goal.text}
          onChange={(text) => onUpdate({ text })}
          placeholder="Goal"
          ariaLabel="Goal"
          layoutId="goal-text"
        />
      </div>
      <ProgressBar
        progress={goal.progress}
        completed={Boolean(goal.completed)}
        onIncrement={onIncrementProgress}
        onToggleComplete={() => onUpdate({ completed: !goal.completed })}
        label="Increment goal progress"
      />
    </article>
  );
}
