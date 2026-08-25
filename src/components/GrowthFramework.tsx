import { useMemo, useState } from "react";
import csv from "../data/role-definitions.csv?raw";
import {
  VISIBLE_TIER_COUNT,
  defaultSkillRatings,
  parseRoleDefinitions,
  splitTierRank,
} from "../data/parseRoleDefinitions";
import { SkillFocus } from "./SkillFocus";
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
};

export function GrowthFramework({
  icName,
  managerName,
  editMode = false,
}: GrowthFrameworkProps) {
  const discipline = useMemo(() => parseRoleDefinitions(csv)[0] ?? null, []);
  const [expanded, setExpanded] = useState(false);
  const [roleLevel, setRoleLevel] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    discipline ? defaultSkillRatings(discipline) : {},
  );
  const [notes, setNotes] = useState<AssessmentNotes>({});

  if (!discipline) return null;

  const rankTier = discipline.tiers[roleLevel - 1] ?? discipline.tiers[0];
  const { numeral, subtitle } = splitTierRank(rankTier.rank);
  const description = discipline.definition || rankTier.description;
  const title = numeral
    ? `${discipline.discipline} ${numeral}`
    : discipline.discipline;

  return (
    <section className={styles.framework} aria-label="Growth Framework">
      <div className={styles.role} data-layout="growth-role">
        <div className={styles.info}>
          <div className={styles.text}>
            <header className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
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
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.viewSkills}
            aria-expanded={expanded}
            aria-controls="growth-skills"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Hide Skills" : "View Skills"}
          </button>
        </div>
        <div className={styles.chart}>
          <div className={styles.array} data-layout="growth-array">
            {discipline.skills.map((skill, index) => {
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
                  <p className={styles.columnLabel}>{skill.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        id="growth-skills"
        className={`${styles.skillsFold} ${expanded ? styles.skillsFoldOpen : ""}`}
        data-layout="growth-skills"
        aria-hidden={!expanded}
      >
        <div className={styles.skillsInner}>
          <div className={styles.skillsGrid}>
            {discipline.skills.map((skill, index) => {
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
                    onRatingChange={(level) =>
                      setRatings((prev) => ({ ...prev, [skill.id]: level }))
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
