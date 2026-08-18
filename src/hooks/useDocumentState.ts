import { useCallback, useEffect, useState } from "react";
import {
  createEmptyAgendaSide,
  createId,
  createInitialDocument,
  formatNotesDate,
  PROGRESS_SEGMENTS,
  type ActionItemData,
  type AgendaEntryData,
  type DocumentSettings,
  type DocumentState,
  type GoalData,
} from "../types/document";

export function useDocumentState() {
  const [document, setDocument] = useState<DocumentState>(createInitialDocument);

  const updateSettings = useCallback((patch: Partial<DocumentSettings>) => {
    setDocument((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const addActionItem = useCallback(() => {
    const item: ActionItemData = {
      id: createId(),
      text: "",
      completed: false,
    };
    setDocument((prev) => ({
      ...prev,
      actionItems: [item, ...prev.actionItems],
    }));
  }, []);

  const updateActionItem = useCallback(
    (id: string, patch: Partial<ActionItemData>) => {
      setDocument((prev) => ({
        ...prev,
        actionItems: prev.actionItems.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const deleteActionItem = useCallback((id: string) => {
    setDocument((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((item) => item.id !== id),
    }));
  }, []);

  const addGoal = useCallback((section: "professionalGoals" | "personalGoals") => {
    const goal: GoalData = { id: createId(), text: "", progress: 0 };
    setDocument((prev) => ({
      ...prev,
      [section]: [goal, ...prev[section]],
    }));
  }, []);

  const updateGoal = useCallback(
    (
      section: "professionalGoals" | "personalGoals",
      id: string,
      patch: Partial<GoalData>,
    ) => {
      setDocument((prev) => ({
        ...prev,
        [section]: prev[section].map((goal) =>
          goal.id === id ? { ...goal, ...patch } : goal,
        ),
      }));
    },
    [],
  );

  const deleteGoal = useCallback(
    (section: "professionalGoals" | "personalGoals", id: string) => {
      setDocument((prev) => ({
        ...prev,
        [section]: prev[section].filter((goal) => goal.id !== id),
      }));
    },
    [],
  );

  const incrementGoalProgress = useCallback(
    (section: "professionalGoals" | "personalGoals", id: string) => {
      setDocument((prev) => ({
        ...prev,
        [section]: prev[section].map((goal) => {
          if (goal.id !== id || goal.completed) return goal;
          const next =
            goal.progress >= PROGRESS_SEGMENTS ? 0 : goal.progress + 1;
          return { ...goal, progress: next };
        }),
      }));
    },
    [],
  );

  const updateIdentity = useCallback(
    (patch: { icName?: string; managerName?: string }) => {
      setDocument((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--document-ic-name", JSON.stringify(document.icName));
    root.style.setProperty(
      "--document-manager-name",
      JSON.stringify(document.managerName),
    );
  }, [document.icName, document.managerName]);

  const addAgendaEntry = useCallback(() => {
    const entry: AgendaEntryData = {
      id: createId(),
      notesDate: formatNotesDate(),
      notesText: "",
      icAgenda: createEmptyAgendaSide(),
      managerAgenda: createEmptyAgendaSide(),
    };
    setDocument((prev) => ({
      ...prev,
      agendaEntries: [entry, ...prev.agendaEntries],
    }));
  }, []);

  const updateAgendaEntry = useCallback(
    (id: string, patch: Partial<AgendaEntryData>) => {
      setDocument((prev) => ({
        ...prev,
        agendaEntries: prev.agendaEntries.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      }));
    },
    [],
  );

  return {
    document,
    updateSettings,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    addGoal,
    updateGoal,
    deleteGoal,
    incrementGoalProgress,
    updateIdentity,
    addAgendaEntry,
    updateAgendaEntry,
  };
}

export type DocumentActions = ReturnType<typeof useDocumentState>;
