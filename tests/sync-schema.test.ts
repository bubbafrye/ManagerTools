import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as Y from "yjs";
import {
  addActionItem,
  addAgendaEntry,
  addSavedTheme,
  applyYText,
  isReady,
  moveGoal,
  readDocument,
  reorderActionItems,
  seedDocument,
  updateActionItem,
  updateAgendaEntry,
  writeDocument,
} from "../src/sync/schema.ts";
import { createEmptyDocument, createInitialDocument } from "../src/types/document.ts";

describe("seedDocument", () => {
  it("seeds demo data once", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "demo");
    const first = readDocument(doc);
    assert.equal(isReady(doc), true);
    assert.equal(first.actionItems.length, 2);
    assert.equal(first.actionItems[0].text, "Make this moar pretty");
    seedDocument(doc, "demo");
    assert.equal(readDocument(doc).actionItems.length, 2);
  });

  it("seeds empty rooms with structure only", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "empty");
    assert.deepEqual(readDocument(doc), {
      ...createEmptyDocument(),
      icName: "IC",
      managerName: "Manager",
    });
  });
});

describe("document mutations", () => {
  it("round-trips a full document", () => {
    const doc = new Y.Doc();
    const state = createInitialDocument();
    writeDocument(doc, state);
    assert.deepEqual(readDocument(doc), state);
  });

  it("adds, updates, and reorders action items", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "empty");
    addActionItem(doc);
    addActionItem(doc);
    const [first, second] = readDocument(doc).actionItems;
    updateActionItem(doc, first.id, { text: "A" });
    updateActionItem(doc, second.id, { text: "B" });
    reorderActionItems(doc, first.id, null);
    assert.deepEqual(
      readDocument(doc).actionItems.map((item) => item.text),
      ["B", "A"],
    );
  });

  it("moves a goal between lists", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "demo");
    const { professionalGoals, personalGoals } = readDocument(doc);
    const moving = professionalGoals[0];
    moveGoal(doc, "professionalGoals", "personalGoals", moving.id, null);
    const next = readDocument(doc);
    assert.equal(next.professionalGoals.length, professionalGoals.length - 1);
    assert.equal(next.personalGoals.at(-1)?.id, moving.id);
  });

  it("applies a prefix/suffix-preserving text edit", () => {
    const doc = new Y.Doc();
    const text = doc.getText("field");
    text.insert(0, "hello world");
    applyYText(text, "hello there world");
    assert.equal(text.toString(), "hello there world");
  });

  it("updates agenda Y.Text fields", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "empty");
    addAgendaEntry(doc);
    const [entry] = readDocument(doc).agendaEntries;
    updateAgendaEntry(doc, entry.id, {
      notesText: "Talk about Q3",
      icAgenda: { text: "- Ship it" },
    });
    const next = readDocument(doc).agendaEntries[0];
    assert.equal(next.notesText, "Talk about Q3");
    assert.equal(next.icAgenda.text, "- Ship it");
  });

  it("persists a custom theme on the shared document", () => {
    const doc = new Y.Doc();
    seedDocument(doc, "empty");
    assert.equal(
      addSavedTheme(doc, {
        id: "theme-1",
        name: "My look",
        colors: { "--document-body-color": "#abcdef" },
        appearance: {
          panelRadius: 8,
          panelBorder: 3,
          cardRadius: 5,
          cardBorder: 2,
          headerFont: "Inter",
          bodyFont: "Lora",
        },
      }),
      true,
    );
    const [theme] = readDocument(doc).settings.customThemes;
    assert.equal(theme.name, "My look");
    assert.equal(theme.colors["--document-body-color"], "#abcdef");
    assert.equal(theme.appearance.panelRadius, 8);
  });
});
