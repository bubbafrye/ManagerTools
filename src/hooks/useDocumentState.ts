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
import { moveBetween, moveById } from "../reorder";

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

  const reorderActionItems = useCallback(
    (itemId: string, beforeId: string | null) => {
      setDocument((prev) => ({
        ...prev,
        actionItems: moveById(prev.actionItems, itemId, beforeId),
      }));
    },
    [],
  );

  const moveGoal = useCallback(
    (
      fromList: "professionalGoals" | "personalGoals",
      toList: "professionalGoals" | "personalGoals",
      itemId: string,
      beforeId: string | null,
    ) => {
      setDocument((prev) => {
        if (fromList === toList) {
          return {
            ...prev,
            [fromList]: moveById(prev[fromList], itemId, beforeId),
          };
        }
        const { from, to } = moveBetween(
          prev[fromList],
          prev[toList],
          itemId,
          beforeId,
        );
        return { ...prev, [fromList]: from, [toList]: to };
      });
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

  const reorderAgendaEntries = useCallback(
    (itemId: string, beforeId: string | null) => {
      setDocument((prev) => ({
        ...prev,
        agendaEntries: moveById(prev.agendaEntries, itemId, beforeId),
      }));
    },
    [],
  );

  const deleteAgendaEntry = useCallback((id: string) => {
    setDocument((prev) => ({
      ...prev,
      agendaEntries: prev.agendaEntries.filter((entry) => entry.id !== id),
    }));
  }, []);

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
    reorderActionItems,
    moveGoal,
    updateIdentity,
    addAgendaEntry,
    updateAgendaEntry,
    reorderAgendaEntries,
    deleteAgendaEntry,
  };
}

export type DocumentActions = ReturnType<typeof useDocumentState>;
