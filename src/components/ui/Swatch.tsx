import { useEffect, useState } from "react";
import { LOOK_TOKENS_CHANGED } from "../../randomizeLook";
import styles from "./Swatch.module.css";

type SwatchProps = {
  token: string;
  label: string;
};

function tokenToHex(token: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  if (raw.startsWith("#") && raw.length === 7) return raw.toLowerCase();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = "#000000";
  ctx.fillStyle = raw || "#000000";
  const filled = ctx.fillStyle;
  if (typeof filled === "string" && filled.startsWith("#")) {
    if (filled.length === 4) {
      return `#${filled[1]}${filled[1]}${filled[2]}${filled[2]}${filled[3]}${filled[3]}`;
    }
    return filled.slice(0, 7).toLowerCase();
  }
  return "#000000";
}

export function Swatch({ token, label }: SwatchProps) {
  const [hex, setHex] = useState(() => tokenToHex(token));

  useEffect(() => {
    const sync = () => setHex(tokenToHex(token));
    window.addEventListener(LOOK_TOKENS_CHANGED, sync);
    return () => window.removeEventListener(LOOK_TOKENS_CHANGED, sync);
  }, [token]);

  return (
    <input
      type="color"
      className={styles.swatch}
      value={hex}
      aria-label={label}
      title={label}
      onPointerDown={() => setHex(tokenToHex(token))}
      onChange={(event) => {
        const next = event.target.value;
        setHex(next);
        document.documentElement.style.setProperty(token, next);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
    />
  );
}

type SwatchRowProps = {
  colors: { token: string; label: string }[];
};

export function SwatchRow({ colors }: SwatchRowProps) {
  return (
    <div className={styles.swatches}>
      {colors.map((swatch) => (
        <Swatch key={swatch.label} token={swatch.token} label={swatch.label} />
      ))}
    </div>
  );
}

type ColorGroupProps = {
  label: string;
  colors: { token: string; label: string }[];
  compact?: boolean;
};

export function ColorGroup({ label, colors, compact = false }: ColorGroupProps) {
  return (
    <div
      className={`${styles.colorGroup}${compact ? ` ${styles.colorGroupCompact}` : ""}`}
    >
      <span>{label}</span>
      {colors.map((swatch) => (
        <Swatch key={swatch.label} token={swatch.token} label={swatch.label} />
      ))}
    </div>
  );
}
