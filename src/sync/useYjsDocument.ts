import { useCallback, useEffect, useRef, useState } from "react";
import {
  createEmptyDocument,
  createInitialDocument,
  type ActionItemData,
  type AgendaEntryData,
  type DocumentSettings,
  type DocumentState,
  type GoalData,
  type SavedTheme,
} from "../types/document";
import {
  connect,
  connectSync,
  persistEnabled,
  type Room,
  type SyncStatus,
} from "./connect";
import * as schema from "./schema";
import type { GoalSection, SeedMode } from "./schema";

export type DocumentActions = {
  document: DocumentState;
  updateSettings: (patch: Partial<DocumentSettings>) => void;
  addSavedTheme: (theme: SavedTheme) => boolean;
  deleteSavedTheme: (id: string) => void;
  addActionItem: () => void;
  updateActionItem: (id: string, patch: Partial<ActionItemData>) => void;
  deleteActionItem: (id: string) => void;
  addGoal: (section: GoalSection) => void;
  updateGoal: (
    section: GoalSection,
    id: string,
    patch: Partial<GoalData>,
  ) => void;
  deleteGoal: (section: GoalSection, id: string) => void;
  incrementGoalProgress: (section: GoalSection, id: string) => void;
  reorderActionItems: (itemId: string, beforeId: string | null) => void;
  moveGoal: (
    fromList: GoalSection,
    toList: GoalSection,
    itemId: string,
    beforeId: string | null,
  ) => void;
  updateIdentity: (patch: { icName?: string; managerName?: string }) => void;
  addAgendaEntry: () => void;
  updateAgendaEntry: (id: string, patch: Partial<AgendaEntryData>) => void;
  reorderAgendaEntries: (itemId: string, beforeId: string | null) => void;
  deleteAgendaEntry: (id: string) => void;
};

function initialState(seed: SeedMode): DocumentState {
  return seed === "demo" ? createInitialDocument() : createEmptyDocument();
}

