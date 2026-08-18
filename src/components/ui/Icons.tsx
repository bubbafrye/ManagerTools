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

export function AdjustIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.adjust} ${className ?? ""}`}
      src="/assets/adjust.svg"
      alt=""
      width={24}
      height={25}
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
