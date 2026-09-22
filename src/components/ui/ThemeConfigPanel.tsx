import { useEffect, useRef, useState } from "react";
import {
  BORDER_SLIDER_MAX,
  CORNER_SLIDER_MAX,
  FONT_OPTIONS,
  fontStack,
  geometryFromSliders,
  type Appearance,
  type FontName,
} from "../../appearance";
import { publicUrl } from "../../publicUrl";
import { AddThemeGlyph } from "./Icons";
import { Modal } from "./Modal";
import { ColorGroup, Swatch } from "./Swatch";
import { ThemeSlider } from "./ThemeSlider";
import styles from "./ThemeConfigPanel.module.css";

type ThemeConfigPanelProps = {
  appearance: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  onClose: () => void;
  onSave: (name: string) => void;
  canPersist: boolean;
};

export function ThemeConfigPanel({
  appearance,
  onChange,
  onClose,
  onSave,
  canPersist,
}: ThemeConfigPanelProps) {
  const [name, setName] = useState("");
  const canSave = name.trim().length > 0;

  return (
    <Modal
      className={styles.dialog}
      data-layout="theme-config"
      aria-labelledby="theme-editor-title"
      onClose={onClose}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close theme editor"
        onClick={onClose}
      >
        <img
          src={publicUrl("assets/close-theme.svg")}
          alt=""
          width={20}
          height={20}
        />
      </button>
      <div className={styles.content}>
        <h2 id="theme-editor-title" className={styles.title}>
          Theme editor
        </h2>
        <div className={styles.base}>
          <div className={styles.fonts}>
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
            <ColorGroup
              label="background"
              colors={[
                { token: "--document-body-color", label: "page color" },
              ]}
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
          </div>
          <div className={styles.sliders}>
            <ThemeSlider
              label="borders"
              value={appearance.panelBorder}
              min={0}
              max={BORDER_SLIDER_MAX}
              onChange={(panelBorder) =>
                onChange(geometryFromSliders(appearance.panelRadius, panelBorder))
              }
            />
            <ThemeSlider
              label="corners"
              value={appearance.panelRadius}
              min={0}
              max={CORNER_SLIDER_MAX}
              onChange={(panelRadius) =>
                onChange(geometryFromSliders(panelRadius, appearance.panelBorder))
              }
            />
          </div>
        </div>
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.card1}`}>
            <p className={styles.cardTitle}>Primary Card</p>
            <div className={styles.cardConfig}>
              <ColorGroup
                label="panel"
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
                label="accent"
                compact
                colors={[
                  {
                    token: "--ui-ui-surface-color",
                    label: "accent 1 surface",
                  },
                  {
                    token: "--ui-ui-stroke-color",
                    label: "accent 1 stroke",
                  },
                ]}
              />
            </div>
          </div>
          <div className={`${styles.card} ${styles.card2}`}>
            <p className={styles.cardTitle}>Secondary Card</p>
            <div className={styles.cardConfig}>
              <ColorGroup
                label="panel"
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
                label="accent"
                compact
                colors={[
                  {
                    token: "--ui-ui2-surface-color",
                    label: "accent 2 surface",
                  },
                  {
                    token: "--ui-ui2-stroke-color",
                    label: "accent 2 stroke",
                  },
                ]}
              />
            </div>
          </div>
        </div>
        <div className={styles.saveRow}>
          <input
            className={styles.name}
            type="text"
            value={name}
            placeholder="Name theme..."
            aria-label="Theme name"
            onChange={(event) => setName(event.target.value)}
          />
          <button
            type="button"
            className={styles.save}
            aria-label="Save theme"
            disabled={canPersist && !canSave}
            onClick={() => {
              if (!canPersist) {
                onSave("");
                return;
              }
              if (!canSave) return;
              onSave(name.trim());
            }}
          >
            <span>Save theme</span>
            <AddThemeGlyph />
          </button>
        </div>
      </div>
    </Modal>
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
        style={{
          fontFamily: fontStack(value),
          ["--dropdown-mask" as string]: `url("${publicUrl("assets/dropdown.svg")}")`,
        }}
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
