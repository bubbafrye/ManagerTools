import type { GoalData } from "../types/document";
import { Goal } from "./Goal";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SwatchRow } from "./ui/Swatch";
import styles from "./Goals.module.css";

type GoalSectionProps = {
  title: string;
  goals: GoalData[];
  showCompleted: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<GoalData>) => void;
  onIncrementProgress: (id: string) => void;
};

function GoalSection({
  title,
  goals,
  showCompleted,
  onAdd,
  onUpdate,
  onIncrementProgress,
}: GoalSectionProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.subheader}>{title}</h3>
      <AddItem onClick={onAdd} />
      <div className={styles.list}>
        {goals.map((goal) => (
          <Goal
            key={goal.id}
            goal={goal}
            showCompleted={showCompleted}
            onUpdate={(patch) => onUpdate(goal.id, patch)}
            onIncrementProgress={() => onIncrementProgress(goal.id)}
          />
        ))}
      </div>
    </div>
  );
}

type GoalsProps = {
  professionalGoals: GoalData[];
  personalGoals: GoalData[];
  editMode: boolean;
  showCompleted: boolean;
  onAddProfessional: () => void;
  onAddPersonal: () => void;
  onUpdateProfessional: (id: string, patch: Partial<GoalData>) => void;
  onUpdatePersonal: (id: string, patch: Partial<GoalData>) => void;
  onIncrementProfessional: (id: string) => void;
  onIncrementPersonal: (id: string) => void;
};

export function Goals({
  professionalGoals,
  personalGoals,
  editMode,
  showCompleted,
  onAddProfessional,
  onAddPersonal,
  onUpdateProfessional,
  onUpdatePersonal,
  onIncrementProfessional,
  onIncrementPersonal,
}: GoalsProps) {
  return (
    <section className={styles.container} aria-label="Goals">
      <SectionHeader
        title="Goals"
        trailing={
          editMode ? (
            <SwatchRow
              colors={[
                {
                  color: "var(--goals-goals-container-surface)",
                  label: "Goals container surface",
                },
                {
                  color: "var(--goals-goals-containter-stroke)",
                  label: "Goals container stroke",
                },
                {
                  color: "var(--goals-goals-panel-surface)",
                  label: "Goals card surface",
                },
                {
                  color: "var(--goals-goals-panel-stroke)",
                  label: "Goals card stroke",
                },
              ]}
            />
          ) : null
        }
      />
      <GoalSection
        title="Professional Goals:"
        goals={professionalGoals}
        showCompleted={showCompleted}
        onAdd={onAddProfessional}
        onUpdate={onUpdateProfessional}
        onIncrementProgress={onIncrementProfessional}
      />
      <div className={styles.spacer} aria-hidden />
      <GoalSection
        title="Personal Goals:"
        goals={personalGoals}
        showCompleted={showCompleted}
        onAdd={onAddPersonal}
        onUpdate={onUpdatePersonal}
        onIncrementProgress={onIncrementPersonal}
      />
    </section>
  );
}
