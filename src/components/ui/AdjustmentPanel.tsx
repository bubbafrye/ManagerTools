import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import {
  FONT_OPTIONS,
  cardRadiiFromPanel,
  fontStack,
  type Appearance,
  type FontName,
} from "../../appearance";
import {
  createDragGhost,
  hideNativeDragImage,
  moveDragGhost,
  removeDragGhost,
  type DragGhostSession,
} from "../../dragGhost";
import {
  THEMES,
  THEME_PRESET_ORDER,
  themeCssVars,
  type ThemeId,
} from "../../themes";
import { ColorGroup, Swatch } from "./Swatch";
import { ConfirmDelete, FeedbackDialog } from "./ConfirmDelete";
import { AddThemeIcon, RandoIcon } from "./Icons";
import styles from "./AdjustmentPanel.module.css";

type AdjustmentPanelProps = {
  appearance: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  onRandomize: () => void;
  activeThemeId: ThemeId | null;
  onSelectTheme: (id: ThemeId) => void;
  onThemeRemoved?: (id: ThemeId) => void;
};

type ThemeDrag = {
  id: ThemeId;
  session: DragGhostSession;
};

let activeThemeDrag: ThemeDrag | null = null;

function keepThemeDropAlive(event: Event) {
  if (!activeThemeDrag?.session.outside) return;
  event.preventDefault();
  const transfer = (event as { dataTransfer?: DataTransfer }).dataTransfer;
  if (transfer) transfer.dropEffect = "move";
}

