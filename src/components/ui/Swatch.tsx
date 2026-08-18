import styles from "./Swatch.module.css";

type SwatchProps = {
  color: string;
  label?: string;
};

export function Swatch({ color, label }: SwatchProps) {
  return (
    <span
      className={styles.swatch}
      style={{ background: color }}
      aria-label={label}
      title={label}
    />
  );
}

type SwatchRowProps = {
  colors: { color: string; label: string }[];
};

export function SwatchRow({ colors }: SwatchRowProps) {
  return (
    <div className={styles.swatches}>
      {colors.map((swatch) => (
        <Swatch key={swatch.label} color={swatch.color} label={swatch.label} />
      ))}
    </div>
  );
}

type ColorGroupProps = {
  label: string;
  colors: { color: string; label: string }[];
};

export function ColorGroup({ label, colors }: ColorGroupProps) {
  return (
    <div className={styles.colorGroup}>
      <span>{label}</span>
      {colors.map((swatch) => (
        <Swatch key={swatch.label} color={swatch.color} label={swatch.label} />
      ))}
    </div>
  );
}
