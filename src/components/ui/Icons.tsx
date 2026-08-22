import { useId, type CSSProperties } from "react";
import { publicUrl } from "../../publicUrl";
import styles from "./Icons.module.css";

type IconProps = {
  className?: string;
};

function maskStyle(path: string): CSSProperties {
  const image = `url("${publicUrl(path)}")`;
  return {
    WebkitMaskImage: image,
    maskImage: image,
  };
}

export function AddItemIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.addItem} ${className ?? ""}`}
      style={maskStyle("assets/add-item.svg")}
      data-icon="add-item"
      aria-hidden
    />
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.edit} ${className ?? ""}`}
      style={maskStyle("assets/edit.svg")}
      data-icon="edit"
      aria-hidden
    />
  );
}

export function RandoIcon({ className }: IconProps) {
  return (
    <img
      className={`${styles.icon} ${styles.rando} ${className ?? ""}`}
      src={publicUrl("assets/rando.svg")}
      alt=""
      width={30}
      height={30}
    />
  );
}

export function AddThemeIcon({ className }: IconProps) {
  const clipId = useId();

  return (
    <svg
      className={`${styles.icon} ${styles.addTheme} ${className ?? ""}`}
      width={52}
      height={52}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="1"
          y="1"
          width="50"
          height="50"
          fill="var(--containers-panel-surface)"
        />
        <rect
          x="3"
          y="3"
          width="46"
          height="46"
          fill="var(--containers-card2-surface-color)"
        />
        <path
          d="M18.5825 22.6364H33.8552L26.2188 32.8182L18.5825 22.6364Z"
          fill="var(--containers-card2-stroke-color)"
        />
        <path
          d="M42 43.2275H11V27.7275H16.167V38.0605H36.833V27.7275H42V43.2275Z"
          fill="var(--containers-card2-stroke-color)"
        />
        <rect
          x="24"
          y="17"
          width="5"
          height="9"
          fill="var(--containers-card2-stroke-color)"
        />
        <rect
          width="5"
          height="4"
          transform="matrix(1 0 0 -1 24 16)"
          fill="var(--containers-card2-stroke-color)"
        />
        <rect
          width="5"
          height="3"
          transform="matrix(1 0 0 -1 24 11)"
          fill="var(--containers-card2-stroke-color)"
        />
        <path d="M50 1V2H2V50H1V1H50Z" fill="white" fillOpacity="0.7" />
        <path
          d="M2 51L2 50L50 50L50 2L51 2L51 51L2 51Z"
          fill="black"
          fillOpacity="0.7"
        />
      </g>
      <rect
        x="0.5"
        y="0.5"
        width="51"
        height="51"
        stroke="black"
        strokeOpacity="0.5"
      />
      <defs>
        <clipPath id={clipId}>
          <rect x="1" y="1" width="50" height="50" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AdjustIcon({ className }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles.adjust} ${className ?? ""}`}
      style={maskStyle("assets/adjust.svg")}
      aria-hidden
    />
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <span className={`${styles.trash} ${className ?? ""}`} aria-hidden>
      <img
        className={styles.trashDefault}
        src={publicUrl("assets/trash.svg")}
        alt=""
        width={22}
        height={25}
      />
      <img
        className={styles.trashOver}
        src={publicUrl("assets/trash-over.svg")}
        alt=""
        width={22}
        height={25}
      />
    </span>
  );
}
