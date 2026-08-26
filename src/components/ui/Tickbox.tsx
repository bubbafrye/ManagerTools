import { publicUrl } from "../../publicUrl";
import styles from "./Tickbox.module.css";

type TickboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Tickbox({ checked, onChange, label }: TickboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={styles.tickbox}
      onClick={() => onChange(!checked)}
    >
      {checked ? (
        <span
          className={styles.check}
          style={{
            ["--tickbox-check-mask" as string]: `url("${publicUrl("assets/check.svg")}")`,
          }}
          aria-hidden
        />
      ) : null}
    </button>
  );
}
