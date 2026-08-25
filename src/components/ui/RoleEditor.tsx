import { useEffect, useRef, useState } from "react";
import { publicUrl } from "../../publicUrl";
import { AddThemeGlyph } from "./Icons";
import { FeedbackDialog } from "./ConfirmDelete";
import styles from "./RoleEditor.module.css";

type RoleEditorProps = {
  roles: readonly string[];
  value: string;
  onChange: (role: string) => void;
  contentEdit: boolean;
  onEditPreset: () => void;
};

export function RoleEditor({
  roles,
  value,
  onChange,
  contentEdit,
  onEditPreset,
}: RoleEditorProps) {
  const [open, setOpen] = useState(false);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canSave = contentEdit;

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
    <div className={styles.roleEditor} data-layout="role-editor">
      <div className={styles.headers}>
        <div className={styles.roleSelector} ref={rootRef}>
          <p className={styles.label}>Role:</p>
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.trigger}
              aria-label="Role"
              aria-haspopup="listbox"
              aria-expanded={open}
              style={{
                ["--dropdown-mask" as string]: `url("${publicUrl("assets/dropdown.svg")}")`,
              }}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className={styles.triggerLabel}>{value}</span>
            </button>
            {open ? (
              <div className={styles.menu} role="listbox" aria-label="Role">
                {roles.map((role) => (
                  <div
                    key={role}
                    role="option"
                    aria-selected={role === value}
                    className={styles.option}
                    onClick={() => {
                      onChange(role);
                      setOpen(false);
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div
          className={`${styles.savePreset}${canSave ? "" : ` ${styles.savePresetDisabled}`}`}
        >
          <button
            type="button"
            className={styles.editPreset}
            aria-label="Edit Preset"
            disabled={contentEdit}
            onClick={onEditPreset}
          >
            Edit Preset
          </button>
          <div className={styles.spacer} aria-hidden />
          <p className={styles.saveLabel}>Save preset:</p>
          <button
            type="button"
            className={styles.saveButton}
            aria-label="save role preset"
            title="Save preset (coming soon)"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              setSaveNoticeOpen(true);
            }}
          >
            <AddThemeGlyph />
          </button>
        </div>
      </div>
      {saveNoticeOpen ? (
        <FeedbackDialog
          kind="save-role-preset"
          message="Save functionality not supported yet."
          onOk={() => setSaveNoticeOpen(false)}
        />
      ) : null}
    </div>
  );
}
