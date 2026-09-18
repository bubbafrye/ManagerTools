import styles from "./Grip.module.css";

const DOTS = 10;

type GripProps = {
  stacks?: 1 | 2;
  className?: string;
};

function Column() {
  return (
    <span className={styles.column}>
      {Array.from({ length: DOTS }, (_, index) => (
        <span key={index} className={styles.dot} />
      ))}
    </span>
  );
}

export function Grip({ stacks = 1, className }: GripProps) {
  return (
    <div
      className={`${styles.wrap} ${className ?? ""}`}
      data-name="grip"
      aria-hidden
    >
      {Array.from({ length: stacks }, (_, index) => (
        <div key={index} className={styles.grip}>
          <Column />
          <Column />
        </div>
      ))}
    </div>
  );
}
