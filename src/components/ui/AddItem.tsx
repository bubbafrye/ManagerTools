import { AddItemIcon } from "./Icons";
import styles from "./AddItem.module.css";

type AddItemProps = {
  onClick: () => void;
};

export function AddItem({ onClick }: AddItemProps) {
  return (
    <button type="button" className={styles.addItem} onClick={onClick}>
      <AddItemIcon className={styles.icon} />
      <span className={styles.label}>Add Item</span>
    </button>
  );
}
