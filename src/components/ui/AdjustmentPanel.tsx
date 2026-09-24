import { useRef, useState, type CSSProperties, type DragEvent } from "react";
import { applyAppearance, type Appearance } from "../../appearance";
import {
  createDragGhost,
  hideNativeDragImage,
  moveDragGhost,
  removeDragGhost,
  type DragGhostSession,
} from "../../dragGhost";
import { createId, type SavedTheme } from "../../types/document";
import {
  THEMES,
  THEME_PRESET_ORDER,
  applyThemeColors,
  readThemeColors,
  themeCssVars,
  type ThemeId,
} from "../../themes";
import { ConfirmDelete, FeedbackDialog } from "./ConfirmDelete";
import { DefaultBtn } from "./DefaultBtn";
import { RandoIcon } from "./Icons";
import { ThemeConfigPanel } from "./ThemeConfigPanel";
import styles from "./AdjustmentPanel.module.css";

type AdjustmentPanelProps = {
  appearance: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  onRandomize: () => void;
  activeThemeId: string | null;
  customThemes: readonly SavedTheme[];
  onSelectTheme: (id: ThemeId) => void;
  onSelectSavedTheme: (theme: SavedTheme) => void;
  onSaveTheme: (theme: SavedTheme) => boolean;
  onThemeRemoved?: (id: string) => void;
  canPersist: boolean;
};

type ThemeDrag = {
  id: string;
  session: DragGhostSession;
};

let activeThemeDrag: ThemeDrag | null = null;

function keepThemeDropAlive(event: Event) {
  if (!activeThemeDrag?.session.outside) return;
  event.preventDefault();
  const transfer = (event as { dataTransfer?: DataTransfer }).dataTransfer;
  if (transfer) transfer.dropEffect = "move";
}

type Snapshot = {
  appearance: Appearance;
  colors: Record<string, string>;
};

