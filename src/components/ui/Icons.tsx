import styles from "./Icons.module.css";

type IconProps = {
  className?: string;
};

export function AddItemIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.addItem} ${className ?? ""}`}
      data-icon="add-item"
      aria-hidden
    />
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.edit} ${className ?? ""}`}
      data-icon="edit"
      aria-hidden
    />
  );
}

export function RandoIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.rando} ${className ?? ""}`}
      src="/assets/rando.svg"
      alt=""
      width={30}
      height={30}
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
