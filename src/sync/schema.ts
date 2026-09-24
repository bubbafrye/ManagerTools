import * as Y from "yjs";
import {
  createEmptyAgendaSide,
  createEmptyDocument,
  createId,
  createInitialDocument,
  formatNotesDate,
  PROGRESS_SEGMENTS,
  type ActionItemData,
  type AgendaEntryData,
  type DocumentSettings,
  type DocumentState,
  type GoalData,
  type SavedTheme,
} from "../types/document.ts";

export const DEFAULT_PAGE_ID = "local";

export type SeedMode = "demo" | "empty";
export type GoalSection = "professionalGoals" | "personalGoals";

const META = "meta";
const SETTINGS = "settings";
const ACTION_ITEMS = "actionItems";
const PROFESSIONAL_GOALS = "professionalGoals";
const PERSONAL_GOALS = "personalGoals";
const AGENDA_ENTRIES = "agendaEntries";
const READY = "ready";
const CUSTOM_THEMES = "customThemes";

function asMap(value: unknown): Y.Map<unknown> | null {
  return value instanceof Y.Map ? value : null;
}

function asText(value: unknown): Y.Text | null {
  return value instanceof Y.Text ? value : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function applyYText(text: Y.Text, next: string) {
  const prev = text.toString();
  if (prev === next) return;
  let start = 0;
  const limit = Math.min(prev.length, next.length);
  while (start < limit && prev.charCodeAt(start) === next.charCodeAt(start)) {
    start += 1;
  }
  let endPrev = prev.length;
  let endNext = next.length;
  while (
    endPrev > start &&
    endNext > start &&
    prev.charCodeAt(endPrev - 1) === next.charCodeAt(endNext - 1)
  ) {
    endPrev -= 1;
    endNext -= 1;
  }
  text.doc?.transact(() => {
    if (endPrev > start) text.delete(start, endPrev - start);
    if (endNext > start) text.insert(start, next.slice(start, endNext));
  });
}

export function isReady(doc: Y.Doc): boolean {
  return doc.getMap(META).get(READY) === true;
}

function writeSettings(map: Y.Map<unknown>, settings: DocumentSettings) {
  map.set("showDueDates", settings.showDueDates);
  map.set("showCompletedTasks", settings.showCompletedTasks);
}

function writeSavedTheme(theme: SavedTheme): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  map.set("id", theme.id);
  map.set("name", theme.name);
  map.set("colors", { ...theme.colors });
  map.set("appearance", { ...theme.appearance });
  return map;
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const record: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") record[key] = entry;
  }
  return record;
}

function readSavedTheme(map: Y.Map<unknown>): SavedTheme | null {
  const id = asString(map.get("id"));
  const name = asString(map.get("name"));
  if (!id || !name) return null;
  const appearanceRaw = map.get("appearance");
  const appearance =
    appearanceRaw && typeof appearanceRaw === "object"
      ? (appearanceRaw as SavedTheme["appearance"])
      : {
          panelRadius: 6,
          panelBorder: 2,
          cardRadius: 2,
          cardBorder: 2,
          headerFont: "Inter",
          bodyFont: "Inter",
        };
  return {
    id,
    name,
    colors: asRecord(map.get("colors")),
    appearance: {
      panelRadius: asNumber(appearance.panelRadius, 6),
      panelBorder: asNumber(appearance.panelBorder, 2),
      cardRadius: asNumber(appearance.cardRadius, 2),
      cardBorder: asNumber(appearance.cardBorder, 2),
      headerFont: asString(appearance.headerFont, "Inter"),
      bodyFont: asString(appearance.bodyFont, "Inter"),
    },
  };
}

function writeActionItem(item: ActionItemData): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  map.set("id", item.id);
  map.set("text", item.text);
  map.set("completed", item.completed);
  if (item.hasDueDate !== undefined) map.set("hasDueDate", item.hasDueDate);
  if (item.dueDate !== undefined) map.set("dueDate", item.dueDate);
  return map;
}

function writeGoal(goal: GoalData): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  map.set("id", goal.id);
  map.set("text", goal.text);
  map.set("progress", goal.progress);
  if (goal.completed !== undefined) map.set("completed", goal.completed);
  return map;
}

