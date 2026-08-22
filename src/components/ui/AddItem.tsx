import { AddItemIcon } from "./Icons";
import { Tickbox } from "./Tickbox";
import styles from "./AddItem.module.css";

type AddItemProps = {
  onClick: () => void;
  completedToggle?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
};

export function AddItem({ onClick, completedToggle }: AddItemProps) {
  return (
    <div className={styles.row}>
      <button type="button" className={styles.addItem} onClick={onClick}>
        <AddItemIcon className={styles.icon} />
        <span className={styles.label}>Add Item</span>
      </button>
      {completedToggle ? (
        <div className={styles.toggle}>
          <Tickbox
            checked={completedToggle.checked}
            onChange={completedToggle.onChange}
            label="show completed"
          />
          <button
            type="button"
            className={styles.toggleLabel}
            tabIndex={-1}
            onClick={() => completedToggle.onChange(!completedToggle.checked)}
          >
            show completed
          </button>
        </div>
      ) : null}
    </div>
  );
}