export function AdjustmentPanel({
  appearance,
  onChange,
  onRandomize,
  activeThemeId,
  customThemes,
  onSelectTheme,
  onSelectSavedTheme,
  onSaveTheme,
  onThemeRemoved,
  canPersist,
}: AdjustmentPanelProps) {
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const snapshotRef = useRef<Snapshot | null>(null);

  const presets = THEME_PRESET_ORDER.filter((id) => !removedIds.has(id));
  const saved = customThemes.filter((theme) => !removedIds.has(theme.id));

  const openEditor = () => {
    snapshotRef.current = {
      appearance,
      colors: readThemeColors(),
    };
    setEditorOpen(true);
  };

  const revertAndClose = () => {
    const snapshot = snapshotRef.current;
    if (snapshot) {
      applyThemeColors(snapshot.colors);
      applyAppearance(snapshot.appearance);
      onChange(snapshot.appearance);
    }
    snapshotRef.current = null;
    setEditorOpen(false);
  };

  const commitSave = (name: string) => {
    if (!canPersist) {
      setSaveNoticeOpen(true);
      return;
    }
    if (!name) return;
    const theme: SavedTheme = {
      id: createId(),
      name,
      colors: readThemeColors(),
      appearance,
    };
    if (!onSaveTheme(theme)) {
      setSaveNoticeOpen(true);
      return;
    }
    snapshotRef.current = null;
    setEditorOpen(false);
  };

  return (
    <div className={styles.themeEditor} data-layout="theme-editor">
      <p className={styles.headerTitle}>Themes</p>
      <div className={styles.ui} data-layout="theme-ui">
        <div
          className={styles.themes}
          data-layout="themes"
          data-themes-container=""
        >
          <button
            type="button"
            className={styles.themeButton}
            aria-label="rando"
            onClick={onRandomize}
          >
            <RandoIcon />
          </button>
          {presets.map((id) => (
            <ThemeSwatchButton
              key={id}
              id={id}
              label={id}
              vars={themeCssVars(THEMES[id]) as CSSProperties}
              selected={activeThemeId === id}
              hidden={pendingDelete === id}
              onSelect={() => onSelectTheme(id)}
              onRequestDelete={setPendingDelete}
            />
          ))}
          {saved.map((theme) => (
            <ThemeSwatchButton
              key={theme.id}
              id={theme.id}
              label={theme.name}
              vars={theme.colors as CSSProperties}
              selected={activeThemeId === theme.id}
              hidden={pendingDelete === theme.id}
              onSelect={() => onSelectSavedTheme(theme)}
              onRequestDelete={setPendingDelete}
            />
          ))}
          <div className={styles.bar} aria-hidden />
          <DefaultBtn
            className={styles.editButton}
            aria-label="Edit theme"
            onClick={openEditor}
          >
            Edit
          </DefaultBtn>
        </div>
      </div>

      {editorOpen ? (
        <ThemeConfigPanel
          appearance={appearance}
          onChange={onChange}
          onClose={revertAndClose}
          onSave={commitSave}
          canPersist={canPersist}
        />
      ) : null}

      {saveNoticeOpen ? (
        <FeedbackDialog
          kind="save-theme"
          message="Save functionality not supported yet."
          onOk={() => setSaveNoticeOpen(false)}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDelete
          kind="theme"
          onYes={() => {
            const id = pendingDelete;
            setRemovedIds((prev) => new Set(prev).add(id));
            setPendingDelete(null);
            onThemeRemoved?.(id);
          }}
          onNo={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}

type ThemeSwatchButtonProps = {
  id: string;
  label: string;
  vars: CSSProperties;
  selected: boolean;
  hidden: boolean;
  onSelect: () => void;
  onRequestDelete: (id: string) => void;
};

function ThemeSwatchButton({
  id,
  label,
  vars,
  selected,
  hidden,
  onSelect,
  onRequestDelete,
}: ThemeSwatchButtonProps) {
  const suppressClick = useRef(false);

  return (
    <button
      type="button"
      className={`${styles.themeButton}${hidden ? ` ${styles.themeButtonHidden}` : ""}`}
      aria-label={label}
      aria-pressed={selected}
      data-theme-id={id}
      draggable
      style={vars}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onSelect();
      }}
      onDragStart={(event: DragEvent<HTMLButtonElement>) => {
        suppressClick.current = true;
        const session = createDragGhost(
          event.currentTarget,
          event.clientX,
          event.clientY,
          {
            clone: "self",
            container: event.currentTarget.closest("[data-themes-container]"),
          },
        );
        activeThemeDrag = { id, session };
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "move";
        hideNativeDragImage(event);
        event.currentTarget.classList.add(styles.themeDragging);
        document.addEventListener("dragover", keepThemeDropAlive);
      }}
      onDrag={(event) => {
        if (!activeThemeDrag || activeThemeDrag.id !== id) return;
        if (event.clientX === 0 && event.clientY === 0) return;
        moveDragGhost(activeThemeDrag.session, event.clientX, event.clientY);
      }}
      onDragEnd={(event) => {
        document.removeEventListener("dragover", keepThemeDropAlive);
        event.currentTarget.classList.remove(styles.themeDragging);
        const drag = activeThemeDrag;
        removeDragGhost(drag?.session ?? null);
        activeThemeDrag = null;
        if (!drag || drag.id !== id) return;
        if (drag.session.outside) onRequestDelete(id);
      }}
    >
      <ThemeSwatchGraphic />
    </button>
  );
}

function ThemeSwatchGraphic() {
  return (
    <svg
      className={styles.themeSwatch}
      width={30}
      height={30}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        fill="var(--document-body-color)"
      />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        stroke="black"
        strokeOpacity="0.5"
      />
      <path
        d="M6 2.5H26C27.933 2.5 29.5 4.067 29.5 6V26C29.5 27.933 27.933 29.5 26 29.5H6C4.067 29.5 2.5 27.933 2.5 26V6C2.5 4.067 4.067 2.5 6 2.5Z"
        fill="var(--containers-panel-surface)"
        stroke="var(--containers-panel-stroke-color)"
      />
      <path
        d="M7 5.5H25C25.8284 5.5 26.5 6.17157 26.5 7V14C26.5 14.8284 25.8284 15.5 25 15.5H7C6.17157 15.5 5.5 14.8284 5.5 14V7C5.5 6.17157 6.17157 5.5 7 5.5Z"
        fill="var(--containers-card1-surface-color)"
        stroke="var(--containers-card1-stroke-color)"
      />
      <path
        d="M7 18.5H25C25.8284 18.5 26.5 19.1716 26.5 20V25C26.5 25.8284 25.8284 26.5 25 26.5H7C6.17157 26.5 5.5 25.8284 5.5 25V20C5.5 19.1716 6.17157 18.5 7 18.5Z"
        fill="var(--containers-card2-surface-color)"
        stroke="var(--containers-card1-stroke-color)"
      />
    </svg>
  );
}