function writeAgendaEntry(entry: AgendaEntryData): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  map.set("id", entry.id);
  map.set("notesDate", entry.notesDate);
  const notesText = new Y.Text();
  if (entry.notesText) notesText.insert(0, entry.notesText);
  map.set("notesText", notesText);
  const icAgenda = new Y.Text();
  if (entry.icAgenda.text) icAgenda.insert(0, entry.icAgenda.text);
  map.set("icAgenda", icAgenda);
  const managerAgenda = new Y.Text();
  if (entry.managerAgenda.text) managerAgenda.insert(0, entry.managerAgenda.text);
  map.set("managerAgenda", managerAgenda);
  return map;
}

function replaceArray(
  arr: Y.Array<Y.Map<unknown>>,
  items: Y.Map<unknown>[],
) {
  if (arr.length > 0) arr.delete(0, arr.length);
  if (items.length > 0) arr.insert(0, items);
}

export function writeDocument(doc: Y.Doc, state: DocumentState) {
  doc.transact(() => {
    const meta = doc.getMap(META);
    meta.set("icName", state.icName);
    meta.set("managerName", state.managerName);
    meta.set("periodLabel", state.periodLabel);
    meta.set(READY, true);
    writeSettings(doc.getMap(SETTINGS), state.settings);
    replaceArray(
      doc.getArray(CUSTOM_THEMES),
      state.settings.customThemes.map(writeSavedTheme),
    );
    replaceArray(
      doc.getArray(ACTION_ITEMS),
      state.actionItems.map(writeActionItem),
    );
    replaceArray(
      doc.getArray(PROFESSIONAL_GOALS),
      state.professionalGoals.map(writeGoal),
    );
    replaceArray(
      doc.getArray(PERSONAL_GOALS),
      state.personalGoals.map(writeGoal),
    );
    replaceArray(
      doc.getArray(AGENDA_ENTRIES),
      state.agendaEntries.map(writeAgendaEntry),
    );
  });
}

export function seedDocument(doc: Y.Doc, seed: SeedMode) {
  if (isReady(doc)) return;
  writeDocument(
    doc,
    seed === "demo" ? createInitialDocument() : createEmptyDocument(),
  );
}

function readActionItem(map: Y.Map<unknown>): ActionItemData {
  const item: ActionItemData = {
    id: asString(map.get("id"), createId()),
    text: asString(map.get("text")),
    completed: asBoolean(map.get("completed")),
  };
  if (map.has("hasDueDate")) item.hasDueDate = asBoolean(map.get("hasDueDate"));
  if (map.has("dueDate")) item.dueDate = asString(map.get("dueDate"));
  return item;
}

function readGoal(map: Y.Map<unknown>): GoalData {
  const goal: GoalData = {
    id: asString(map.get("id"), createId()),
    text: asString(map.get("text")),
    progress: asNumber(map.get("progress")),
  };
  if (map.has("completed")) goal.completed = asBoolean(map.get("completed"));
  return goal;
}

function readAgendaEntry(map: Y.Map<unknown>): AgendaEntryData {
  const notesText = asText(map.get("notesText"));
  const icAgenda = asText(map.get("icAgenda"));
  const managerAgenda = asText(map.get("managerAgenda"));
  return {
    id: asString(map.get("id"), createId()),
    notesDate: asString(map.get("notesDate")),
    notesText: notesText ? notesText.toString() : asString(map.get("notesText")),
    icAgenda: icAgenda
      ? { text: icAgenda.toString() }
      : createEmptyAgendaSide(),
    managerAgenda: managerAgenda
      ? { text: managerAgenda.toString() }
      : createEmptyAgendaSide(),
  };
}

function readMaps(arr: Y.Array<unknown>): Y.Map<unknown>[] {
  const maps: Y.Map<unknown>[] = [];
  for (let i = 0; i < arr.length; i += 1) {
    const map = asMap(arr.get(i));
    if (map) maps.push(map);
  }
  return maps;
}

