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
        <img
          className={styles.check}
          src={publicUrl("assets/check.svg")}
          alt=""
          width={13}
          height={13}
        />
      ) : null}
    </button>
  );
}
