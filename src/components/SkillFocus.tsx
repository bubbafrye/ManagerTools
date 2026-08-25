import type { RoleSkill } from "../data/parseRoleDefinitions";
import { NotesText } from "./Notes";
import { TierSelector } from "./TierSelector";
import styles from "./SkillFocus.module.css";

type SkillFocusProps = {
  skill: RoleSkill;
  rating: number;
  icName: string;
  managerName: string;
  icNotes: string;
  managerNotes: string;
  onRatingChange: (level: number) => void;
  onIcNotesChange: (value: string) => void;
  onManagerNotesChange: (value: string) => void;
};

export function SkillFocus({
  skill,
  rating,
  icName,
  managerName,
  icNotes,
  managerNotes,
  onRatingChange,
  onIcNotesChange,
  onManagerNotesChange,
}: SkillFocusProps) {
  const selectedCopy = skill.tiers[rating - 1] ?? "";

  return (
    <article className={styles.focus} data-skill={skill.id}>
      <div className={styles.definition}>
        <h3 className={styles.title}>{skill.title}</h3>
        {skill.definition ? (
          <p className={styles.copy}>{skill.definition}</p>
        ) : null}
        <TierSelector
          value={rating}
          onChange={onRatingChange}
          ariaName={`${skill.title} rating`}
        />
        {selectedCopy ? <p className={styles.copy}>{selectedCopy}</p> : null}
      </div>
      <Assessment
        skillId={skill.id}
        name={icName}
        value={icNotes}
        onChange={onIcNotesChange}
        kind="IC"
      />
      <Assessment
        skillId={skill.id}
        name={managerName}
        value={managerNotes}
        onChange={onManagerNotesChange}
        kind="Manager"
      />
    </article>
  );
}

function Assessment({
  skillId,
  name,
  value,
  onChange,
  kind,
}: {
  skillId: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  kind: "IC" | "Manager";
}) {
  return (
    <div className={styles.assessment}>
      <p className={styles.assessmentHeader}>
        {name}’s Assessment
      </p>
      <div className={styles.assessmentBody}>
        <NotesText
          value={value}
          onChange={onChange}
          placeholder="Assessment notes"
          ariaLabel={`${name}’s Assessment`}
          layoutId={`${skillId}-${kind}-assessment`}
        />
      </div>
    </div>
  );
}