export function readDocument(doc: Y.Doc): DocumentState {
  const meta = doc.getMap(META);
  const settings = doc.getMap(SETTINGS);
  return {
    icName: asString(meta.get("icName"), "IC"),
    managerName: asString(meta.get("managerName"), "Manager"),
    periodLabel: asString(meta.get("periodLabel")),
    actionItems: readMaps(doc.getArray(ACTION_ITEMS)).map(readActionItem),
    professionalGoals: readMaps(doc.getArray(PROFESSIONAL_GOALS)).map(readGoal),
    personalGoals: readMaps(doc.getArray(PERSONAL_GOALS)).map(readGoal),
    agendaEntries: readMaps(doc.getArray(AGENDA_ENTRIES)).map(readAgendaEntry),
    settings: {
      showDueDates: asBoolean(settings.get("showDueDates")),
      showCompletedTasks: asBoolean(settings.get("showCompletedTasks"), true),
      customThemes: readMaps(doc.getArray(CUSTOM_THEMES))
        .map(readSavedTheme)
        .filter((theme): theme is SavedTheme => theme !== null),
    },
  };
}

function itemArray(doc: Y.Doc): Y.Array<unknown> {
  return doc.getArray(ACTION_ITEMS);
}

function goalArray(doc: Y.Doc, section: GoalSection): Y.Array<unknown> {
  return doc.getArray(section);
}

function agendaArray(doc: Y.Doc): Y.Array<unknown> {
  return doc.getArray(AGENDA_ENTRIES);
}

function findMap(
  arr: Y.Array<unknown>,
  id: string,
): { index: number; map: Y.Map<unknown> } | null {
  for (let i = 0; i < arr.length; i += 1) {
    const map = asMap(arr.get(i));
    if (map && map.get("id") === id) return { index: i, map };
  }
  return null;
}

function cloneMap(map: Y.Map<unknown>): Y.Map<unknown> {
  const copy = new Y.Map<unknown>();
  map.forEach((value, key) => {
    if (value instanceof Y.Text) {
      const text = new Y.Text();
      const current = value.toString();
      if (current) text.insert(0, current);
      copy.set(key, text);
      return;
    }
    copy.set(key, value);
  });
  return copy;
}

function moveInArray(
  arr: Y.Array<unknown>,
  itemId: string,
  beforeId: string | null,
) {
  const found = findMap(arr, itemId);
  if (!found) return;
  const copy = cloneMap(found.map);
  const doc = found.map.doc;
  const apply = () => {
    arr.delete(found.index, 1);
    if (beforeId === null) {
      arr.insert(arr.length, [copy]);
      return;
    }
    const next = findMap(arr, beforeId);
    arr.insert(next ? next.index : arr.length, [copy]);
  };
  if (doc) doc.transact(apply);
  else apply();
}

export function updateSettings(doc: Y.Doc, patch: Partial<DocumentSettings>) {
  const settings = doc.getMap(SETTINGS);
  doc.transact(() => {
    if (patch.showDueDates !== undefined) {
      settings.set("showDueDates", patch.showDueDates);
    }
    if (patch.showCompletedTasks !== undefined) {
      settings.set("showCompletedTasks", patch.showCompletedTasks);
    }
  });
}

export function addSavedTheme(doc: Y.Doc, theme: SavedTheme) {
  if (!isReady(doc)) return false;
  doc.getArray(CUSTOM_THEMES).push([writeSavedTheme(theme)]);
  return true;
}

export function deleteSavedTheme(doc: Y.Doc, id: string) {
  const arr = doc.getArray(CUSTOM_THEMES);
  const found = findMap(arr, id);
  if (found) arr.delete(found.index, 1);
}

export function addActionItem(doc: Y.Doc) {
  itemArray(doc).insert(0, [
    writeActionItem({ id: createId(), text: "", completed: false }),
  ]);
}

export function updateActionItem(
  doc: Y.Doc,
  id: string,
  patch: Partial<ActionItemData>,
) {
  const found = findMap(itemArray(doc), id);
  if (!found) return;
  doc.transact(() => {
    for (const [key, value] of Object.entries(patch)) {
      if (key === "id") continue;
      if (value === undefined) found.map.delete(key);
      else found.map.set(key, value);
    }
  });
}

export function deleteActionItem(doc: Y.Doc, id: string) {
  const found = findMap(itemArray(doc), id);
  if (found) itemArray(doc).delete(found.index, 1);
}

