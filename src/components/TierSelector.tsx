import { publicUrl } from "../publicUrl";
import { VISIBLE_TIER_COUNT } from "../data/parseRoleDefinitions";
import styles from "./TierSelector.module.css";

const ARABIC_LABELS = ["1", "2", "3", "4", "5"] as const;
const ROMAN_LABELS = ["I", "II", "III", "IV", "V"] as const;

const SKILL_STOPS = [
  "var(--framework-stop1)",
  "var(--framework-stop2)",
  "var(--framework-stop3)",
  "var(--framework-stop4)",
] as const;

function maskUrl(path: string) {
  return { WebkitMaskImage: `url("${publicUrl(path)}")`, maskImage: `url("${publicUrl(path)}")` };
}

type TierSelectorProps = {
  value: number;
  onChange: (level: number) => void;
  ariaName: string;
  labels?: "arabic" | "roman";
  stop?: "skill" | "stop1";
};

export function TierSelector({
  value,
  onChange,
  ariaName,
  labels = "arabic",
  stop = "skill",
}: TierSelectorProps) {
  const glyphs = labels === "roman" ? ROMAN_LABELS : ARABIC_LABELS;

  return (
    <div className={styles.selector} role="group" aria-label={ariaName}>
      <span className={styles.bar} aria-hidden />
      <div className={styles.nodes}>
        {Array.from({ length: VISIBLE_TIER_COUNT }, (_, index) => {
          const level = index + 1;
          const selected = value === level;
          const nodeStop =
            stop === "stop1" ? "var(--framework-stop1)" : SKILL_STOPS[level - 1];
          const nodeStyle = nodeStop
            ? { ["--framework-node-stop" as string]: nodeStop }
            : undefined;
          const label = glyphs[index] ?? String(level);
          return (
            <button
              key={level}
              type="button"
              className={`${styles.node} ${selected ? styles.nodeOn : ""}`}
              style={nodeStyle}
              data-tier={level}
              aria-label={`${ariaName} ${label}`}
              aria-pressed={selected}
              onClick={() => {
                if (selected) return;
                onChange(level);
              }}
            >
              <span className={styles.binder} aria-hidden>
                <span
                  className={styles.binderFill}
                  style={maskUrl("assets/framework/binder.svg")}
                />
                {nodeStop ? (
                  <span
                    className={styles.binderTint}
                    style={maskUrl("assets/framework/binder.svg")}
                  />
                ) : null}
              </span>
              <span className={styles.point} aria-hidden>
                <span
                  className={styles.pointFill}
                  style={maskUrl("assets/framework/lvl-point.svg")}
                />
                {nodeStop ? (
                  <span
                    className={styles.pointTint}
                    style={maskUrl("assets/framework/lvl-point.svg")}
                  />
                ) : null}
                <span className={styles.numeral}>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
