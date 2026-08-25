import { useEffect, useMemo, useState } from "react";
import { ActionItems } from "../components/ActionItems";
import { Agenda } from "../components/Agenda";
import { DocumentHeader } from "../components/DocumentHeader";
import { Goals } from "../components/Goals";
import { GrowthFramework } from "../components/GrowthFramework";
import { AdjustmentPanel } from "../components/ui/AdjustmentPanel";
import { RoleEditor } from "../components/ui/RoleEditor";
import csv from "../data/role-definitions.csv?raw";
import {
  listRoleNames,
  NEW_ROLE_LABEL,
  parseRoleDefinitions,
} from "../data/parseRoleDefinitions";
import {
  DEFAULT_APPEARANCE,
  applyAppearance,
  type Appearance,
} from "../appearance";
import { applyRandomizedLook, randomizeLook } from "../randomizeLook";
import {
  DEFAULT_THEME_ID,
  applyTheme,
  type ThemeId,
} from "../themes";
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
  const [activeThemeId, setActiveThemeId] = useState<ThemeId | null>(
    DEFAULT_THEME_ID,
  );
  const roleNames = useMemo(
    () => listRoleNames(parseRoleDefinitions(csv)),
    [],
  );
  const [selectedRole, setSelectedRole] = useState(
    () => roleNames[0] ?? "Product Designer",
  );
  const [contentEdit, setContentEdit] = useState(false);

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
          <div className={styles.editStrip} data-layout="edit-strip">
            <AdjustmentPanel
              appearance={appearance}
              activeThemeId={activeThemeId}
              onChange={(patch) => {
                setActiveThemeId(null);
                setAppearance((prev) => ({ ...prev, ...patch }));
              }}
              onSelectTheme={(id) => {
                setAppearance((prev) => applyTheme(id, prev));
                setActiveThemeId(id);
              }}
              onThemeRemoved={(id) => {
                setActiveThemeId((prev) => (prev === id ? null : prev));
              }}
              onRandomize={() => {
                const look = randomizeLook();
                applyRandomizedLook(look);
                setAppearance((prev) => ({ ...prev, ...look.appearance }));
                setActiveThemeId(null);
              }}
            />
            <RoleEditor
              roles={roleNames}
              value={selectedRole}
              contentEdit={contentEdit}
              onChange={(role) => {
                setSelectedRole(role);
                setContentEdit(role === NEW_ROLE_LABEL);
              }}
              onEditPreset={() => setContentEdit(true)}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.framework} data-layout="growth-framework">
        <GrowthFramework
          key={selectedRole}
          icName={document.icName}
          managerName={document.managerName}
          editMode={editMode}
          disciplineName={selectedRole}
          contentEdit={contentEdit}
        />
      </div>
      <section className={styles.oneOnOne} data-layout="one-on-one">
        <div className={styles.leftSide} data-layout="left-column">
          <ActionItems
            items={document.actionItems}
            editMode={editMode}
            showCompleted={settings.showCompletedTasks}
            onAdd={addActionItem}
            onShowCompletedChange={(showCompletedTasks) =>
              updateSettings({ showCompletedTasks })
            }
            onUpdate={updateActionItem}
            onReorder={reorderActionItems}
            onDelete={deleteActionItem}
          />
          <Goals
            professionalGoals={document.professionalGoals}
            personalGoals={document.personalGoals}
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
        <div className={styles.agendaSide} data-layout="agenda-column">
          <Agenda
            entries={document.agendaEntries}
            icName={document.icName}
            managerName={document.managerName}
            onAdd={addAgendaEntry}
            onUpdate={updateAgendaEntry}
            onReorder={reorderAgendaEntries}
            onDelete={deleteAgendaEntry}
          />
        </div>
      </section>
    </main>
  );
}
