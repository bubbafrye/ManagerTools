import type { ActionItemData } from "../types/document";
import { DateField } from "./ui/DateField";
import { EditableText } from "./ui/EditableText";
import { Tickbox } from "./ui/Tickbox";
import styles from "./ActionItem.module.css";

type ActionItemProps = {
  item: ActionItemData;
  editMode: boolean;
  showCompleted: boolean;
  onUpdate: (patch: Partial<ActionItemData>) => void;
};

export function ActionItem({
  item,
  editMode,
  showCompleted,
  onUpdate,
}: ActionItemProps) {
  if (!showCompleted && item.completed) {
    return null;
  }

  const showDue = editMode || Boolean(item.hasDueDate);

  return (
    <div
      className={`${styles.item} ${item.completed ? styles.completed : ""}`}
    >
      <Tickbox
        checked={item.completed}
        onChange={(completed) => onUpdate({ completed })}
        label={`Mark "${item.text || "action item"}" complete`}
      />
      <div className={styles.text}>
        <EditableText
          value={item.text}
          onChange={(text) => onUpdate({ text })}
          placeholder="Action item"
        />
      </div>
      {showDue && (
        <div className={styles.due}>
          {editMode && (
            <Tickbox
              checked={Boolean(item.hasDueDate)}
              onChange={(hasDueDate) => onUpdate({ hasDueDate })}
              label={`Show due date for "${item.text || "action item"}"`}
            />
          )}
          <span>Due: </span>
          <DateField
            value={item.dueDate ?? ""}
            onChange={(dueDate) => onUpdate({ dueDate })}
            ariaLabel="Due date"
          />
        </div>
      )}
    </div>
  );
}
