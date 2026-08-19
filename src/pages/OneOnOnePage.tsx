import { useEffect, useState } from "react";
import { ActionItems } from "../components/ActionItems";
import { Agenda } from "../components/Agenda";
import { DocumentHeader } from "../components/DocumentHeader";
import { Goals } from "../components/Goals";
import { AdjustmentPanel } from "../components/ui/AdjustmentPanel";
import {
  DEFAULT_APPEARANCE,
  applyAppearance,
  type Appearance,
} from "../appearance";
import type { DocumentActions } from "../hooks/useDocumentState";
import styles from "./OneOnOnePage.module.css";

type OneOnOnePageProps = DocumentActions;

export function OneOnOnePage({
  document,
  addActionItem,
  updateActionItem,
  addGoal,
  updateGoal,
  incrementGoalProgress,
  reorderActionItems,
  moveGoal,
  deleteActionItem,
  deleteGoal,
  updateIdentity,
  addAgendaEntry,
  updateAgendaEntry,
  reorderAgendaEntries,
  deleteAgendaEntry,
  updateSettings,
}: OneOnOnePageProps) {
  const { settings } = document;
  const [editMode, setEditMode] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    if (!editMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editMode]);

  return (
    <main className={styles.page} data-layout="page">
      <div className={styles.chrome}>
        <DocumentHeader
          icName={document.icName}
          managerName={document.managerName}
          periodLabel={document.periodLabel}
          editMode={editMode}
          onIcNameChange={(icName) => updateIdentity({ icName })}
          onManagerNameChange={(managerName) => updateIdentity({ managerName })}
          onToggleEditMode={() => setEditMode((open) => !open)}
        />
        {editMode ? (
          <AdjustmentPanel
            appearance={appearance}
            onChange={(patch) =>
              setAppearance((prev) => ({ ...prev, ...patch }))
            }
            showCompleted={settings.showCompletedTasks}
            onShowCompletedChange={(showCompletedTasks) =>
              updateSettings({ showCompletedTasks })
            }
          />
        ) : null}
      </div>
      <div className={styles.leftColumn} data-layout="left-column">
        <ActionItems
          items={document.actionItems}
          editMode={editMode}
          showCompleted={settings.showCompletedTasks}
          onAdd={addActionItem}
          onUpdate={updateActionItem}
          onReorder={reorderActionItems}
          onDelete={deleteActionItem}
        />
        <Goals
          professionalGoals={document.professionalGoals}
          personalGoals={document.personalGoals}
          editMode={editMode}
          showCompleted={settings.showCompletedTasks}
          onAddProfessional={() => addGoal("professionalGoals")}
          onAddPersonal={() => addGoal("personalGoals")}
          onUpdateProfessional={(id, patch) =>
            updateGoal("professionalGoals", id, patch)
          }
          onUpdatePersonal={(id, patch) =>
            updateGoal("personalGoals", id, patch)
          }
          onIncrementProfessional={(id) =>
            incrementGoalProgress("professionalGoals", id)
          }
          onIncrementPersonal={(id) =>
            incrementGoalProgress("personalGoals", id)
          }
          onMove={(move) => {
            if (
              (move.fromList === "professionalGoals" ||
                move.fromList === "personalGoals") &&
              (move.toList === "professionalGoals" ||
                move.toList === "personalGoals")
            ) {
              moveGoal(move.fromList, move.toList, move.itemId, move.beforeId);
            }
          }}
          onDelete={(itemId, listId) => {
            if (
              listId === "professionalGoals" ||
              listId === "personalGoals"
            ) {
              deleteGoal(listId, itemId);
            }
          }}
        />
      </div>
      <div className={styles.rightColumn} data-layout="agenda-column">
        <Agenda
          entries={document.agendaEntries}
          icName={document.icName}
          managerName={document.managerName}
          editMode={editMode}
          onAdd={addAgendaEntry}
          onUpdate={updateAgendaEntry}
          onReorder={reorderAgendaEntries}
          onDelete={deleteAgendaEntry}
        />
      </div>
    </main>
  );
}
