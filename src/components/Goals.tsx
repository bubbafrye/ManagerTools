import type { GoalData } from "../types/document";
import { Goal } from "./Goal";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SortableList, type SortableMove } from "./ui/SortableList";
import styles from "./Goals.module.css";

type GoalListId = "professionalGoals" | "personalGoals";

type GoalSectionProps = {
  title: string;
  listId: GoalListId;
  goals: GoalData[];
  showCompleted: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<GoalData>) => void;
  onIncrementProgress: (id: string) => void;
  onMove: (move: SortableMove) => void;
  onDelete: (itemId: string, listId: string) => void;
};

function GoalSection({
  title,
  listId,
  goals,
  showCompleted,
  onAdd,
  onUpdate,
  onIncrementProgress,
  onMove,
  onDelete,
}: GoalSectionProps) {
  const visible = showCompleted
    ? goals
    : goals.filter((goal) => !goal.completed);

  return (
    <div className={styles.section}>
      <h3 className={styles.subheader}>{title}</h3>
      <AddItem onClick={onAdd} />
      <SortableList
        kind="goal"
        listId={listId}
        items={visible}
        onMove={onMove}
        onDelete={onDelete}
        renderItem={(goal) => (
          <Goal
            goal={goal}
            showCompleted={showCompleted}
            onUpdate={(patch) => onUpdate(goal.id, patch)}
            onIncrementProgress={() => onIncrementProgress(goal.id)}
          />
        )}
      />
    </div>
  );
}

type GoalsProps = {
  professionalGoals: GoalData[];
  personalGoals: GoalData[];
  showCompleted: boolean;
  onAddProfessional: () => void;
  onAddPersonal: () => void;
  onUpdateProfessional: (id: string, patch: Partial<GoalData>) => void;
  onUpdatePersonal: (id: string, patch: Partial<GoalData>) => void;
  onIncrementProfessional: (id: string) => void;
  onIncrementPersonal: (id: string) => void;
  onMove: (move: SortableMove) => void;
  onDelete: (itemId: string, listId: string) => void;
};

export function Goals({
  professionalGoals,
  personalGoals,
  showCompleted,
  onAddProfessional,
  onAddPersonal,
  onUpdateProfessional,
  onUpdatePersonal,
  onIncrementProfessional,
  onIncrementPersonal,
  onMove,
  onDelete,
}: GoalsProps) {
  return (
    <section
      className={styles.container}
      aria-label="Goals"
      data-sortable-container="goal"
    >
      <SectionHeader title="Goals" />
      <GoalSection
        title="Professional Goals:"
        listId="professionalGoals"
        goals={professionalGoals}
        showCompleted={showCompleted}
        onAdd={onAddProfessional}
        onUpdate={onUpdateProfessional}
        onIncrementProgress={onIncrementProfessional}
        onMove={onMove}
        onDelete={onDelete}
      />
      <div className={styles.spacer} aria-hidden />
      <GoalSection
        title="Personal Goals:"
        listId="personalGoals"
        goals={personalGoals}
        showCompleted={showCompleted}
        onAdd={onAddPersonal}
        onUpdate={onUpdatePersonal}
        onIncrementProgress={onIncrementPersonal}
        onMove={onMove}
        onDelete={onDelete}
      />
    </section>
  );
}
