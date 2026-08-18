import type { ActionItemData } from "../types/document";
import { ActionItem } from "./ActionItem";
import { AddItem } from "./ui/AddItem";
import { SectionHeader } from "./ui/SectionHeader";
import { SwatchRow } from "./ui/Swatch";
import styles from "./ActionItems.module.css";

type ActionItemsProps = {
  items: ActionItemData[];
  editMode: boolean;
  showCompleted: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ActionItemData>) => void;
};

export function ActionItems({
  items,
  editMode,
  showCompleted,
  onAdd,
  onUpdate,
}: ActionItemsProps) {
  return (
    <section className={styles.container} aria-label="Action Items">
      <SectionHeader
        title="Action Items"
        trailing={
          editMode ? (
            <SwatchRow
              colors={[
                {
                  color: "var(--actions-actions-container-surface)",
                  label: "Action Items container surface",
                },
                {
                  color: "var(--actions-actions-container-stroke)",
                  label: "Action Items container stroke",
                },
                {
                  color: "var(--actions-actions-panel-surface)",
                  label: "Action Items card surface",
                },
                {
                  color: "var(--actions-actions-panel-stroke)",
                  label: "Action Items card stroke",
                },
              ]}
            />
          ) : null
        }
      />
      <AddItem onClick={onAdd} />
      <div className={styles.list}>
        {items.map((item) => (
          <ActionItem
            key={item.id}
            item={item}
            editMode={editMode}
            showCompleted={showCompleted}
            onUpdate={(patch) => onUpdate(item.id, patch)}
          />
        ))}
      </div>
    </section>
  );
}
