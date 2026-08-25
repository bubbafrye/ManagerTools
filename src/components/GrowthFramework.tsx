import { useEffect, useMemo, useState } from "react";
import csv from "../data/role-definitions.csv?raw";
import {
  VISIBLE_TIER_COUNT,
  defaultSkillRatings,
  parseRoleDefinitions,
  splitTierRank,
  type RoleSkill,
} from "../data/parseRoleDefinitions";
import { SkillFocus } from "./SkillFocus";
import { EditableText } from "./ui/EditableText";
import { TierSelector } from "./TierSelector";
import styles from "./GrowthFramework.module.css";

const TINT_CLASS = [
  styles.cellTint1,
  styles.cellTint2,
  styles.cellTint3,
  styles.cellTint4,
] as const;

const HUE_VARS = [
  "var(--framework-hue-1)",
  "var(--framework-hue-2)",
  "var(--framework-hue-3)",
  "var(--framework-hue-4)",
  "var(--framework-hue-5)",
  "var(--framework-hue-6)",
] as const;

type AssessmentNotes = Record<string, { ic: string; manager: string }>;

type GrowthFrameworkProps = {
  icName: string;
  managerName: string;
  editMode?: boolean;
  disciplineName?: string;
  contentEdit?: boolean;
};

export function GrowthFramework({
  icName,
  managerName,
  editMode = false,
  disciplineName,
  contentEdit = false,
}: GrowthFrameworkProps) {
  const disciplines = useMemo(() => parseRoleDefinitions(csv), []);
  const discipline = useMemo(() => {
    if (disciplineName) {
      return (
        disciplines.find((role) => role.discipline === disciplineName) ??
        disciplines[0] ??
        null
      );
    }
    return disciplines[0] ?? null;
  }, [disciplines, disciplineName]);
  const [expanded, setExpanded] = useState(false);
  const [roleLevel, setRoleLevel] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    discipline ? defaultSkillRatings(discipline) : {},
  );
  const [notes, setNotes] = useState<AssessmentNotes>({});
  const [skills, setSkills] = useState<RoleSkill[]>(
    () => discipline?.skills ?? [],
  );
  const [roleTitle, setRoleTitle] = useState(
    () => discipline?.discipline ?? "",
  );
  const [roleDefinition, setRoleDefinition] = useState(
    () => discipline?.definition ?? "",
  );
  const [tierDescriptions, setTierDescriptions] = useState<string[]>(
    () => discipline?.tiers.map((tier) => tier.description) ?? [],
  );
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  useEffect(() => {
    setSkills(discipline?.skills ?? []);
    setRoleTitle(discipline?.discipline ?? "");
    setRoleDefinition(discipline?.definition ?? "");
    setTierDescriptions(
      discipline?.tiers.map((tier) => tier.description) ?? [],
    );
    setDescriptionOpen(false);
  }, [discipline]);

  if (!discipline) return null;

  const skillsOpen = contentEdit || expanded;
  const showDescription = contentEdit || descriptionOpen;
  const rankTier = discipline.tiers[roleLevel - 1] ?? discipline.tiers[0];
  const { numeral, subtitle } = splitTierRank(rankTier.rank);
  const description =
    roleDefinition ||
    (tierDescriptions[roleLevel - 1] ?? rankTier.description);

  return (
    <section className={styles.framework} aria-label="Growth Framework">
      <div
        className={`${styles.role}${showDescription ? "" : ` ${styles.roleShort}`}`}
        data-layout="growth-role"
        data-short={showDescription ? undefined : ""}
      >
        <div className={styles.info}>
          <div className={styles.text}>
            <header className={styles.header}>
              <h2 className={styles.title}>
                {contentEdit ? (
                  <EditableText
                    variant="inline"
                    multiline={false}
                    value={roleTitle}
                    onChange={setRoleTitle}
                    ariaLabel="Role title"
                    placeholder="Role"
                  />
                ) : (
                  roleTitle
                )}
                {numeral ? (
                  <span className={styles.titleLevel}>{` ${numeral}`}</span>
                ) : null}
              </h2>
              {editMode ? (
                <div
                  className={styles.roleSelector}
                  style={{
                    ["--framework-column-hue" as string]:
                      "var(--document-header-text-color)",
                  }}
                >
                  <TierSelector
                    value={roleLevel}
                    onChange={setRoleLevel}
                    ariaName="Role level"
                    labels="roman"
                    stop="stop1"
                  />
                </div>
              ) : null}
              <p className={styles.rank}>{subtitle}</p>
            </header>
            {contentEdit ? (
              <div className={styles.description}>
                <EditableText
                  value={description}
                  onChange={(value) => {
                    if (roleDefinition) {
                      setRoleDefinition(value);
                      return;
                    }
                    setTierDescriptions((prev) => {
                      const next = [...prev];
                      next[roleLevel - 1] = value;
                      return next;
                    });
                  }}
                  ariaLabel="Role description"
                  placeholder="Add Role description"
                />
              </div>
            ) : showDescription && description ? (
              <button
                type="button"
                className={styles.descriptionToggle}
                onClick={() => {
                  setDescriptionOpen(false);
                  setExpanded(false);
                }}
              >
                {description}
              </button>
            ) : (
              <button
                type="button"
                className={styles.readMore}
                onClick={() => setDescriptionOpen(true)}
              >
                Read more...
              </button>
            )}
          </div>
          {showDescription ? (
            <button
              type="button"
              className={styles.viewSkills}
              aria-expanded={skillsOpen}
              aria-controls="growth-skills"
              onClick={() => setExpanded((open) => !open)}
            >
              {skillsOpen ? "Hide Skills" : "View Skills"}
            </button>
          ) : null}
        </div>
        <div className={styles.chart}>
          <div className={styles.array} data-layout="growth-array">
            {skills.map((skill, index) => {
              const rating = ratings[skill.id] ?? 1;
              const hue = HUE_VARS[index % HUE_VARS.length];
              return (
                <div
                  key={skill.id}
                  className={styles.column}
                  style={{ ["--framework-column-hue" as string]: hue }}
                  data-skill={skill.id}
                  data-rating={rating}
                >
                  <p className={styles.columnLabel}>{skill.title}</p>
                  <div className={styles.cellStack}>
                    {Array.from({ length: VISIBLE_TIER_COUNT }, (_, cell) => {
                      const level = VISIBLE_TIER_COUNT - cell;
                      const earned = level <= rating;
                      const tintClass = TINT_CLASS[level - 1];
                      return (
                        <button
                          key={level}
                          type="button"
                          className={`${styles.cell} ${earned ? "" : styles.cellHidden}`}
                          data-tier={level}
                          aria-label={`${skill.title} tier ${level}`}
                          aria-pressed={rating === level}
                          onClick={() => {
                            if (rating === level) return;
                            setRatings((prev) => ({ ...prev, [skill.id]: level }));
                          }}
                        >
                          <span className={styles.cellBase} aria-hidden />
                          {tintClass ? (
                            <span className={`${styles.cellTint} ${tintClass}`} aria-hidden />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        id="growth-skills"
        className={`${styles.skillsFold} ${skillsOpen ? styles.skillsFoldOpen : ""}`}
        data-layout="growth-skills"
        aria-hidden={!skillsOpen}
      >
        <div className={styles.skillsInner}>
          <div className={styles.skillsGrid}>
            {skills.map((skill, index) => {
              const hue = HUE_VARS[index % HUE_VARS.length];
              const rating = ratings[skill.id] ?? 1;
              const skillNotes = notes[skill.id] ?? { ic: "", manager: "" };
              return (
                <div
                  key={skill.id}
                  style={{ ["--framework-column-hue" as string]: hue }}
                >
                  <SkillFocus
                    skill={skill}
                    rating={rating}
                    icName={icName}
                    managerName={managerName}
                    icNotes={skillNotes.ic}
                    managerNotes={skillNotes.manager}
                    contentEdit={contentEdit}
                    onRatingChange={(level) =>
                      setRatings((prev) => ({ ...prev, [skill.id]: level }))
                    }
                    onSkillChange={(next) =>
                      setSkills((prev) =>
                        prev.map((item) => (item.id === next.id ? next : item)),
                      )
                    }
                    onIcNotesChange={(value) =>
                      setNotes((prev) => {
                        const current = prev[skill.id] ?? { ic: "", manager: "" };
                        return { ...prev, [skill.id]: { ...current, ic: value } };
                      })
                    }
                    onManagerNotesChange={(value) =>
                      setNotes((prev) => {
                        const current = prev[skill.id] ?? { ic: "", manager: "" };
                        return {
                          ...prev,
                          [skill.id]: { ...current, manager: value },
                        };
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
