import type { Ref } from "react";
import { relativeLuminance } from "../../randomizeLook";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupVariant = "light" | "dark";

type ButtonGroupProps = {
  variant: ButtonGroupVariant;
  onYes?: () => void;
  onNo?: () => void;
  onOk?: () => void;
  noRef?: Ref<HTMLButtonElement>;
  okRef?: Ref<HTMLButtonElement>;
};

function cssToHex(raw: string) {
  if (raw.startsWith("#") && raw.length >= 7) return raw.slice(0, 7).toLowerCase();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = "#000000";
  ctx.fillStyle = raw || "#000000";
  const filled = ctx.fillStyle;
  if (typeof filled === "string" && filled.startsWith("#")) {
    return filled.slice(0, 7).toLowerCase();
  }
  return "#000000";
}

export function headerTextHex() {
  return cssToHex(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--document-header-text-color")
      .trim(),
  );
}

export function buttonGroupVariantForText(hex: string): ButtonGroupVariant {
  return relativeLuminance(hex) > 0.5 ? "dark" : "light";
}

export function ButtonGroup({
  variant,
  onYes,
  onNo,
  onOk,
  noRef,
  okRef,
}: ButtonGroupProps) {
  if (onOk) {
    return (
      <div className={`${styles.group} ${styles.solo} ${styles[variant]}`}>
        <button
          ref={okRef}
          type="button"
          className={`${styles.btn} ${styles.yes}`}
          onClick={onOk}
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.group} ${styles[variant]}`}>
      <button
        ref={noRef}
        type="button"
        className={`${styles.btn} ${styles.no}`}
        onClick={onNo}
      >
        NO
      </button>
      <button type="button" className={`${styles.btn} ${styles.yes}`} onClick={onYes}>
        YES
      </button>
    </div>
  );
}
