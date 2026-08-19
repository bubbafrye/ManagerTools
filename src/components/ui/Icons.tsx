import styles from "./Icons.module.css";

type IconProps = {
  className?: string;
};

export function AddItemIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.addItem} ${className ?? ""}`}
      src="/assets/add-item.svg"
      alt=""
      width={22}
      height={22}
    />
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.edit} ${className ?? ""}`}
      src="/assets/edit.svg"
      alt=""
      width={25}
      height={22}
    />
  );
}

export function RandoIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.rando} ${className ?? ""}`}
      src="/assets/rando.svg"
      alt=""
      width={50}
      height={50}
    />
  );
}

export function SandIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.sand} ${className ?? ""}`}
      src="/assets/sand.svg"
      alt=""
      width={50}
      height={50}
    />
  );
}

export function AdjustIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.adjust} ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <span className={`${styles.trash} ${className ?? ""}`} aria-hidden>
      <img
        className={styles.trashDefault}
        src="/assets/trash.svg"
        alt=""
        width={22}
        height={25}
      />
      <img
        className={styles.trashOver}
        src="/assets/trash-over.svg"
        alt=""
        width={22}
        height={25}
      />
    </span>
  );
}
