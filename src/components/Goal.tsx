import type { GoalData } from "../types/document";
import { Grip } from "./ui/Grip";
import { ListField } from "./ui/ListField";
import { ProgressBar } from "./ui/ProgressBar";
import styles from "./Goal.module.css";

type GoalProps = {
  goal: GoalData;
  editMode: boolean;
  showCompleted: boolean;
  onUpdate: (patch: Partial<GoalData>) => void;
  onIncrementProgress: () => void;
};

export function Goal({
  goal,
  editMode,
  showCompleted,
  onUpdate,
  onIncrementProgress,
}: GoalProps) {
  if (!showCompleted && goal.completed) {
    return null;
  }

  return (
    <article className={styles.goal}>
      <div className={styles.content} data-name="content">
        <ListField
          value={goal.text}
          onChange={(text) => onUpdate({ text })}
          placeholder="Goal"
          ariaLabel="Goal"
          layoutId="goal-text"
        />
        <ProgressBar
          progress={goal.progress}
          completed={Boolean(goal.completed)}
          onIncrement={onIncrementProgress}
          onToggleComplete={() => onUpdate({ completed: !goal.completed })}
          label="Increment goal progress"
        />
      </div>
      {editMode ? <Grip stacks={2} /> : null}
    </article>
  );
}