export function addGoal(doc: Y.Doc, section: GoalSection) {
  goalArray(doc, section).insert(0, [
    writeGoal({ id: createId(), text: "", progress: 0 }),
  ]);
}

export function updateGoal(
  doc: Y.Doc,
  section: GoalSection,
  id: string,
  patch: Partial<GoalData>,
) {
  const found = findMap(goalArray(doc, section), id);
  if (!found) return;
  doc.transact(() => {
    for (const [key, value] of Object.entries(patch)) {
      if (key === "id") continue;
      if (value === undefined) found.map.delete(key);
      else found.map.set(key, value);
    }
  });
}

export function deleteGoal(doc: Y.Doc, section: GoalSection, id: string) {
  const found = findMap(goalArray(doc, section), id);
  if (found) goalArray(doc, section).delete(found.index, 1);
}

export function incrementGoalProgress(
  doc: Y.Doc,
  section: GoalSection,
  id: string,
) {
  const found = findMap(goalArray(doc, section), id);
  if (!found || asBoolean(found.map.get("completed"))) return;
  const progress = asNumber(found.map.get("progress"));
  found.map.set(
    "progress",
    progress >= PROGRESS_SEGMENTS ? 0 : progress + 1,
  );
}

export function reorderActionItems(
  doc: Y.Doc,
  itemId: string,
  beforeId: string | null,
) {
  moveInArray(itemArray(doc), itemId, beforeId);
}

export function moveGoal(
  doc: Y.Doc,
  fromList: GoalSection,
  toList: GoalSection,
  itemId: string,
  beforeId: string | null,
) {
  if (fromList === toList) {
    moveInArray(goalArray(doc, fromList), itemId, beforeId);
    return;
  }
  const from = goalArray(doc, fromList);
  const to = goalArray(doc, toList);
  const found = findMap(from, itemId);
  if (!found) return;
  const copy = writeGoal(readGoal(found.map));
  doc.transact(() => {
    from.delete(found.index, 1);
    if (beforeId === null) {
      to.insert(to.length, [copy]);
      return;
    }
    const next = findMap(to, beforeId);
    to.insert(next ? next.index : to.length, [copy]);
  });
}

export function updateIdentity(
  doc: Y.Doc,
  patch: { icName?: string; managerName?: string; periodLabel?: string },
) {
  const meta = doc.getMap(META);
  doc.transact(() => {
    if (patch.icName !== undefined) meta.set("icName", patch.icName);
    if (patch.managerName !== undefined) meta.set("managerName", patch.managerName);
    if (patch.periodLabel !== undefined) meta.set("periodLabel", patch.periodLabel);
  });
}

export function addAgendaEntry(doc: Y.Doc) {
  agendaArray(doc).insert(0, [
    writeAgendaEntry({
      id: createId(),
      notesDate: formatNotesDate(),
      notesText: "",
      icAgenda: createEmptyAgendaSide(),
      managerAgenda: createEmptyAgendaSide(),
    }),
  ]);
}

export function updateAgendaEntry(
  doc: Y.Doc,
  id: string,
  patch: Partial<AgendaEntryData>,
) {
  const found = findMap(agendaArray(doc), id);
  if (!found) return;
  doc.transact(() => {
    if (patch.notesDate !== undefined) {
      found.map.set("notesDate", patch.notesDate);
    }
    if (patch.notesText !== undefined) {
      const notes = asText(found.map.get("notesText"));
      if (notes) applyYText(notes, patch.notesText);
    }
    if (patch.icAgenda) {
      const text = asText(found.map.get("icAgenda"));
      if (text) applyYText(text, patch.icAgenda.text);
    }
    if (patch.managerAgenda) {
      const text = asText(found.map.get("managerAgenda"));
      if (text) applyYText(text, patch.managerAgenda.text);
    }
  });
}

export function reorderAgendaEntries(
  doc: Y.Doc,
  itemId: string,
  beforeId: string | null,
) {
  moveInArray(agendaArray(doc), itemId, beforeId);
}

export function deleteAgendaEntry(doc: Y.Doc, id: string) {
  const found = findMap(agendaArray(doc), id);
  if (found) agendaArray(doc).delete(found.index, 1);
}
