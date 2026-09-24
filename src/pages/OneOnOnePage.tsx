import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  applySavedTheme,
  applyTheme,
} from "../themes";
import type { DocumentActions } from "../hooks/useDocumentState";
import type { SyncStatus } from "../sync/connect";
import enterShift from "../styles/enterShift.module.css";
import styles from "./OneOnOnePage.module.css";

type OneOnOnePageProps = DocumentActions & {
  peerCount: number;
  syncStatus: SyncStatus;
  copied: boolean;
  onNewPage: () => void;
  onCopyLink: () => void;
};

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
  addSavedTheme,
  deleteSavedTheme,
  peerCount,
  syncStatus,
  copied,
  onNewPage,
  onCopyLink,
}: OneOnOnePageProps) {
  const { settings } = document;
  const [editMode, setEditMode] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(
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
  const pageRef = useRef<HTMLElement>(null);
  const settingsTopsRef = useRef<Map<string, number> | null>(null);

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

  useLayoutEffect(() => {
    const root = pageRef.current;
    const prevTops = settingsTopsRef.current;
    settingsTopsRef.current = null;
    if (!editMode || !root || !prevTops) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const el of root.querySelectorAll<HTMLElement>("[data-settings-shift]")) {
      const id = el.dataset.settingsShift;
      if (!id) continue;
      const prevTop = prevTops.get(id);
      if (prevTop == null) continue;
      const dy = prevTop - el.getBoundingClientRect().top;
      if (dy >= 0) continue;
      el.classList.remove(enterShift.shift);
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      void el.offsetWidth;
      el.style.transition = "";
      el.classList.add(enterShift.shift);
      el.style.transform = "";
      const done = (event: TransitionEvent) => {
        if (event.target !== el || event.propertyName !== "transform") return;
        el.classList.remove(enterShift.shift);
        el.removeEventListener("transitionend", done);
      };
      el.addEventListener("transitionend", done);
    }
  }, [editMode]);

  return (
    <main ref={pageRef} className={styles.page} data-layout="page">
      <div className={styles.chrome}>
        <DocumentHeader
          icName={document.icName}
          managerName={document.managerName}
          periodLabel={document.periodLabel}
          editMode={editMode}
          onIcNameChange={(icName) => updateIdentity({ icName })}
          onManagerNameChange={(managerName) => updateIdentity({ managerName })}
          onPeriodChange={(periodLabel) => updateIdentity({ periodLabel })}
          onToggleEditMode={() => {
            const root = pageRef.current;
            if (!editMode && root) {
              const tops = new Map<string, number>();
              for (const el of root.querySelectorAll<HTMLElement>(
                "[data-settings-shift]",
              )) {
                const id = el.dataset.settingsShift;
                if (id) tops.set(id, el.getBoundingClientRect().top);
              }
              settingsTopsRef.current = tops;
            }
            setEditMode((open) => !open);
          }}
          peerCount={peerCount}
          syncStatus={syncStatus}
          copied={copied}
          onNewPage={onNewPage}
          onCopyLink={onCopyLink}
        />
        {editMode ? (
          <div
            className={`${styles.editStrip} ${enterShift.enter}`}
            data-layout="edit-strip"
          >
            <AdjustmentPanel
              appearance={appearance}
              activeThemeId={activeThemeId}
              customThemes={settings.customThemes}
              canPersist={true}
              onChange={(patch) => {
                setActiveThemeId(null);
                setAppearance((prev) => ({ ...prev, ...patch }));
              }}
              onSelectTheme={(id) => {
                setAppearance((prev) => applyTheme(id, prev));
                setActiveThemeId(id);
              }}
              onSelectSavedTheme={(theme) => {
                setAppearance((prev) => applySavedTheme(theme, prev));
                setActiveThemeId(theme.id);
              }}
              onSaveTheme={(theme) => addSavedTheme(theme)}
              onThemeRemoved={(id) => {
                setActiveThemeId((prev) => (prev === id ? null : prev));
                if (settings.customThemes.some((theme) => theme.id === id)) {
                  deleteSavedTheme(id);
                }
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
      <div
        className={styles.framework}
        data-layout="growth-framework"
        data-settings-shift="framework"
      >
        <GrowthFramework
          key={selectedRole}
          icName={document.icName}
          managerName={document.managerName}
          editMode={editMode}
          disciplineName={selectedRole}
          contentEdit={contentEdit}
        />
      </div>
      <section
        className={styles.oneOnOne}
        data-layout="one-on-one"
        data-settings-shift="one-on-one"
      >
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