export function useYjsDocument(pageId: string, seed: SeedMode) {
  const persist = persistEnabled();
  const syncRoom = useRef<Room | null>(null);

  if (!persist) {
    const stale =
      !syncRoom.current ||
      syncRoom.current.pageId !== pageId ||
      syncRoom.current.doc.isDestroyed;
    if (stale) {
      if (syncRoom.current && !syncRoom.current.doc.isDestroyed) {
        syncRoom.current.destroy();
      }
      syncRoom.current = connectSync(pageId, seed);
    }
  }

  const [room, setRoom] = useState<Room | null>(syncRoom.current);
  const [document, setDocument] = useState<DocumentState>(() =>
    syncRoom.current
      ? schema.readDocument(syncRoom.current.doc)
      : initialState(seed),
  );
  const [peerCount, setPeerCount] = useState(1);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("offline");
  const roomRef = useRef<Room | null>(syncRoom.current);

  if (!persist && syncRoom.current && room !== syncRoom.current) {
    setRoom(syncRoom.current);
    setDocument(schema.readDocument(syncRoom.current.doc));
  }

  roomRef.current = persist ? room : syncRoom.current;

  useEffect(() => {
    if (!persist) return;

    let cancelled = false;
    let active: Room | null = null;
    void connect(pageId, seed).then((next) => {
      if (cancelled) {
        next.destroy();
        return;
      }
      active = next;
      roomRef.current = next;
      setRoom(next);
      setDocument(schema.readDocument(next.doc));
    });

    return () => {
      cancelled = true;
      active?.destroy();
    };
  }, [pageId, persist, seed]);

  useEffect(() => {
    if (!room) return;
    const onUpdate = () => setDocument(schema.readDocument(room.doc));
    room.doc.on("update", onUpdate);
    const awareness = room.awareness;
    const onAwareness = () => {
      setPeerCount(awareness ? awareness.getStates().size : 1);
    };
    onAwareness();
    awareness?.on("change", onAwareness);
    const stopStatus = room.onStatus(setSyncStatus);
    return () => {
      room.doc.off("update", onUpdate);
      awareness?.off("change", onAwareness);
      stopStatus();
    };
  }, [room]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--document-ic-name", JSON.stringify(document.icName));
    root.style.setProperty(
      "--document-manager-name",
      JSON.stringify(document.managerName),
    );
  }, [document.icName, document.managerName]);

  const withDoc = useCallback((fn: (doc: Room["doc"]) => void) => {
    const current = roomRef.current?.doc;
    if (current) fn(current);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<DocumentSettings>) => {
      withDoc((doc) => schema.updateSettings(doc, patch));
    },
    [withDoc],
  );

  const addSavedTheme = useCallback(
    (theme: SavedTheme) => {
      const current = roomRef.current?.doc;
      if (!current) return false;
      return schema.addSavedTheme(current, theme);
    },
    [],
  );

  const deleteSavedTheme = useCallback((id: string) => {
    withDoc((doc) => schema.deleteSavedTheme(doc, id));
  }, [withDoc]);

  const addActionItem = useCallback(() => {
    withDoc(schema.addActionItem);
  }, [withDoc]);

  const updateActionItem = useCallback(
    (id: string, patch: Partial<ActionItemData>) => {
      withDoc((doc) => schema.updateActionItem(doc, id, patch));
    },
    [withDoc],
  );

  const deleteActionItem = useCallback((id: string) => {
    withDoc((doc) => schema.deleteActionItem(doc, id));
  }, [withDoc]);

  const addGoal = useCallback((section: GoalSection) => {
    withDoc((doc) => schema.addGoal(doc, section));
  }, [withDoc]);

  const updateGoal = useCallback(
    (section: GoalSection, id: string, patch: Partial<GoalData>) => {
      withDoc((doc) => schema.updateGoal(doc, section, id, patch));
    },
    [withDoc],
  );

  const deleteGoal = useCallback((section: GoalSection, id: string) => {
    withDoc((doc) => schema.deleteGoal(doc, section, id));
  }, [withDoc]);

  const incrementGoalProgress = useCallback(
    (section: GoalSection, id: string) => {
      withDoc((doc) => schema.incrementGoalProgress(doc, section, id));
    },
    [withDoc],
  );

  const reorderActionItems = useCallback(
    (itemId: string, beforeId: string | null) => {
      withDoc((doc) => schema.reorderActionItems(doc, itemId, beforeId));
    },
    [withDoc],
  );

  const moveGoal = useCallback(
    (
      fromList: GoalSection,
      toList: GoalSection,
      itemId: string,
      beforeId: string | null,
    ) => {
      withDoc((doc) => schema.moveGoal(doc, fromList, toList, itemId, beforeId));
    },
    [withDoc],
  );

  const updateIdentity = useCallback(
    (patch: { icName?: string; managerName?: string }) => {
      withDoc((doc) => schema.updateIdentity(doc, patch));
    },
    [withDoc],
  );

  const addAgendaEntry = useCallback(() => {
    withDoc(schema.addAgendaEntry);
  }, [withDoc]);

  const updateAgendaEntry = useCallback(
    (id: string, patch: Partial<AgendaEntryData>) => {
      withDoc((doc) => schema.updateAgendaEntry(doc, id, patch));
    },
    [withDoc],
  );

  const reorderAgendaEntries = useCallback(
    (itemId: string, beforeId: string | null) => {
      withDoc((doc) => schema.reorderAgendaEntries(doc, itemId, beforeId));
    },
    [withDoc],
  );

  const deleteAgendaEntry = useCallback((id: string) => {
    withDoc((doc) => schema.deleteAgendaEntry(doc, id));
  }, [withDoc]);

  const actions: DocumentActions = {
    document,
    updateSettings,
    addSavedTheme,
    deleteSavedTheme,
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

  return {
    ...actions,
    ready: persist ? room !== null : true,
    peerCount,
    syncStatus,
  };
}