export function AdjustmentPanel({
  appearance,
  onChange,
  onRandomize,
  activeThemeId,
  onSelectTheme,
  onThemeRemoved,
}: AdjustmentPanelProps) {
  const [removedIds, setRemovedIds] = useState<ReadonlySet<ThemeId>>(
    () => new Set(),
  );
  const [pendingDelete, setPendingDelete] = useState<ThemeId | null>(null);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);

  const row1 = THEME_PRESET_ORDER.row1.filter((id) => !removedIds.has(id));
  const row2 = THEME_PRESET_ORDER.row2.filter((id) => !removedIds.has(id));

  return (
    <div className={styles.themeEditor} data-layout="theme-editor">
      <div
        className={styles.themes}
        data-layout="themes"
        data-themes-container=""
      >
        <div className={styles.themeRow}>
          <button
            type="button"
            className={styles.themeButton}
            aria-label="rando"
            onClick={onRandomize}
          >
            <RandoIcon />
          </button>
          {row1.map((id) => (
            <ThemeSwatchButton
              key={id}
              id={id}
              selected={activeThemeId === id}
              hidden={pendingDelete === id}
              onSelect={onSelectTheme}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </div>
        <div className={styles.themeRow}>
          {row2.map((id) => (
            <ThemeSwatchButton
              key={id}
              id={id}
              selected={activeThemeId === id}
              hidden={pendingDelete === id}
              onSelect={onSelectTheme}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </div>
      </div>

      <div className={styles.spacer} aria-hidden />

      <div className={styles.panel} data-layout="adjustment-panel">
        <button
          type="button"
          className={styles.saveTheme}
          aria-label="save theme"
          title="Save theme (coming soon)"
          onClick={() => setSaveNoticeOpen(true)}
        >
          <AddThemeIcon />
        </button>
        <div className={styles.options}>
          <div className={styles.row}>
            <div className={styles.fontPair}>
              <FontSelect
                ariaLabel="header font"
                value={appearance.headerFont}
                onChange={(headerFont) => onChange({ headerFont })}
              />
              <Swatch
                token="--document-header-text-color"
                label="header color"
              />
            </div>
            <div className={styles.fontPair}>
              <FontSelect
                ariaLabel="body font"
                value={appearance.bodyFont}
                onChange={(bodyFont) => onChange({ bodyFont })}
              />
              <Swatch
                token="--document-body-text-color"
                label="body text color"
              />
            </div>
            <NumberField
              label="corners"
              value={appearance.panelRadius}
              onChange={(panelRadius) =>
                onChange({
                  panelRadius,
                  cardRadius: cardRadiiFromPanel(panelRadius),
                })
              }
            />
            <NumberField
              label="outer borders"
              value={appearance.panelBorder}
              onChange={(panelBorder) => onChange({ panelBorder })}
            />
            <NumberField
              label="inner borders"
              value={appearance.cardBorder}
              onChange={(cardBorder) => onChange({ cardBorder })}
            />
          </div>
          <div className={styles.row}>
            <ColorGroup
              label="page"
              colors={[{ token: "--document-body-color", label: "page color" }]}
            />
            <ColorGroup
              label="panels"
              compact
              colors={[
                {
                  token: "--containers-panel-surface",
                  label: "panels surface",
                },
                {
                  token: "--containers-panel-stroke-color",
                  label: "panels stroke",
                },
              ]}
            />
            <ColorGroup
              label="section 1"
              compact
              colors={[
                {
                  token: "--containers-card1-surface-color",
                  label: "section 1 surface",
                },
                {
                  token: "--containers-card1-stroke-color",
                  label: "section 1 stroke",
                },
              ]}
            />
            <ColorGroup
              label="section 2"
              compact
              colors={[
                {
                  token: "--containers-card2-surface-color",
                  label: "section 2 surface",
                },
                {
                  token: "--containers-card2-stroke-color",
                  label: "section 2 stroke",
                },
              ]}
            />
            <ColorGroup
              label="accent 1"
              compact
              colors={[
                { token: "--ui-ui-surface-color", label: "accent 1 surface" },
                { token: "--ui-ui-stroke-color", label: "accent 1 stroke" },
              ]}
            />
            <ColorGroup
              label="accent 2"
              compact
              colors={[
                { token: "--ui-ui2-surface-color", label: "accent 2 surface" },
                { token: "--ui-ui2-stroke-color", label: "accent 2 stroke" },
              ]}
            />
          </div>
        </div>
      </div>

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
  id: ThemeId;
  selected: boolean;
  hidden: boolean;
  onSelect: (id: ThemeId) => void;
  onRequestDelete: (id: ThemeId) => void;
};

function ThemeSwatchButton({
  id,
  selected,
  hidden,
  onSelect,
  onRequestDelete,
}: ThemeSwatchButtonProps) {
  const vars = themeCssVars(THEMES[id]) as CSSProperties;
  const suppressClick = useRef(false);

  return (
    <button
      type="button"
      className={`${styles.themeButton}${hidden ? ` ${styles.themeButtonHidden}` : ""}`}
      aria-label={id}
      aria-pressed={selected}
      data-theme-id={id}
      draggable
      style={vars}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onSelect(id);
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

/** Inline of /assets/theme-swatch.svg so theme CSS vars on the button apply. */
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

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <label className={styles.numberField}>
      {label}
      <input
        className={styles.numberInput}
        type="number"
        min={0}
        value={draft}
        aria-label={label}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          if (raw === "") return;
          const next = Number.parseInt(raw, 10);
          if (Number.isFinite(next) && next >= 0) onChange(next);
        }}
        onBlur={() => {
          setDraft(String(value));
        }}
      />
    </label>
  );
}

type FontSelectProps = {
  ariaLabel: string;
  value: FontName;
  onChange: (value: FontName) => void;
};

function FontSelect({ ariaLabel, value, onChange }: FontSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.fontSelect} ref={rootRef}>
      <button
        type="button"
        className={styles.fontTrigger}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ fontFamily: fontStack(value) }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {value}
      </button>
      {open ? (
        <div className={styles.fontMenu} role="listbox" aria-label={ariaLabel}>
          {FONT_OPTIONS.map((font) => (
            <div
              key={font.name}
              role="option"
              aria-selected={font.name === value}
              className={styles.fontOption}
              style={{ fontFamily: font.stack }}
              onClick={() => {
                onChange(font.name);
                setOpen(false);
              }}
            >
              {font.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
