import type { ActionItemData } from "../types/document";
import { ActionItem } from "./ActionItem";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SortableList } from "./ui/SortableList";
import styles from "./ActionItems.module.css";

type ActionItemsProps = {
  items: ActionItemData[];
  editMode: boolean;
  showCompleted: boolean;
  onAdd: () => void;
  onShowCompletedChange?: (showCompleted: boolean) => void;
  onUpdate: (id: string, patch: Partial<ActionItemData>) => void;
  onReorder: (itemId: string, beforeId: string | null) => void;
  onDelete: (itemId: string) => void;
};

export function ActionItems({
  items,
  editMode,
  showCompleted,
  onAdd,
  onShowCompletedChange,
  onUpdate,
  onReorder,
  onDelete,
}: ActionItemsProps) {
  const visible = showCompleted
    ? items
    : items.filter((item) => !item.completed);

  return (
    <section
      className={styles.container}
      aria-label="Action Items"
      data-sortable-container="action-item"
    >
      <SectionHeader title="Action Items" />
      <AddItem
        onClick={onAdd}
        completedToggle={
          editMode && onShowCompletedChange
            ? {
                checked: showCompleted,
                onChange: onShowCompletedChange,
              }
            : undefined
        }
      />
      <SortableList
        kind="action-item"
        listId="actionItems"
        items={visible}
        onMove={(move) => onReorder(move.itemId, move.beforeId)}
        onDelete={(itemId) => onDelete(itemId)}
        renderItem={(item) => (
          <ActionItem
            item={item}
            editMode={editMode}
            showCompleted={showCompleted}
            onUpdate={(patch) => onUpdate(item.id, patch)}
          />
        )}
      />
    </section>
  );
}
