import type { ActionItemData } from "../types/document";
import { ActionItem } from "./ActionItem";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SortableList } from "./ui/SortableList";
import { SwatchRow } from "./ui/Swatch";
import styles from "./ActionItems.module.css";

type ActionItemsProps = {
  items: ActionItemData[];
  editMode: boolean;
  showCompleted: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ActionItemData>) => void;
  onReorder: (itemId: string, beforeId: string | null) => void;
  onDelete: (itemId: string) => void;
};

export function ActionItems({
  items,
  editMode,
  showCompleted,
  onAdd,
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
      <SectionHeader
        title="Action Items"
        trailing={
          editMode ? (
            <SwatchRow
              colors={[
                {
                  token: "--actions-actions-container-surface",
                  label: "Action Items container surface",
                },
                {
                  token: "--actions-actions-container-stroke",
                  label: "Action Items container stroke",
                },
                {
                  token: "--actions-actions-panel-surface",
                  label: "Action Items card surface",
                },
                {
                  token: "--actions-actions-panel-stroke",
                  label: "Action Items card stroke",
                },
              ]}
            />
          ) : null
        }
      />
      <AddItem onClick={onAdd} />
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
