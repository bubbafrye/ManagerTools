import { useEffect, useRef, useState } from "react";
import {
  FONT_OPTIONS,
  fontStack,
  type Appearance,
  type FontName,
} from "../../appearance";
import { ColorGroup } from "./Swatch";
import { Tickbox } from "./Tickbox";
import styles from "./AdjustmentPanel.module.css";

type AdjustmentPanelProps = {
  appearance: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  showCompleted: boolean;
  onShowCompletedChange: (showCompleted: boolean) => void;
};

export function AdjustmentPanel({
  appearance,
  onChange,
  showCompleted,
  onShowCompletedChange,
}: AdjustmentPanelProps) {
  return (
    <div className={styles.panel} data-layout="adjustment-panel">
      <div className={styles.row}>
        <NumberField
          label="panel radius"
          value={appearance.panelRadius}
          onChange={(panelRadius) => onChange({ panelRadius })}
        />
        <NumberField
          label="panel border"
          value={appearance.panelBorder}
          onChange={(panelBorder) => onChange({ panelBorder })}
        />
        <NumberField
          label="card radius"
          value={appearance.cardRadius}
          onChange={(cardRadius) => onChange({ cardRadius })}
        />
        <NumberField
          label="card border"
          value={appearance.cardBorder}
          onChange={(cardBorder) => onChange({ cardBorder })}
        />
        <div className={styles.toggle}>
          <Tickbox
            checked={showCompleted}
            onChange={onShowCompletedChange}
            label="show completed"
          />
          <button
            type="button"
            className={styles.toggleLabel}
            tabIndex={-1}
            onClick={() => onShowCompletedChange(!showCompleted)}
          >
            show completed
          </button>
        </div>
      </div>
      <div className={styles.row}>
        <FontSelect
          ariaLabel="header font"
          value={appearance.headerFont}
          onChange={(headerFont) => onChange({ headerFont })}
        />
        <FontSelect
          ariaLabel="body font"
          value={appearance.bodyFont}
          onChange={(bodyFont) => onChange({ bodyFont })}
        />
        <ColorGroup
          label="font"
          colors={[
            { color: "var(--document-text-color)", label: "font color" },
          ]}
        />
        <ColorGroup
          label="body"
          colors={[
            { color: "var(--document-body-color)", label: "body color" },
          ]}
        />
        <ColorGroup
          label="accent 1"
          colors={[
            { color: "var(--ui-ui-surface-color)", label: "accent 1 surface" },
            { color: "var(--ui-ui-stroke-color)", label: "accent 1 stroke" },
          ]}
        />
        <ColorGroup
          label="accent 2"
          colors={[
            { color: "var(--ui-ui2-surface-color)", label: "accent 2 surface" },
            { color: "var(--ui-ui2-stroke-color)", label: "accent 2 stroke" },
          ]}
        />
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className={styles.numberField}>
      {label}
      <input
        className={styles.numberInput}
        type="number"
        min={0}
        value={value}
        aria-label={label}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(next) && next >= 0) onChange(next);
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
