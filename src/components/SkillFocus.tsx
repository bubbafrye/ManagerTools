import type { RoleSkill } from "../data/parseRoleDefinitions";
import { NotesText } from "./Notes";
import { EditableText } from "./ui/EditableText";
import { TierSelector } from "./TierSelector";
import styles from "./SkillFocus.module.css";

type SkillFocusProps = {
  skill: RoleSkill;
  rating: number;
  icName: string;
  managerName: string;
  icNotes: string;
  managerNotes: string;
  contentEdit?: boolean;
  onRatingChange: (level: number) => void;
  onIcNotesChange: (value: string) => void;
  onManagerNotesChange: (value: string) => void;
  onSkillChange?: (skill: RoleSkill) => void;
};

export function SkillFocus({
  skill,
  rating,
  icName,
  managerName,
  icNotes,
  managerNotes,
  contentEdit = false,
  onRatingChange,
  onIcNotesChange,
  onManagerNotesChange,
  onSkillChange,
}: SkillFocusProps) {
  const selectedCopy = skill.tiers[rating - 1] ?? "";

  return (
    <article className={styles.focus} data-skill={skill.id}>
      <div className={styles.definition}>
        {contentEdit ? (
          <h3 className={styles.title}>
            <EditableText
              variant="inline"
              multiline={false}
              value={skill.title}
              onChange={(title) => onSkillChange?.({ ...skill, title })}
              ariaLabel={`${skill.title} header`}
              placeholder="Skill name"
            />
          </h3>
        ) : (
          <h3 className={styles.title}>{skill.title}</h3>
        )}
        {contentEdit ? (
          <div className={styles.copy}>
            <EditableText
              value={skill.definition}
              onChange={(definition) =>
                onSkillChange?.({ ...skill, definition })
              }
              ariaLabel={`${skill.title} description`}
              placeholder="Add Skill description"
            />
          </div>
        ) : skill.definition ? (
          <p className={styles.copy}>{skill.definition}</p>
        ) : null}
        <TierSelector
          value={rating}
          onChange={onRatingChange}
          ariaName={`${skill.title} rating`}
        />
        {contentEdit ? (
          <div className={styles.copy}>
            <EditableText
              value={selectedCopy}
              onChange={(value) => {
                const tiers = [...skill.tiers];
                tiers[rating - 1] = value;
                onSkillChange?.({ ...skill, tiers });
              }}
              ariaLabel={`${skill.title} tier description`}
              placeholder="Tier description"
            />
          </div>
        ) : selectedCopy ? (
          <p className={styles.copy}>{selectedCopy}</p>
        ) : null}
      </div>
      {contentEdit ? null : (
        <>
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
        </>
      )}
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
